import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DiagramDetailsDTO } from '../models/diagram-details-dto';
import { DiagramDTO } from '../models/diagram-dto';

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
    console.log(file.diagram);
    this.diagram = file;
  }

  getDiagramFromFile(): DiagramStructFileNameADiagram {
    return this.diagram;
  }

  getDiagramsList() {
    return this.httpClient.get<DiagramDetailsDTO[]>(this.apiEndpoint);
  }

  getDiagram(id: number) {
    return this.httpClient.get<DiagramDTO>(`${this.apiEndpoint}/${id}`);
  }

  getDiagramImage(id: number) {
    return this.httpClient.get(`${this.apiEndpoint}/${id}/image`, {responseType: 'blob'});
  }

  saveDiagram(saveXML: any) {}
}
