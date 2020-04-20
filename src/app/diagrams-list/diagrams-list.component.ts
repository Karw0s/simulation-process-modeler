import { Component, OnInit } from '@angular/core';
import { DiagramStruct } from '../models/DiagramStruct';
import { DiagramService } from '../diagram/diagram.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-diagrams-list',
  templateUrl: './diagrams-list.component.html',
  styleUrls: ['./diagrams-list.component.css']
})
export class DiagramsListComponent implements OnInit {
  diagrams: DiagramStruct[];
  isLoading = false;

  constructor(private diagramService: DiagramService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.diagramService.getDiagramsList()
      .pipe(finalize(
        () => this.isLoading = false
      ))
      .subscribe(
        diagrams => {
          this.diagrams = diagrams;
        }
      );
  }

}
