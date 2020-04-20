import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DiagramStruct } from '../models/DiagramStruct';

interface DiagramStructfileNameADiagram {
  fileName: string;
  diagram: string | ArrayBuffer;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  diagram: DiagramStructfileNameADiagram;
  apiEndpoint = environment.apiServer + '/diagrams';

  constructor(private httpClient: HttpClient) { }

  setDiagram(file: DiagramStructfileNameADiagram) {
    this.diagram = file;
  }

  // getDiagram(): DiagramStructfileNameADiagram {
  //   return this.diagram;
  // }

  getDiagramsList() {
    return this.httpClient.get<DiagramStruct[]>(this.apiEndpoint);
  }

  getDiagram(id: string) {
    return this.httpClient.get(`${this.apiEndpoint}/${id}`, {responseType: 'text'});
  }
}
