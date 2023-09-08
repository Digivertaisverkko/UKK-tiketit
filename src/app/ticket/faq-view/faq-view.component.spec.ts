import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { MockComponent } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { FaqViewComponent } from './faq-view.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { MessageComponent } from '@ticket/components/message/message.component';
import { StoreService } from '@core/services/store.service';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { TicketService, Tiketti } from '@ticket/ticket.service';
import { User } from '@core/core.models';
import { ViewAttachmentsComponent } from '@ticket/components/view-attachments/view-attachments.component';

describe('FaqViewComponent', () => {
  const authDummyData = new AuthDummyData;
  const ticketDummyData = new TicketDummyData;
  let component: FaqViewComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<FaqViewComponent>;
  let store: StoreService
  let ticket: Tiketti;
  let user: User;

  beforeEach(async () => {
    ticket = ticketDummyData.ukk;
    user = authDummyData.userInfoTeacher;
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      archiveFaq: undefined,
      getTicket: Promise.resolve(ticket)
    });

    await TestBed.configureTestingModule({
      declarations: [
        FaqViewComponent,
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
        MockComponent(MessageComponent),
        MockComponent(ViewAttachmentsComponent),
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService },
        StoreService,
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqViewComponent);
    component = fixture.componentInstance;
    component.courseid = '1';
    component.id = ticketDummyData.ukk.id;
    store = TestBed.inject(StoreService);
    store.setUserInfo(user);
    store.setLoggedIn();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows form heading', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const heading = findEl(fixture, 'heading').nativeElement;
    const headingText = heading.textContent.trim();
    expect(headingText).toEqual(ticket.otsikko);
    /*
    const message = findEl(fixture, 'message').nativeElement;
    const messsageText = message.textContent.trim();
    expect(messsageText).toEqual(ticket.viesti);
    */
  }));
});
