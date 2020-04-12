import { Component, OnInit } from '@angular/core';
import { DiagramStruct } from '../models/DiagramStruct';
import { DiagramService } from '../diagram/diagram.service';

@Component({
  selector: 'app-diagrams-list',
  templateUrl: './diagrams-list.component.html',
  styleUrls: ['./diagrams-list.component.css']
})
export class DiagramsListComponent implements OnInit {
  diagrams: DiagramStruct[];

  constructor(private diagramService: DiagramService) { }

  ngOnInit(): void {
    this.diagramService.getDiagramsList()
      .subscribe(
        diagrams => {
          this.diagrams = diagrams;
        }
      );
  }

}
