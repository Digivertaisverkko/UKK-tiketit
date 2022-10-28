import { TestBed } from '@angular/core/testing';

import { TicketServiceService } from './ticket.service';

describe('TicketServiceService', () => {
  let service: TicketServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
