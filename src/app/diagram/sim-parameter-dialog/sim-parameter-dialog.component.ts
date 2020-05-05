import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Simulation } from '../../models/simulation';

@Component({
  selector: 'app-sim-parameter-dialog',
  templateUrl: './sim-parameter-dialog.component.html',
  styleUrls: ['./sim-parameter-dialog.component.css']
})
export class SimParameterDialogComponent implements OnInit {
  simUnits: any;
  simParameterForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<SimParameterDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Simulation,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.simParameterForm = this.fb.group({
      time: [null, Validators.required],
      unit: [null, Validators.required],
      rate: [null, Validators.required]
    });
  }


  onNoClick() {
    console.log('close');
    this.dialogRef.close();
  }

  save() {
    console.log('Saved ' + this.simParameterForm);
  }
}
