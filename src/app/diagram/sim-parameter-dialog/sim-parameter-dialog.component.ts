import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Simulation } from '../../models/simulation';
import { SimulationPropertiesService } from '../simulation-properties.service';
import { DiagramService } from '../diagram.service';
import { finalize } from 'rxjs/operators';
import { SimulationParametersDTO } from '../../models/dto/simulation-parameters-dto';
import { SimulationParametersListItemDTO } from '../../models/dto/simulation-parameters-list-item-dto';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

export interface Unit {
  name: string;
  value: string;
}

@Component({
  selector: 'app-sim-parameter-dialog',
  templateUrl: './sim-parameter-dialog.component.html',
  styleUrls: ['./sim-parameter-dialog.component.css']
})
export class SimParameterDialogComponent implements OnInit {
  simUnits: Unit[] = [
    {name: 'seconds', value: 'seconds'},
    {name: 'minutes', value: 'minutes'},
    {name: 'hours', value: 'hours'}
  ];
  simParameterForm: FormGroup;
  simProps: SimulationParametersListItemDTO[];
  selectedSimPropId;
  private isLoading: boolean;
  selectedSimProp: SimulationParametersDTO;
  isNewPropSet = false;
  namePropSet: any;

  constructor(public dialogRef: MatDialogRef<SimParameterDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Simulation,
              private fb: FormBuilder,
              private simPropService: SimulationPropertiesService,
              private diagramService: DiagramService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.simParameterForm = this.fb.group({
      name: new FormControl(null, [Validators.required]),
      time: new FormControl(null, [Validators.required]),
      unit: new FormControl(this.simUnits[0].value, [Validators.required]),
      rate: new FormControl(null, [Validators.required])
    });
    console.log(this.simUnits[0].value);

    this.isLoading = true;
    if (this.diagramService.getLoadedDiagramId()) {
      this.simPropService.getDiagramSimulationProperties(this.diagramService.getLoadedDiagramId())
        .pipe(finalize(
          () => this.isLoading = false
        ))
        .subscribe(response => {
          this.simProps = response;
          this.selectedSimPropId = this.simProps[0].id;
          this.simPropService.getSimulationProperties(this.simProps[0].id).subscribe(
            prop => {
              this.selectedSimProp = prop;
              this.updateFormValues(this.selectedSimProp);
            }
          );
        });
    } else {
      this.isNewPropSet = true;
    }
  }

  onNoClick() {
    console.log('close');
    this.dialogRef.close();
  }

  save() {
    console.log('Saved');
    console.log(this.simParameterForm.value);

    if (this.isNewPropSet) {
      this.simPropService.createSimulationProperties(this.diagramService.getLoadedDiagramId(), this.simParameterForm.value)
        .subscribe(
          result => {
            console.log(result);
          }
        );
    } else {
      this.simPropService.updateSimulationProperties(this.selectedSimPropId, this.simParameterForm.value)
        .subscribe(
        result => {
          console.log(result);
          this.dialogRef.close(result.id);
        }
      );
    }
  }

  change(id: number) {
    console.log('change id: ' + id);
    if (+id !== -1) {
      this.isNewPropSet = false;
      this.simPropService.getSimulationProperties(id).subscribe(
        prop => {
          this.selectedSimProp = prop;
          this.selectedSimPropId = this.selectedSimProp.id;
          this.updateFormValues(this.selectedSimProp);
        });
    } else {
      if (!this.isNewPropSet) {
        this.isNewPropSet = !this.isNewPropSet;
      }
      this.simParameterForm.patchValue({
        name: null,
        time: null,
        unit: this.simUnits[0].value,
        rate: null
      });
    }
  }

  deletePropSet() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: `Are you sure to delete ${this.selectedSimProp.name}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`delete confirm for ${this.selectedSimProp.id}`);
        this.simPropService.deleteSimulationProperties(this.selectedSimProp.id);
      } else {
        console.log(`delete canceled`);
      }
    });
  }

  updateFormValues(values: SimulationParametersDTO) {
    this.simParameterForm.patchValue({
      name: values.name,
      time: values.time,
      unit: values.unit,
      rate: values.rate
    });
  }
}
