import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { FaqViewComponent } from './faq-view.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { TicketService } from '@ticket/ticket.service';

describe('FaqViewComponent', () => {
  let component: FaqViewComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<FaqViewComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      archiveFaq: undefined,
      getTicket: Promise.resolve('')
    });

    await TestBed.configureTestingModule({
      declarations: [
        FaqViewComponent,
        MockComponent(HeadlineComponent)
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
