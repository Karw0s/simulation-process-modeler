import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { CustomPropsProvider } from '../../providers/CustomPropsProvider';
import customPaletteProvider from '../../custom-elements/palette/index';
import { InjectionNames, Modeler, OriginalPropertiesProvider, PropertiesPanelModule } from '../../providers/bpmn-js';
// @ts-ignore
import qsExtension from 'src/assets/gsx.json';
import Canvg, { presets } from 'canvg';
import { CodeDialogComponent } from './code-dialog/code-dialog.component';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { DiagramService } from '../diagram.service';
import { CanComponentDeactivate } from '../../shared/unsaved-changes.guard';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';
import { Diagram } from '../../models/diagram';
import { MatSnackBar } from '@angular/material/snack-bar';


const HIGH_PRIORITY = 1500;

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.css'],
})
export class ModelerComponent implements OnInit, OnDestroy, AfterContentInit, CanComponentDeactivate {

  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Input() private url: string;
  @ViewChild('diagramContainer', {static: true}) private el: ElementRef;
  @ViewChild('propertiesPanel', {static: true}) private pp: ElementRef;
  private bpmnJS: any;
  private diagramId: number;
  private diagramXml: string;
  private diagramSvg;
  private codeDialogRef;
  private diagramElement;
  isLoading = false;
  private isNewDiagram = false;
  private unsavedChanges = false;
  private saveDialogRef;
  private snackBarRef;

  constructor(private diagramService: DiagramService,
              private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.bpmnJS = new Modeler({
        additionalModules: [
          PropertiesPanelModule,
          //
          {[InjectionNames.bpmnPropertiesProvider]: ['type', OriginalPropertiesProvider.propertiesProvider[1]]},
          {[InjectionNames.propertiesProvider]: ['type', CustomPropsProvider]},

          customPaletteProvider,
        ],
        keyboard: {
          bindTo: document.body
        },
        moddleExtensions: {
          gs: qsExtension
        }
      }
    );

    this.bpmnJS.on('import.done', ({error}) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });

    // open dialog on right click
    this.bpmnJS.on('element.contextmenu', HIGH_PRIORITY, (event) => {
      event.originalEvent.preventDefault();
      event.originalEvent.stopPropagation();

      const moddle = this.bpmnJS.get('moddle');
      const modeling = this.bpmnJS.get('modeling');

      if (event.element.businessObject.$type !== 'bpmn:Process') {
        const businessObject = getBusinessObject(event.element);
        this.diagramElement = event.element;

        let GroovyElement = getExtensionElement(businessObject, 'gsx:GroovyScript');
        const script = GroovyElement ? GroovyElement.script : '';

        this.codeDialogRef = this.dialog.open(CodeDialogComponent, {
          minHeight: '575px',
          width: '650px',
          data: {code: script, readOnly: false}
        });

        this.codeDialogRef.afterClosed().subscribe(result => {

          console.log('code dialog result: ' + result);
          if (typeof result !== 'undefined') {
            let extensionElements = businessObject.extensionElements;
            if (!extensionElements) {
              extensionElements = moddle.create('bpmn:ExtensionElements');
            }

            if (!GroovyElement) {
              GroovyElement = moddle.create('gsx:GroovyScript');
              extensionElements.get('values').push(GroovyElement);
            }

            GroovyElement.script = result;

            modeling.updateProperties(this.diagramElement, {
              extensionElements
            });
          }
        });
      }
    });

