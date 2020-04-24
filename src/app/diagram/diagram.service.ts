import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DiagramStruct } from '../models/DiagramStruct';

interface DiagramStructFileNameADiagram {
  fileName: string;
  diagram: string | ArrayBuffer;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  diagram: DiagramStructFileNameADiagram;
  apiEndpoint = environment.apiServer + '/diagrams';

  constructor(private httpClient: HttpClient) { }

  setDiagram(file: DiagramStructFileNameADiagram) {
    this.diagram = file;
  }

  getDiagramFromFile(): DiagramStructFileNameADiagram {
    return this.diagram;
  }

  getDiagramsList() {
    return this.httpClient.get<DiagramStruct[]>(this.apiEndpoint);
  }

  getDiagram(id: number) {
    return this.httpClient.get(`${this.apiEndpoint}/${id}`, {responseType: 'text'});
  }

  saveDiagram(saveXML: any) {}
}
