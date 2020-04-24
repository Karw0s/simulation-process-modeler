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
import { CodeDialogComponent } from './code-dialog/code-dialog.component';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { DiagramService } from '../diagram.service';
import { CanComponentDeactivate } from '../../shared/unsaved-changes.guard';


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
  private id: number;
  private dialogRef;
  private code: any;
  private diagramElement;
  // private toolbarActions: any;
  isLoading = false;
  private unsavedChanges = false;

  constructor(private diagramService: DiagramService,
              private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    console.log('init');
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

    // this.toolbarActions = {
    //   undo: this.trigger_undo(),
    //   redo: this.trigger_redo(),
    //   save: this.save()
    // };

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

      if (event.element.businessObject.$type === 'bpmn:ScriptTask') {
        const businessObject = getBusinessObject(event.element);
        this.diagramElement = event.element;

        let GroovyElement = getExtensionElement(businessObject, 'gs:GroovyNode');
        const script = GroovyElement ? GroovyElement.script : '';

        this.dialogRef = this.dialog.open(CodeDialogComponent, {
          height: '575px',
          width: '650px',
          data: {code: script}
        });

        this.dialogRef.afterClosed().subscribe(result => {

          console.log('dialog result: ' + result);
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

            this.code = result;
          }
        });

        console.log('dialog');
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
      this.id = +params.get('id');

      if (!isNaN(this.id) && params.get('id') != null) {
        this.diagramService.getDiagram(this.id)
          .pipe(finalize(
            () => this.isLoading = false
          ))
          .subscribe(
            diagramXML => {
              this.bpmnJS.importXML(diagramXML);
            }
          );
      } else {
        this.bpmnJS.createDiagram();
        this.isLoading = false;
      }
      //   this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
    });

  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
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
      case 'undo':
        this.trigger_undo();
        break;
      case 'redo':
        this.trigger_redo();
        break;
      case 'save':
        this.save();
        this.unsavedChanges = false;
        break;
      case 'save_to_server':
        this.diagramService.saveDiagram(this.bpmnJS.saveXML({format: true}, (err, xml) => {
          this.unsavedChanges = false;
          return xml;
        }));
        break;
      case 'new_diagram':
        this.router.navigate(['/modeler/new']);
        break;
      case 'load':
        this.bpmnJS.importXML(this.diagramService.getDiagramFromFile().diagram);
        break;
      case 'download_img':
        this.downloadImg();
        break;
    }
    // this.toolbarActions[action];
  }

  trigger_undo() {
    this.bpmnJS.injector._instances.editorActions.trigger('undo');
  }

  trigger_redo() {
    this.bpmnJS.injector._instances.editorActions.trigger('redo');
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
}
