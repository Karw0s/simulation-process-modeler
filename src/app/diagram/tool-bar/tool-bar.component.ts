import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  @Output() toolBarEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  triggerAction(action: string) {
    this.toolBarEvent.emit(action);
  }
}
