import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CodeDialogData } from '../code-dialog-data';

@Component({
  selector: 'app-code-dialog',
  templateUrl: './code-dialog.component.html',
  styleUrls: ['./code-dialog.component.css']
})
export class CodeDialogComponent {

  constructor(public dialogRef: MatDialogRef<CodeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CodeDialogData) { }

  onNoClick() {
    this.dialogRef.close();
  }

}
