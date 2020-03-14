import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { importDiagram } from './rx';
import { HttpClient } from '@angular/common/http';
import { InjectionNames, Modeler, OriginalPropertiesProvider, PropertiesPanelModule } from '../providers/bpmn-js';
import { CustomPropsProvider } from '../providers/CustomPropsProvider';
import { saveAs } from 'file-saver';
import customPaletteProvider from '../custom-elements/palette';
import { ActivatedRoute, Router } from '@angular/router';
import * as qsExtension from 'src/assets/gs.json';
import { MyDialogComponent } from './my-dialog/my-dialog.component';
import { MatDialog } from '@angular/material/dialog';


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

  private bpmnJS: any;

  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Input() private url: string;
  @ViewChild('someInput', {static: true}) private el: ElementRef;
  @ViewChild('propertiesPanel', {static: true}) private pp: ElementRef;
  private id: number;
  private editMode = false;
  private dialogRef;
  constructor(private http: HttpClient,
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

    this.bpmnJS.on('import.done', ({error}) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });

    // open quality assurance if user right clicks on element
    this.bpmnJS.on('element.contextmenu', HIGH_PRIORITY, (event) => {
      event.originalEvent.preventDefault();
      event.originalEvent.stopPropagation();

      // todo: add dialog or menu
      this.dialogRef = this.dialog.open(MyDialogComponent, {
        width: '250px'
      });

      console.log('dialog');
    });
  }

  ngAfterContentInit(): void {

    this.bpmnJS.attachTo(this.el.nativeElement);
    this.bpmnJS.get('propertiesPanel').attachTo(this.pp.nativeElement);

    this.route.paramMap.subscribe((params) => {
      this.id = +params.get('id');

      this.editMode = params.get('id') != null;
      const url: string = this.router.url;

      // if (!this.editMode) {
      if (url.match('/new')) {
        this.bpmnJS.importXML(ModelerComponent.initialDiagram);
      } else {
        this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
      }
    });

  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  save() {
    this.bpmnJS.saveXML((err, xml) => {
      this.downloadFile(xml);
      return xml;
    });
  }

  downloadFile(data) {
    const blob = new Blob([data], {type: 'application/xml'});
    saveAs(blob, 'grapf.xml');
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

}
