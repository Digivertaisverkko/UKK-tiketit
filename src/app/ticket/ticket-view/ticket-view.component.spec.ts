import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick }
    from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { TicketViewComponent } from './ticket-view.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { TicketService, Tiketti } from '@ticket/ticket.service';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '@core/services/store.service';
import { authDummyData } from '@core/services/auth.dummydata';
import { User } from '@core/core.models';
import { ticketDummyData } from '@ticket/ticket.dummydata';

import { SharedModule } from '@shared/shared.module';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { initializeLanguageFI } from 'src/app/app.initializers';
import { ViewAttachmentsComponent } from '@ticket/components/view-attachments/view-attachments.component';
import { TicketModule } from '@ticket/ticket.module';
import { MatRadioButtonHarness } from '@angular/material/radio/testing'; // Import MatRadioButtonHarness

describe('TicketViewComponent', () => {
  let component: TicketViewComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketViewComponent>;
  let loader: HarnessLoader;
  let store: StoreService
  // Oletusarvoja
  const ticket: Tiketti = ticketDummyData.ticket;
  const user: User = authDummyData.userInfoTeacher;

  initializeLanguageFI(); // datePipeen

  function findElIfExists(fixture: ComponentFixture<any>, selector: string):
      HTMLElement | null {
    try {
      return findEl(fixture, selector).nativeElement;
    } catch {
      return null;
    }
  }
  
  beforeEach(async() => {

    fakeTicketService = jasmine.createSpyObj('TicketService', {
      addComment: Promise.resolve({
        success: true,
        kommentti: 12345
      }),
      getTicket: Promise.resolve(ticket),
    });
    const id = '4'; // ticketID URL:ssa.
  
    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
        MockComponent(ViewAttachmentsComponent),
        TicketViewComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule,
        TicketModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => id }
            }
          }
        },
        StoreService,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketViewComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    store = TestBed.inject(StoreService);

    component.courseid = '1';
    store.setUserInfo(user);
    store.setLoggedIn();
    component.ngOnInit();
    loader = TestbedHarnessEnvironment.loader(fixture);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fetches ticket data from service.', fakeAsync(() => {
    // Ei subscribaa timeriin, joten kutsutaan manuaalisesti.
    component.fetchTicket(component.courseid);
    tick();
    expect(fakeTicketService.getTicket).toHaveBeenCalledTimes(1);
    expect(component.ticket).toEqual(ticket);
    discardPeriodicTasks();  // Varalta jos tiketin pollaus käynnistyy.
  }));

  it("sets if ticket isn't editable or removable.", fakeAsync(() => {
    component.fetchTicket(component.courseid);
    tick();
    fixture.detectChanges();
    expect(component.isEditable).toEqual(false);
    expect(component.isRemovable).toEqual(false);
    const editButton = findElIfExists(fixture, 'edit-button');
    expect(editButton).toBeNull();
    const removeButton = findElIfExists(fixture, 'remove-button');
    expect(removeButton).toBeNull();
    discardPeriodicTasks();  // Varalta jos tiketin pollaus käynnistyy.
  }));

  it("sets if ticket is editable and removable.", fakeAsync(() => {
    const student = authDummyData.userInfoEsko;
    store.setUserInfo(student);
    component.fetchTicket(component.courseid);
    tick();
    fixture.detectChanges();
    expect(component.isEditable).toEqual(true);
    const editButton = findEl(fixture, 'edit-button').nativeElement;
    expect(editButton).toBeTruthy();
    expect(component.isRemovable).toEqual(true);
    const removeButton = findEl(fixture, 'remove-button').nativeElement;
    expect(removeButton).toBeTruthy();

    discardPeriodicTasks();  // Varalta jos tiketin pollaus käynnistyy.
  }));
  
  it('shows ticket heading and message.', fakeAsync(() => {
    component.fetchTicket(component.courseid);
    tick();
    fixture.detectChanges();
    const heading = findEl(fixture, 'heading').nativeElement;
    const headingText = heading.textContent.trim();
    expect(headingText).toEqual(ticket.otsikko);
    const message = findEl(fixture, 'message').nativeElement;
    const messsageText = message.textContent.trim();
    expect(messsageText).toEqual(ticket.viesti);
  }));

  it('shows additional ticket fields.', fakeAsync(() => {
    component.fetchTicket(component.courseid);
    tick();
    fixture.detectChanges();
    const fieldTitle1 = findEl(fixture, 'field-title-0').nativeElement;
    const fieldText = fieldTitle1.textContent.trim();
    const fieldTitle2 = findEl(fixture, 'field-title-1').nativeElement;
    const field2Text = fieldTitle2.textContent.trim();

    const fieldValue1 = findEl(fixture, 'field-value-0').nativeElement;
    const fieldValue1Text = fieldValue1.textContent.trim();
    const fieldValue2 = findEl(fixture, 'field-value-1').nativeElement;
    const fieldValue2Text = fieldValue2.textContent.trim();

    if (!ticket.kentat) {
      fail('Ei löydetty renderoituja tiketin kenttiä.');
    } else {
      expect(fieldText).toEqual(ticket.kentat[0].otsikko);
      expect(field2Text).toEqual(ticket.kentat[1].otsikko);
      expect(fieldValue1Text).toEqual(ticket.kentat[0].arvo);
      expect(fieldValue2Text).toEqual(ticket.kentat[1].arvo);
    }

  }));

  it('sets right sender for ticket.', fakeAsync(() => {
    component.fetchTicket(component.courseid);
    tick();
    fixture.detectChanges();
    expect(component.ticket.aloittaja).toEqual(ticket.aloittaja);
  }));

  it('sends a new comment with right parameters.', fakeAsync(async() => {
    let comment = 'Uusi kommentti';
    component.fetchTicket(component.courseid);
    tick();
    fixture.detectChanges();
    component.message.setValue(comment);  
    // setFieldValue(fixture, 'comment', comment); // Ei toiminut.
    fixture.detectChanges();

    const radioButton = await loader.getHarness(MatRadioButtonHarness.with(
      { selector: '[data-testid="info-needed-radio-btn"]' }));
    radioButton.check();

    fixture.detectChanges();
    tick();

    const sendButton = findEl(fixture, 'send-button').nativeElement;
    sendButton.click();
    comment = `<p>${comment}</p>`;
    const moreInfoNeededState = 3;

    expect(fakeTicketService.addComment).toHaveBeenCalledWith(
      ticket.id, component.courseid, comment, moreInfoNeededState
    );
  }));
  

});
