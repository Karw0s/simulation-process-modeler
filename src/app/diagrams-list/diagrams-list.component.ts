import { Component, OnInit } from '@angular/core';
import { DiagramService } from '../diagram/diagram.service';
import { finalize } from 'rxjs/operators';
import { DiagramDetailsDTO } from '../models/dto/diagram-details-dto';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-diagrams-list',
  templateUrl: './diagrams-list.component.html',
  styleUrls: ['./diagrams-list.component.css']
})
export class DiagramsListComponent implements OnInit {
  diagrams: DiagramDetailsDTO[];
  isLoading = false;

  constructor(private diagramService: DiagramService,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.diagramService.deletedDiagram.subscribe(
      (diagramId: number) => {
        this.diagrams = this.diagrams.filter(item => item.id !== diagramId)
        this.snackBar.open('Diagram deleted', undefined, {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end'
        });
      },
      (error) => console.log('error'),
      complete => console.log('complete')
    )
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
