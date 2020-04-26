import { Component, OnInit } from '@angular/core';
import { DiagramService } from '../diagram/diagram.service';
import { finalize } from 'rxjs/operators';
import { DiagramDetailsDTO } from '../models/diagram-details-dto';

@Component({
  selector: 'app-diagrams-list',
  templateUrl: './diagrams-list.component.html',
  styleUrls: ['./diagrams-list.component.css']
})
export class DiagramsListComponent implements OnInit {
  diagrams: DiagramDetailsDTO[];
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
