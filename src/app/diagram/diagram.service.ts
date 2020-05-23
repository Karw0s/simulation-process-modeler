import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DiagramDetailsDTO } from '../models/dto/diagram-details-dto';
import { DiagramDTO } from '../models/dto/diagram-dto';
import { tap } from 'rxjs/operators';
import { Diagram } from '../models/diagram';

interface DiagramStructFileNameADiagram {
  fileName: string;
  diagram: string | ArrayBuffer;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  @Output() deletedDiagram: EventEmitter<number> = new EventEmitter();
  currentDiagram: Diagram;
  apiEndpoint = environment.apiServer + '/diagrams';
  private currentSimParams: number;

  constructor(private httpClient: HttpClient) { }

  setDiagramFromFile(file: DiagramStructFileNameADiagram) {
    // console.log(file.diagram);
    // this.diagram = file;
    this.currentDiagram = new Diagram(null, file.fileName.replace(/.bpmn/g, ''), file.diagram);
  }

  getLoadedDiagramId() {
    if (this.currentDiagram == null) {
      return;
    } else {
      return this.currentDiagram.id;
    }
  }

  getLoadedDiagramName() { return this.currentDiagram.name; }

  setDiagramName(name: string) { this.currentDiagram.name = name; }

  getLoadedDiagramXml() { return this.currentDiagram.diagramXML; }

  getLoadedDiagram() { return this.currentDiagram; }

  setDiagram(diagram: Diagram) { this.currentDiagram = diagram;}

  setCurrentSimParams(simParamId: number) { this.currentSimParams = simParamId; }

  getCurrentSimParams() { return this.currentSimParams; }

  /* API */

  getDiagramsList() {
    return this.httpClient.get<DiagramDetailsDTO[]>(this.apiEndpoint);
  }

  createDiagram(name: string, xml: string, png: any) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('xml', xml);
    formData.append('image', png, `${name}.png`);

    return this.httpClient.post<DiagramDTO>(`${this.apiEndpoint}`, formData)
      .pipe(tap(data => {
        this.currentDiagram = new Diagram(data.id, data.name, data.diagramXML);
      }));
  }

  getDiagram(id: number) {
    return this.httpClient.get<DiagramDTO>(`${this.apiEndpoint}/${id}`)
      .pipe(tap(data => {
        this.currentDiagram = new Diagram(data.id, data.name, data.diagramXML);
      }));
  }

  getDiagramImage(id: number) {
    return this.httpClient.get(`${this.apiEndpoint}/${id}/image`, {responseType: 'blob'});
  }

  updateDiagram(diagramId: number, name: string, xml: string, png: any) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('xml', xml);
    formData.append('image', png, `${name}.png`);
    return this.httpClient.put<DiagramDTO>(`${this.apiEndpoint}/${diagramId}`, formData)
      .pipe(tap(data => {
        this.currentDiagram = new Diagram(data.id, data.name, data.diagramXML);
      }));
  }

  deleteDiagram(diagramId: number) {
    this.httpClient.delete(`${this.apiEndpoint}/${diagramId}`).subscribe(value => {
      console.log('deleted');
      this.deletedDiagram.emit(diagramId);
    });
  }
}
