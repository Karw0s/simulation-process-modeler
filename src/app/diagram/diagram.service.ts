import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface DiagramStruct {
  fileName: string;
  diagram: string | ArrayBuffer;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  diagram: DiagramStruct;

  constructor() { }

  setDiagram(file: DiagramStruct) {
    this.diagram = file;
  }

  getDiagram(): DiagramStruct {
    return this.diagram;
  }
}
