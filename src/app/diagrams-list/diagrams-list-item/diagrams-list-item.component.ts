import { Component, Input, OnInit } from '@angular/core';
import { DiagramStruct } from '../../models/DiagramStruct';

@Component({
  selector: 'app-diagrams-list-item',
  templateUrl: './diagrams-list-item.component.html',
  styleUrls: ['./diagrams-list-item.component.css']
})
export class DiagramsListItemComponent implements OnInit {
  @Input() diagram: DiagramStruct;

  constructor() { }

  ngOnInit(): void {
  }

}
