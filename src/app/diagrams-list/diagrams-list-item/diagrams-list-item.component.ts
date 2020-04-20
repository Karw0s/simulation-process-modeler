import { Component, Input, OnInit } from '@angular/core';
import { DiagramStruct } from '../../models/DiagramStruct';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-diagrams-list-item',
  templateUrl: './diagrams-list-item.component.html',
  styleUrls: ['./diagrams-list-item.component.css']
})
export class DiagramsListItemComponent implements OnInit {
  @Input() diagram: DiagramStruct;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  deleteDiagram(id: string) {
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
}
