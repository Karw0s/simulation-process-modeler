import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DiagramDetailsDTO } from '../../models/diagram-details-dto';
import { DiagramService } from '../../diagram/diagram.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-diagrams-list-item',
  templateUrl: './diagrams-list-item.component.html',
  styleUrls: ['./diagrams-list-item.component.css']
})
export class DiagramsListItemComponent implements OnInit {
  @Input() diagram: DiagramDetailsDTO;
  imageToShow: any;
  isLoading = false;

  constructor(public diagramService: DiagramService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getImage();
  }

  deleteDiagram(id: number) {
    console.log(`deleting diagram id: ${id}`);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: `Are you sure to delete ${this.diagram.name}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`delete confirm for ${this.diagram.id}`);
        // todo: delete diagram
      } else {
        console.log(`delete canceled`);
      }
    });
  }

  getImage() {
    this.isLoading = true;
    this.diagramService.getDiagramImage(this.diagram.id)
      .pipe(finalize(
        () => this.isLoading = false
      ))
      .subscribe(value => {
        this.getImageFromBlob(value);
      });
  }

  getImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
