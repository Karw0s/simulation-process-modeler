import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-my-dialog',
  templateUrl: './my-dialog.component.html',
  styleUrls: ['./my-dialog.component.css']
})
export class MyDialogComponent {

  constructor(public dialogRef: MatDialogRef<MyDialogComponent>) { }

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }

}
