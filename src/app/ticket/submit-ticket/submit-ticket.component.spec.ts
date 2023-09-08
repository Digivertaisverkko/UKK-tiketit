import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { SubmitTicketComponent } from './submit-ticket.component';
import { CourseService } from '@course/course.service';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { EditorComponent } from '@shared/editor/editor.component';
import { TicketService, UusiTiketti } from '@ticket/ticket.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { CourseDummyData } from '@course/course.dummydata';
import { StoreService } from '@core/services/store.service';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TicketDummyData } from '@ticket/ticket.dummydata';


describe('SubmitTicketComponent', () => {
  let component: SubmitTicketComponent;
  const courseDummyData = new CourseDummyData;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitTicketComponent>;
  const ticketDummyData = new TicketDummyData;

  const helpText = 'Muista valita oikea tehtävä.';

  describe('Create new ticket', () => {

    beforeEach(async () => {
      fakeCourseService = jasmine.createSpyObj('CourseService', {
        getTicketFieldInfo: Promise.resolve({
          kuvaus: helpText,
          kentat: courseDummyData.ticketFields
        }),
      });

      fakeTicketService = jasmine.createSpyObj('TicketService', {
        addTicket: Promise.resolve({
          success: true,
          uusi: {
            tiketti: 123,
            kommentti: 123
          }
        }),
      });

      // Luodaan komponentti tiketin luomistilassa
      interface State { editTicket: boolean };
      const state: State = { editTicket: false };
      window.history.pushState(state, '', '');

      // SharedModule mm. matAutocomplete:a varten.
      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(EditAttachmentsComponent),
          MockComponent(EditorComponent),
          MockComponent(BeginningButtonComponent),
          MockComponent(HeadlineComponent),
          SubmitTicketComponent
        ],
        imports: [
          BrowserAnimationsModule,
          MatIconModule,
          MatInputModule,
          ReactiveFormsModule,
          RouterTestingModule,
          MatAutocompleteModule,
          MatTooltipModule
        ],
        providers: [
          { provide: CourseService, useValue: fakeCourseService },
          { provide: TicketService, useValue: fakeTicketService },
          StoreService
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(SubmitTicketComponent);
      component = fixture.componentInstance;
      component.courseid = '1';
      component.id = '';
      component.ngOnInit();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('shows help text', () => {
      fixture.detectChanges();
      const helpTextP = findEl(fixture, 'help-text').nativeElement;
      expect(helpTextP.innerText).toBe(helpText);
    });

    it('shows prefilled field', fakeAsync(() => {
      const fields = courseDummyData.ticketFields;
      fixture.detectChanges();
      tick();
      const prefilledField = findEl(fixture, 'field-0').nativeElement;
      const prefilledText = fields[0].esitaytto;
      expect(prefilledField.value).toBe(prefilledText);
    }));

    it('calls correct method to create a new ticket after send click', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      const titleText = 'Uusi kysymys';
      const messageText = 'Kysymyksen teksti';
      const fieldTexts = [ 'Tehtävä 1', 'Kotitehtävä' ];
      const fields = courseDummyData.ticketFields;

      const expectedTicket: UusiTiketti = {
        otsikko: titleText,
        viesti: messageText,
        kentat: [
          { arvo: fieldTexts[0], id: fields[0].id },
          { arvo: fieldTexts[1], id: fields[1].id }
        ]
      }
      setFieldValue(fixture, 'title', titleText);
      setFieldValue(fixture, 'message', messageText);

      fieldTexts.forEach((fieldText, index) => {
        setFieldValue(fixture, 'field-' + index, fieldText);
      });

      const sendButton = findEl(fixture, 'send-button').nativeElement;
      expect(sendButton).toBeDefined();
      sendButton.click();

      expect(component.form.invalid).toBe(false);
      expect(fakeTicketService.addTicket).toHaveBeenCalledWith(
        component.courseid, expectedTicket
      );
    }));

    // Ei toimi vielä.
    /*
    it('shows field tooltip', fakeAsync(() => {
      const tooltipIcon = findEl(fixture, 'field-tooltip-0').nativeElement;
      const tooltipDirective = tooltipIcon.injector.get(MatTooltip);

      // Simulate a click to trigger tooltip
      tooltipIcon.triggerEventHandler('click', null);
      tick();
      fixture.detectChanges();
      tick();
      const tooltipText = tooltipDirective.message;
      expect(tooltipText).toBe(fields[0].ohje);
    });
    */

  }),

  describe('Edit existing ticket', () => {

    beforeEach(async () => {
      fakeCourseService = jasmine.createSpyObj('CourseService', {
        getTicketFieldInfo: Promise.resolve({
          kuvaus: helpText,
          kentat: courseDummyData.ticketFields
        }),
      });

      fakeTicketService = jasmine.createSpyObj('TicketService', {
        editTicket: Promise.resolve({ success: true }),
        getTicket: Promise.resolve(ticketDummyData.tiketti),
      });

      // Luodaan komponentti tiketin luomistilassa

      interface State { editTicket: boolean };
      const state: State = { editTicket: true };
      window.history.pushState(state, '', '');

      // SharedModule mm. matAutocomplete:a varten.
      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(EditAttachmentsComponent),
          MockComponent(EditorComponent),
          MockComponent(BeginningButtonComponent),
          MockComponent(HeadlineComponent),
          SubmitTicketComponent
        ],
        imports: [
          BrowserAnimationsModule,
          MatIconModule,
          MatInputModule,
          ReactiveFormsModule,
          RouterTestingModule,
          MatAutocompleteModule,
          MatTooltipModule
        ],
        providers: [
          { provide: CourseService, useValue: fakeCourseService },
          { provide: TicketService, useValue: fakeTicketService },
          StoreService
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(SubmitTicketComponent);
      component = fixture.componentInstance;
      component.courseid = String(ticketDummyData.tiketti.kurssi);
      component.id = ticketDummyData.tiketti.id;
      fixture.detectChanges();
    });

    it('prefills the form fields', fakeAsync(() => {
      const ticket = ticketDummyData.tiketti;
      const expextedTitle = ticket.otsikko;
      const expextedMessage = ticket.viesti;
      const fields = ticket.kentat;
      const expectedField = fields ? [fields[0].arvo, fields[1].arvo] : '';
      const expectedFieldLabel = fields ? [fields[0].otsikko, fields[1].otsikko] : '';
      fixture.detectChanges(); // Ei löydä lisäkenttiä ilman tätä toista kutsua.
      tick();
      const title = findEl(fixture, 'title').nativeElement;
      const message = findEl(fixture, 'message').nativeElement;
      const field = [ findEl(fixture, 'field-0').nativeElement,
                      findEl(fixture, 'field-1').nativeElement];
      const fieldLabel = [ findEl(fixture, 'field-label-0').nativeElement,
                           findEl(fixture, 'field-label-1').nativeElement];

      expect(title.value).toBe(expextedTitle);
      expect(field[0].value).toBe(expectedField[0]);
      expect(field[1].value).toBe(expectedField[1]);
      expect(fieldLabel[0].innerText.trim()).toBe(expectedFieldLabel[0]);
      expect(fieldLabel[1].innerText.trim()).toBe(expectedFieldLabel[1]);
      expect(message.value).toBe(expextedMessage);
    }));

    it("makes correct method call after changing fields' content", fakeAsync(() => {
      fixture.detectChanges(); // Ei löydä lisäkenttiä ilman tätä toista kutsua.
      const expectedTitle = 'Edited title';
      const expectedMessage = 'Edited message';
      const expectedField0 = '10';
      const ticket = ticketDummyData.tiketti;
      const fields = ticket.kentat!;
      const expectedTicket = {
          otsikko: expectedTitle,
          viesti: expectedMessage,
          kentat: [
            { arvo: expectedField0, id: Number(fields[0].id) },
            { arvo: fields[1].arvo, id: Number(fields[1].id) }
          ]
        }
      // setFieldValue(fixture, 'message', expectedMessage);
      setFieldValue(fixture, 'title', expectedTitle);
      setFieldValue(fixture, 'message', expectedMessage);
      setFieldValue(fixture, 'field-0', expectedField0);
      const field0 = findEl(fixture, 'field-0');
      tick();
      findEl(fixture, 'send-button').nativeElement.click();
      tick();
      // const title = findEl(fixture, 'title').nativeElement;
      // expect(title.value).toBe(expectedTitle);
      expect(fakeTicketService.editTicket).toHaveBeenCalledWith(
        ticketDummyData.tiketti.id, expectedTicket, component.courseid
      );
    }));

  })

});