    function getExtensionElement(element, type) {
      if (!element.extensionElements) {
        return;
      }

      if (element.extensionElements.values) {
        return element.extensionElements.values.filter((extensionElement) => {
          return extensionElement.$instanceOf(type);
        })[0];
      }
    }
  }

  ngAfterContentInit(): void {
    this.bpmnJS.attachTo(this.el.nativeElement);
    this.bpmnJS.get('propertiesPanel').attachTo(this.pp.nativeElement);

    this.loadDiagram();
  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    // todo: fix check unsaved
    return !this.unsavedChanges;
  }

  loadDiagram() {
    this.isLoading = true;
    this.route.paramMap.subscribe((params) => {
      this.diagramId = +params.get('id');

      if (!isNaN(this.diagramId) && params.get('id') != null) {
        this.diagramService.getDiagram(this.diagramId)
          .pipe(finalize(
            () => this.isLoading = false
          ))
          .subscribe(
            diagram => {
              this.importDiagramAsync(diagram.diagramXML);
              this.isNewDiagram = false;
            },
            error => {
              this.snackBarRef = this.snackBar.open('Can not load diagram', 'Try again', {
                duration: 4000,
                verticalPosition: 'top',
                horizontalPosition: 'end'
              });
              this.snackBarRef.onAction().subscribe(() => {
                console.log('The snack-bar action was triggered!');
                this.loadDiagram();
              });
              console.log(`can't load diagram ${this.diagramId}\n ${error.toString()}`);
              console.log(error);
              console.log(error.status);
              // this.showError(error.error);
            }
          );
      } else {
        this.bpmnJS.createDiagram();
        this.isLoading = false;
        this.isNewDiagram = true;
        this.getXML().then(result => {this.diagramXml = result.xml;});
        this.diagramService.setDiagram(new Diagram(null, 'newDiagram', this.diagramXml));
      }
      console.log(`is new Diagram: ${this.isNewDiagram}`);
    });
  }

  // loadUrl(url: string) {
  //
  //   return (
  //     this.http.get(url, {responseType: 'text'})
  //       .pipe(
  //         catchError(err => throwError(err)),
  //         importDiagram(this.bpmnJS))
  //       .subscribe(
  //         (warnings) => {
  //           this.importDone.emit({
  //             type: 'success',
  //             warnings
  //           });
  //         },
  //         (err) => {
  //           this.importDone.emit({
  //             type: 'error',
  //             error: err
  //           });
  //         }
  //       )
  //   );
  // }

  toolBarEvent(action: string) {
    console.log(`Modeler received ${action} from toolbar.`);
    switch (action) {
      case 'new_diagram':
        this.router.navigate(['/modeler/new']);
        break;
      case 'open_diagram_file':
        this.bpmnJS.importXML(this.diagramService.getLoadedDiagramXml());
        this.isNewDiagram = true;
        break;
      case 'save_as_new':
        if (this.diagramService.getLoadedDiagramId()) {
          this.isNewDiagram = true;
          this.saveDiagram();
        }
        break;
      case 'rename':
        this.getXML().then(result => {this.diagramXml = result.xml;});
        this.updateDiagram();
        break;
      case 'undo':
        this.triggerBPMNJSEditorAction('undo');
        break;
      case 'redo':
        this.triggerBPMNJSEditorAction('redo');
        break;
      case 'download_xml':
        if (this.diagramService.getLoadedDiagramId()) {
          this.save();
          this.unsavedChanges = false;
        }
        break;
      case 'download_img':
        if (this.diagramService.getLoadedDiagramId()) {
          this.downloadImg();
        }
        break;
      case 'save_to_server':
        // if (this.diagramService.getLoadedDiagramId()) {
        this.saveDiagram();
        // }
        break;
      case 'start_sim':
        console.log('start_sim');
        break;
      case 'stop_sim':
        console.log('stop_sim');
        break;
    }
  }

  triggerBPMNJSEditorAction(actionName: string) {
    this.bpmnJS.injector._instances.editorActions.trigger(actionName);
  }

  save() {
    this.bpmnJS.saveXML({format: true}).then(result => {
      this.downloadFile(result.xml, 'application/xml', `${this.diagramService.getLoadedDiagramName()}.bpmn`);
    });
  }

  downloadImg() {
    this.bpmnJS.saveSVG().then(result => {
      console.log(result);
      this.downloadFile(result.svg, 'image/svg+xml', `${this.diagramService.getLoadedDiagramName()}.svg`);
    });
  }

  downloadFile(data, dataType, fileName) {
    const blob = new Blob([data], {type: dataType});
    saveAs(blob, fileName);
  }

  saveDiagram() {
    this.getXML().then(result => {this.diagramXml = result.xml;});

    if (this.isNewDiagram) {
      this.saveDialogRef = this.dialog.open(SaveDialogComponent, {
        data: {
          title: 'Save Diagram',
          name: this.diagramService.getLoadedDiagramName()
        }
      });

      this.saveDialogRef.afterClosed().subscribe(
        diagramName => {
          if (diagramName !== undefined) {
            this.isLoading = true;
            this.generateDiagramImage().then(image => {
              this.diagramService.createDiagram(diagramName, this.diagramXml, image).subscribe(
                data => {
                  this.unsavedChanges = false;
                  this.router.navigate(['/modeler', data.id]);
                  this.snackBar.open(`Diagram ${diagramName} saved.`, null, {
                    duration: 2000,
                    verticalPosition: 'top',
                    horizontalPosition: 'end'
                  });
                },
                error => {
                  console.log(error);
                  this.snackBar.open(`Cannot save. Try again.`, null, {
                    duration: 2000,
                    verticalPosition: 'top',
                    horizontalPosition: 'end',
                    panelClass: ['error-snackbar']
                  });
                }
              );
            });
          }
        });
    } else {
      this.updateDiagram();
      this.unsavedChanges = false;
    }
  }

  private async getXML() {
    const xml = await this.bpmnJS.saveXML({format: true});
    console.log(xml);
    return xml;
  }

  private updateDiagram() {
    this.generateDiagramImage().then(image => {
      this.diagramService.updateDiagram(this.diagramId, this.diagramService.getLoadedDiagramName(), this.diagramXml, image)
        .subscribe(
          res => {
            this.isLoading = false;
            console.log(res);
            this.snackBar.open('Saved successfully.', null, {
              duration: 2000,
              verticalPosition: 'top',
              horizontalPosition: 'end',
              panelClass: ['success-snackbar']
            });
          },
          error => {
            console.log(error);
            this.snackBar.open(`Cannot save. Try again.`, null, {
              duration: 2000,
              verticalPosition: 'top',
              horizontalPosition: 'end',
              panelClass: ['error-snackbar']
            });
          });
    });
  }

  private async generateDiagramImage(): Promise<Blob> {
    let svg = await this.bpmnJS.saveSVG();
    this.diagramSvg = svg.svg;
    svg = svg.svg;
    const canvas = new OffscreenCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    const v = await Canvg.from(ctx, svg, presets.offscreen());

    await v.render();

    return await canvas.convertToBlob();
  }

  private async importDiagramAsync(diagramXML: string | ArrayBuffer) {
    try {
      const result = await this.bpmnJS.importXML(diagramXML);
      const {warnings} = result;
      console.log(warnings);
    } catch (e) {
      console.log(e);
    }
  }
}
