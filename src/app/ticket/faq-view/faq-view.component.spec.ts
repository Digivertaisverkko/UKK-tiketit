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
import { StoreService } from '@core/services/store.service';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { TicketService, Tiketti } from '@ticket/ticket.service';
import { User } from '@core/core.models';
import { ViewAttachmentsComponent } from '@ticket/components/view-attachments/view-attachments.component';
import { TicketModule } from '@ticket/ticket.module';

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
      archiveFAQ: Promise.resolve({ success: true}),
      getTicket: Promise.resolve(ticket)
    });

    await TestBed.configureTestingModule({
      declarations: [
        FaqViewComponent,
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
        MockComponent(ViewAttachmentsComponent)
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService },
        StoreService,
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TicketModule
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

  it('shows UKK with correct text fields', fakeAsync(() => {
    const ticket = ticketDummyData.ukk;
    const expextedMessage = ticket.viesti;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const heading = findEl(fixture, 'heading').nativeElement;
    const message = findEl(fixture, 'message').nativeElement;
    const answer = findEl(fixture, 'answer').nativeElement;
    expect(heading.textContent.trim()).toBeTruthy();
    expect(heading.textContent.trim()).toBe(ticket.otsikko);
    expect(message.textContent.trim()).toBe(expextedMessage);
    expect(answer.textContent.trim()).toBe(ticket.kommentit[0].viesti);
  }));

  /* Test clicking Edit-button routes to correct page */
  it ('routes to correct page when clicking Edit-button', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const editButton = findEl(fixture, 'edit-button').nativeElement;
    editButton.click();
    tick();
    fixture.detectChanges();
    expect(component.router.url).toBe(`/course/${component.courseid}/submit-faq/${component.id}`);
  }));

  /* Clicking Remove-button calls archiveFaq() */
  it ('makes correct call when clicking Remove-button', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const removeButton = findEl(fixture, 'remove-button').nativeElement;
    removeButton.click();
    tick(400);
    fixture.detectChanges();
    const confirmButton = findEl(fixture, 'confirm-button').nativeElement;
    confirmButton.click();
    fixture.detectChanges();
    expect(fakeTicketService.archiveFAQ).toHaveBeenCalled();
  }));

  /* Copy link -copies URL to clipboard */
  it ('copies URL to clipboard when clicking Copy link', fakeAsync(() => {
    spyOn(navigator.clipboard, 'writeText').and.callFake(() => Promise.resolve());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const copyButton = findEl(fixture, 'copy-link-button').nativeElement;
    copyButton.click();
    tick();
    fixture.detectChanges();
    expect(component.isCopyToClipboardPressed).toBe(true);
  }));
  
});
  