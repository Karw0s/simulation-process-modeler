import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DiagramService } from '../diagram.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  @Output() toolBarEvent = new EventEmitter<string>();
  @Output() file = new EventEmitter<string>();

  constructor(private diagramService: DiagramService) { }

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
      this.diagramService.setDiagram({fileName: files[0].name, diagram: fileReader.result});
      this.toolBarEvent.emit('load');
    };
    fileReader.readAsText(files[0]);
  }
}
