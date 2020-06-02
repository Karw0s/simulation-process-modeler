import { TestBed } from '@angular/core/testing';

import { SimulationPropertiesService } from './simulation-properties.service';

describe('SimulationPropertiesService', () => {
  let service: SimulationPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulationPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
