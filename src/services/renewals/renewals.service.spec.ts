import { TestBed } from '@angular/core/testing';

import { RenewalsService } from './renewals.service';

describe('RenewalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RenewalsService = TestBed.get(RenewalsService);
    expect(service).toBeTruthy();
  });
});
