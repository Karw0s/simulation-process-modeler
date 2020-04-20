import { AfterContentInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
// import { InjectionNames,   OriginalPropertiesProvider, PropertiesPanelModule } from '../../providers/bpmn-js';
import * as Viewer from 'bpmn-js/dist/bpmn-navigated-viewer.development.js';
// @ts-ignore
import qsExtension from '../../../assets/gs.json';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { importDiagram } from '../modeler/rx';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(private http: HttpClient,
              private router: Router,
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

  }

  ngAfterContentInit(): void {
    this.viewer.attachTo(this.el.nativeElement);
    // this.viewer.get('propertiesPanel').attachTo(this.pp.nativeElement);

    this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
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

  }


}
