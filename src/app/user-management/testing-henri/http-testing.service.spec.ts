import { TestBed } from '@angular/core/testing';

import { HttpTestingService } from './http-testing.service';

describe('HttpTestingService', () => {
  let service: HttpTestingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpTestingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
