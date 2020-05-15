import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DiagramService } from '../diagram.service';
import { SimParameterDialogComponent } from '../sim-parameter-dialog/sim-parameter-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  @Input() editMode: boolean;
  @Output() toolBarEvent = new EventEmitter<string>();
  @Output() file = new EventEmitter<string>();
  private dialogRef: any;

  constructor(private diagramService: DiagramService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  triggerAction(action: string) {
    this.toolBarEvent.emit(action);
  }

  stopSimulation() {
    this.snackBar.open('Simulation stopped', undefined, {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'end'
    });
  }

  pauseSimulation() {
    this.snackBar.open('Simulation paused', undefined, {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'end'
    });
  }

  startSimulation() {
    this.snackBar.open(`Simulation started, \n parameters id ${this.diagramService.getCurrentSimParams()}`, undefined, {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'end'
    });
  }

  openFile(files: FileList) {
    console.log(files[0]);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      console.log(fileReader.result);
      this.diagramService.setDiagramFromFile({fileName: files[0].name, diagram: fileReader.result});
      this.toolBarEvent.emit('open_diagram_file');
    };
    fileReader.readAsText(files[0]);
  }

  openSimParameterDialog() {
    this.dialogRef = this.dialog.open(SimParameterDialogComponent, {
      // height: '500px',
      minHeight: '400px',
      width: '350px',
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.diagramService.setCurrentSimParams(result);
      console.log('result from dialog' + result);
    });
  }
}
