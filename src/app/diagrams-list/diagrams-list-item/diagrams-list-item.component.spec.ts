import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramsListItemComponent } from './diagrams-list-item.component';

describe('DiagramsListItemComponent', () => {
  let component: DiagramsListItemComponent;
  let fixture: ComponentFixture<DiagramsListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramsListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
