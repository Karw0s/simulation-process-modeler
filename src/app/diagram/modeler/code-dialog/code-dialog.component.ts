import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CodeDialogData } from '../code-dialog-data';

@Component({
  selector: 'app-code-dialog',
  templateUrl: './code-dialog.component.html',
  styleUrls: ['./code-dialog.component.css']
})
export class CodeDialogComponent {
  selectedLanguage;
  editorOptions = {
    theme: 'vs-dark',
    language: 'java',
    scrollBeyondLastLine: false,
    readOnly: undefined
  };

  languages = [
    {name: 'Java', value: 'java'},
    {name: 'javascript', value: 'javascript'},
    {name: 'Java', value: 'java'}
  ]

  constructor(public dialogRef: MatDialogRef<CodeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CodeDialogData) {
    this.editorOptions.readOnly = data.readOnly;
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
