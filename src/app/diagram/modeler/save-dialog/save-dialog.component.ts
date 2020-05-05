import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DiagramName } from '../code-dialog-data';

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.css']
})
export class SaveDialogComponent {


  constructor(public dialogRef: MatDialogRef<SaveDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DiagramName) { }

  onNoClick() {
    this.dialogRef.close();
  }

}
