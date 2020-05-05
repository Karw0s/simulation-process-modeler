import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramsListComponent } from './diagrams-list.component';

describe('DiagramsListComponent', () => {
  let component: DiagramsListComponent;
  let fixture: ComponentFixture<DiagramsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
