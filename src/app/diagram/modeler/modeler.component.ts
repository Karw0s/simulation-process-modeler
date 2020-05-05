import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { CustomPropsProvider } from '../../providers/CustomPropsProvider';
import customPaletteProvider from '../../custom-elements/palette/index';
import { InjectionNames, Modeler, OriginalPropertiesProvider, PropertiesPanelModule } from '../../providers/bpmn-js';
import { importDiagram } from './rx';
// @ts-ignore
import qsExtension from 'src/assets/gs.json';
import Canvg, { presets } from 'canvg';
import { CodeDialogComponent } from './code-dialog/code-dialog.component';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { DiagramService } from '../diagram.service';
import { CanComponentDeactivate } from '../../shared/unsaved-changes.guard';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';
import { Diagram } from '../../models/diagram';


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

  constructor(private diagramService: DiagramService,
              private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
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

        let GroovyElement = getExtensionElement(businessObject, 'gs:GroovyNode');
        const script = GroovyElement ? GroovyElement.script : '';

        this.codeDialogRef = this.dialog.open(CodeDialogComponent, {
          height: '575px',
          width: '650px',
          data: {code: script}
        });

        this.codeDialogRef.afterClosed().subscribe(result => {

          console.log('code dialog result: ' + result);
          if (result) {
            let extensionElements = businessObject.extensionElements;
            if (!extensionElements) {
              extensionElements = moddle.create('bpmn:ExtensionElements');
            }

            if (!GroovyElement) {
              GroovyElement = moddle.create('gs:GroovyNode');
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

    this.isLoading = true;
    this.bpmnJS.attachTo(this.el.nativeElement);
    this.bpmnJS.get('propertiesPanel').attachTo(this.pp.nativeElement);

    this.route.paramMap.subscribe((params) => {
      this.diagramId = +params.get('id');

      if (!isNaN(this.diagramId) && params.get('id') != null) {
        this.diagramService.getDiagram(this.diagramId)
          .pipe(finalize(
            () => this.isLoading = false
          ))
          .subscribe(
            diagram => {
              this.bpmnJS.importXML(diagram.diagramXML);
              this.isNewDiagram = false;
            },
            error => {
              console.log(`can't load diagram ${this.diagramId}`);
            }
          );
      } else {
        this.bpmnJS.createDiagram();
        this.isLoading = false;
        this.isNewDiagram = true;
        this.getXML();
        this.diagramService.setDiagram(new Diagram(null, 'newDiagram', this.diagramXml));
      }
      console.log(`is new Diagram: ${this.isNewDiagram}`);
    });

  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    // todo: fix check unsaved
    return !this.unsavedChanges;
  }

  loadUrl(url: string) {

    return (
      this.http.get(url, {responseType: 'text'}).pipe(
        catchError(err => throwError(err)),
        importDiagram(this.bpmnJS)
      ).subscribe(
        (warnings) => {
          this.importDone.emit({
            type: 'success',
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      )
    );
  }

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
      case 'undo':
        this.triggerBPMNJSEditorAction('undo');
        break;
      case 'redo':
        this.triggerBPMNJSEditorAction('redo');
        break;
      case 'download_xml':
        this.save();
        this.unsavedChanges = false;
        break;
      case 'download_img':
        this.downloadImg();
        break;
      case 'save_to_server':
        this.saveDiagram();
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
    this.bpmnJS.saveXML({format: true}, (err, xml) => {
      this.downloadFile(xml, 'application/xml', 'grapf.bpmn');
      return xml;
    });
  }

  downloadImg() {
    this.bpmnJS.saveSVG((err, svg) => {
      console.log(svg);
      this.downloadFile(svg, 'image/svg+xml', 'diagram.svg');
    });
  }

  downloadFile(data, dataType, fileName) {
    const blob = new Blob([data], {type: dataType});
    saveAs(blob, fileName);
  }

  getSvg() {
    return this.bpmnJS.saveSVG((err, svg) => {
      // console.log(svg);
      this.diagramSvg = svg;
      return svg;
    });
  }

  saveDiagram() {
    this.getXML();

    this.generateDiagramImage().then(r => {
      if (this.isNewDiagram) {
        this.saveDialogRef = this.dialog.open(SaveDialogComponent, {
          height: '575px',
          width: '650px',
          data: {name: this.diagramService.getLoadedDiagramName()}
        });

        this.saveDialogRef.afterClosed().subscribe(
          diagramName => {
            this.isLoading = true;
            this.diagramService.createDiagram(diagramName, this.diagramXml, r).subscribe(
              data => {
                this.unsavedChanges = false;
                this.router.navigate(['/modeler', data.id]);
              }
            );
          });
      } else {
        this.diagramService.updateDiagram(this.diagramId, this.diagramService.getLoadedDiagramName(), this.diagramXml, r)
          .subscribe(res => {
            this.isLoading = false;
            console.log(res);
          });
        this.unsavedChanges = false;
      }
    })

  }

  private getXML() {
    this.bpmnJS.saveXML({format: false}, (err, xml) => {
      this.diagramXml = xml;
    });
  }

  private async generateDiagramImage(): Promise<Blob> {
    this.getSvg();
    const canvas = new OffscreenCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    const v = await Canvg.from(ctx, this.diagramSvg, presets.offscreen());

    await v.render();

    return await canvas.convertToBlob()
  }
}
