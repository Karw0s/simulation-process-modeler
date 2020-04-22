import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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


const HIGH_PRIORITY = 1500;

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.css'],
})
export class ModelerComponent implements OnInit, OnDestroy, AfterContentInit {

  static initialDiagram =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false">' +
    '<bpmn:startEvent id="StartEvent_1"/>' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
    '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
    '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
    '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
    '</bpmndi:BPMNShape>' +
    '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
    '</bpmn:definitions>';

  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Input() private url: string;
  @ViewChild('diagramContainer', {static: true}) private el: ElementRef;
  @ViewChild('propertiesPanel', {static: true}) private pp: ElementRef;
  private bpmnJS: any;
  private id: string;
  private editMode = false;
  private dialogRef;
  private code: any;
  private diagramElement;
  private eeeee: any;
  private toolbarActions: any;

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
        this.eeeee = event;
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

    this.bpmnJS.attachTo(this.el.nativeElement);
    this.bpmnJS.get('propertiesPanel').attachTo(this.pp.nativeElement);

    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');

      if (this.id != null) {
        this.diagramService.getDiagram(this.id)
          .subscribe(
            diagramXML => {
              this.bpmnJS.importXML(diagramXML);
            }
          );
      }

      this.editMode = params.get('id') != null;
      const url: string = this.router.url;

      if (!this.editMode || url.match('/new')) {
        this.bpmnJS.importXML(ModelerComponent.initialDiagram);
      }
      //   this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
    });

  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
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
        break;
      case 'new diagram':
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
