import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimParameterDialogComponent } from './sim-parameter-dialog.component';

describe('SimulationParapetrizationDialogComponent', () => {
  let component: SimParameterDialogComponent;
  let fixture: ComponentFixture<SimParameterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimParameterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimParameterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
