import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DiagramService } from '../diagram.service';
import { SimParameterDialogComponent } from '../sim-parameter-dialog/sim-parameter-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
              public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  triggerAction(action: string) {
    this.toolBarEvent.emit(action);
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
      width: '350px',
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('result from dialog' + result);
    });
  }
}
