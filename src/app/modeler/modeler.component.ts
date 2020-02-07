import { AfterContentInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { importDiagram } from './rx';
import { HttpClient } from '@angular/common/http';
import { InjectionNames, Modeler, OriginalPaletteProvider, OriginalPropertiesProvider, PropertiesPanelModule } from '../providers/bpmn-js';
import { CustomPropsProvider } from '../providers/CustomPropsProvider';
import { CustomPaletteProvider } from '../providers/CustomPaletteProvider';

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.css'],
})
export class ModelerComponent implements OnInit, OnDestroy, AfterContentInit {
  private bpmnJS: any;

  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Input() private url: string;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.bpmnJS = new Modeler({
      container: '#diagramPanel',
      additionalModules: [
        PropertiesPanelModule,

        {[InjectionNames.bpmnPropertiesProvider]: ['type', OriginalPropertiesProvider.propertiesProvider[1]]},
        {[InjectionNames.propertiesProvider]: ['type', CustomPropsProvider]},

        // Re-use original palette, see CustomPaletteProvider
        {[InjectionNames.originalPaletteProvider]: ['type', OriginalPaletteProvider]},
        {[InjectionNames.paletteProvider]: ['type', CustomPaletteProvider]},
      ],
      propertiesPanel: {
        parent: '#propertiesPanel'
      },
    });

    this.bpmnJS.on('import.done', ({error}) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });
  }

  ngAfterContentInit(): void {
    this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
  }

  ngOnDestroy(): void {
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
