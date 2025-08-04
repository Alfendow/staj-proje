import { TestBed } from '@angular/core/testing';

import { KrediService } from './kredi.service';

describe('KrediService', () => {
  let service: KrediService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KrediService
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
