import { AfterContentInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
// import { InjectionNames,   OriginalPropertiesProvider, PropertiesPanelModule } from '../../providers/bpmn-js';
import * as Viewer from 'bpmn-js/dist/bpmn-navigated-viewer.development.js';
// @ts-ignore
import qsExtension from '../../../assets/gsx.json';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { importDiagram } from '../modeler/rx';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagramService } from '../diagram.service';
import { saveAs } from 'file-saver';
import { CodeDialogComponent } from '../modeler/code-dialog/code-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit, OnDestroy, AfterContentInit {

  @ViewChild('diagramViewerContainer', {static: true}) private el: ElementRef;
  @ViewChild('propertiesPanel', {static: true}) private pp: ElementRef;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  private viewer: any;
  private diagramId: number;
  private isLoading: boolean;
  private codeDialogRef;

  constructor(private diagramService: DiagramService,
              private http: HttpClient,
              private router: Router,
              public dialog: MatDialog,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.viewer = new Viewer({
      additionalModules: [
        // PropertiesPanelModule,
        //
        // {[InjectionNames.bpmnPropertiesProvider]: ['type', OriginalPropertiesProvider.propertiesProvider[1]]},
        // {[InjectionNames.propertiesProvider]: ['type', CustomPropsProvider]},

        // customPaletteProvider,
      ],
      moddleExtensions: {
        gs: qsExtension
      }
    });

    this.viewer.on('import.done', ({error}) => {
      if (!error) {
        this.viewer.get('canvas').zoom('fit-viewport');
      }
    });

    this.viewer.on('element.dblclick', 1500, (event) => {
      event.originalEvent.preventDefault();
      event.originalEvent.stopPropagation();

      if (event.element.businessObject.$type !== 'bpmn:Process') {
        const businessObject = getBusinessObject(event.element);
        const GroovyElement = getExtensionElement(businessObject, 'gsx:GroovyScript');
        const script = GroovyElement ? GroovyElement.script : '';

        this.codeDialogRef = this.dialog.open(CodeDialogComponent, {
          minHeight: '575px',
          width: '650px',
          data: {code: script, readOnly: true}
        });

        this.codeDialogRef.afterClosed().subscribe(result => {
          console.log('code dialog result: ' + result);
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
    this.viewer.attachTo(this.el.nativeElement);
    // this.viewer.get('propertiesPanel').attachTo(this.pp.nativeElement);
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
              this.viewer.importXML(diagram.diagramXML);
              // this.isNewDiagram = false;
            },
            error => {
              console.log(`can't load diagram ${this.diagramId}`);
            }
          );
      } else {
        this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
        this.isLoading = false;
        // this.isNewDiagram = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.viewer.destroy();
  }

  loadUrl(url: string) {

    return (
      this.http.get(url, {responseType: 'text'}).pipe(
        catchError(err => throwError(err)),
        importDiagram(this.viewer)
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
    switch (action) {
      case 'new_diagram':
        this.router.navigate(['/modeler/new']);
        break;
      case 'open_diagram_file':
        console.log('open_diagram_file');
        this.viewer.importXML(this.diagramService.getLoadedDiagramXml());
        break;
      case 'save_as_new':
        console.log('open it in modeler.');
        break;
      case 'download_xml':
        console.log('saving to .bpmn file');
        if (this.diagramService.getLoadedDiagramId()) {
          this.viewer.saveXML({format: true}).then(result => {
            this.downloadFile(result.xml, 'application/xml', `${this.diagramService.getLoadedDiagramName()}.bpmn`);
          });
        }
        break;
      case 'download_img':
        console.log('downloading image');
        this.viewer.saveSVG().then(result => {
          console.log(result);
          this.downloadFile(result.svg, 'image/svg+xml', `${this.diagramService.getLoadedDiagramName()}.svg`);
        });
        break;
      case 'start_sim':
        console.log('start_sim');
        break;
      case 'stop_sim':
        console.log('stop_sim');
        break;
    }
  }

  downloadFile(data, dataType, fileName) {
    const blob = new Blob([data], {type: dataType});
    saveAs(blob, fileName);
  }

}
