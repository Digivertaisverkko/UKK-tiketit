import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick }
    from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { TicketViewComponent } from './ticket-view.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { Location, registerLocaleData } from '@angular/common';
import { TicketService } from '@ticket/ticket.service';
import { ActivatedRoute, Routes } from '@angular/router';
import { StoreService } from '@core/services/store.service';
import { AuthDummyData } from '@core/services/auth.dummydata';
import { User } from '@core/core.models';
import { Tiketti } from '@ticket/ticket.models';
import { TicketDummyData } from '@ticket/ticket.dummydata';

import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import localeFi from '@angular/common/locales/fi';
import { ViewAttachmentsComponent } from '@ticket/components/view-attachments/view-attachments.component';
import { TicketModule } from '@ticket/ticket.module';
import { MatRadioButtonHarness } from '@angular/material/radio/testing'; // Import MatRadioButtonHarness
import { LOCALE_ID } from '@angular/core';
import { MessageComponent } from '@ticket/components/message/message.component';
import { EditorComponent } from '@shared/editor/editor.component';

describe('TicketViewComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: TicketViewComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketViewComponent>;
  let loader: HarnessLoader;
  let location: Location;
  let store: StoreService
  let ticket: Tiketti;
  const ticketDummyData = new TicketDummyData;
  let user: User | null;

  const routes: Routes = [
  ];

  registerLocaleData(localeFi);

  /* Kuin findEl, mutta jos elementtiä ei ole, niin palauttaa null errorin sijaan.
     Testaamiseen, onko jokin elementti renderoitu. */
  function findElIfExists(fixture: ComponentFixture<any>, selector: string):
      HTMLElement | null {
    try {
      return findEl(fixture, selector).nativeElement;
    } catch {
      return null;
    }
  }

  describe('Ticket exists', () => {

    beforeEach(async() => {
      ticket = ticketDummyData.tiketti;
      user = authDummyData.userInfoEsko;

      fakeTicketService = jasmine.createSpyObj('TicketService', {
        addComment: Promise.resolve({
          success: true,
          kommentti: 12345
        }),
        getTicket: Promise.resolve(ticket),
        removeTicket: Promise.resolve({ success: true})
      });
      const id = '4'; // ticketID URL:ssa.

      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(BeginningButtonComponent),
          MockComponent(HeadlineComponent),
          MockComponent(ViewAttachmentsComponent),
          EditorComponent,
          MessageComponent,
          TicketViewComponent
        ],
        imports: [
          ReactiveFormsModule,
          RouterTestingModule.withRoutes(routes),
          TicketModule,
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: { get: () => id }
              }
            }
          },
          { provide: TicketService, useValue: fakeTicketService },
          { provide: LOCALE_ID, useValue: 'fi-FI' },
          Location,
          StoreService,
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(TicketViewComponent);
      location = TestBed.inject(Location);
      component = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
      store = TestBed.inject(StoreService);

      component.courseid = '1';
      store.setUserInfo(user);
      // component.ngOnInit();
      loader = TestbedHarnessEnvironment.loader(fixture);

    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('calls correct service method when clicking "Remove ticket"', fakeAsync(() => {
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      const removeButton = findEl(fixture, 'remove-button').nativeElement;
      removeButton.click();
      tick(400);
      fixture.detectChanges();
      const confirmButton = findEl(fixture, 'confirm-button').nativeElement;
      confirmButton.click();
      expect(fakeTicketService.removeTicket).toHaveBeenCalledWith(
        ticket.id, component.courseid
      );
      discardPeriodicTasks();
    }));

    it('"Edit ticket" routes to correct view', fakeAsync(() => {
      const navigateSpy = spyOn(component.router, 'navigate');
      const expectedRoute = [`/course/${component.courseid}/submit/${ticket.id}`];
      const expectedState = { editTicket: true };
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      const editButton = findEl(fixture, 'edit-button').nativeElement;
      editButton.click();
      expect(navigateSpy).toHaveBeenCalledWith(expectedRoute, { state: expectedState });
      discardPeriodicTasks();
    }));

    it("sets if ticket isn't editable.", fakeAsync(() => {
      const student = authDummyData.userInfoRinne;
      store.setUserInfo(student);
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      expect(component.isEditable).toEqual(false);
      const editButton = findElIfExists(fixture, 'edit-button');
      expect(editButton).toBeNull();
      const removeButton = findElIfExists(fixture, 'remove-button');
      expect(removeButton).toBeNull();
      discardPeriodicTasks();
    }));

    it("shows Edit and Remove -buttons if it's user's ticket.", fakeAsync(() => {
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      expect(component.isEditable).toEqual(true);
      const editButton = findEl(fixture, 'edit-button').nativeElement;
      expect(editButton).toBeTruthy();
      const removeButton = findEl(fixture, 'remove-button').nativeElement;
      expect(removeButton).toBeTruthy();
      discardPeriodicTasks();
    }));

    it('shows ticket heading and message.', fakeAsync(() => {
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      const heading = findEl(fixture, 'heading').nativeElement;
      const headingText = heading.textContent.trim();
      expect(headingText).toEqual(ticket.otsikko);
      const message = findEl(fixture, 'message').nativeElement;
      const messsageText = message.textContent.trim();
      expect(messsageText).toEqual(ticket.viesti);
      discardPeriodicTasks();
    }));

    it('shows additional ticket fields.', fakeAsync(() => {
      fixture.detectChanges();
      tick(0);
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
      discardPeriodicTasks();
    }));

    it('sets right sender for ticket', fakeAsync(() => {
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      tick(1000);
      expect(component.ticket.aloittaja).toEqual(ticket.aloittaja);
      discardPeriodicTasks();
    }));

    it('sends a new comment with different state', fakeAsync(async() => {
      const student = authDummyData.userInfoTeacher;
      store.setUserInfo(student);
      let comment = 'Uusi kommentti';
      fixture.detectChanges();
      tick(0);
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
      discardPeriodicTasks();

    }));
  });

  describe("Ticket doesn't exist", () => {
    beforeEach(async() => {
      fakeTicketService = jasmine.createSpyObj('TicketService', {
        getTicket: Promise.resolve(null)
      });
      const id = '4'; // ticketID URL:ssa.

      registerLocaleData(localeFi);

      setTimeout(() => {}, 5000 );

      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(BeginningButtonComponent),
          MockComponent(HeadlineComponent),
          MockComponent(ViewAttachmentsComponent),
          TicketViewComponent
        ],
        imports: [
          ReactiveFormsModule,

          TicketModule
        ],
        providers: [
          { provide: TicketService, useValue: fakeTicketService },
          { provide: LOCALE_ID, useValue: 'fi-FI' },
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
      store = TestBed.inject(StoreService);
      component = fixture.componentInstance;
      component.courseid = '1';
      user = authDummyData.userInfoRinne;
      store.setUserInfo(user);
    });

    it("shows error message if ticket doesn't exist", fakeAsync(() => {
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      tick(5000);
      const error = findEl(fixture, 'error-message').nativeElement;
      expect(error).toBeTruthy();
      expect(component.errorCode).toEqual('noTicket');
      discardPeriodicTasks();
    }));

  });

});
