import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockComponent } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { CourseDummyData } from '@course/course.dummydata';
import { CourseService } from '@course/course.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';
import { EditorComponent } from '@shared/editor/editor.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { SharedModule } from '@shared/shared.module';
import { StoreService } from '@core/services/store.service';
import { SubmitFaqComponent } from './submit-faq.component';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { TicketService, UusiUKK } from '@ticket/ticket.service';


describe('SubmitFaqComponent', () => {
  let component: SubmitFaqComponent;
  const courseDummyData = new CourseDummyData;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitFaqComponent>;
  const ticketDummyData = new TicketDummyData;

  describe('Create new FAQ', () => {

    beforeEach(async () => {
      fakeCourseService = jasmine.createSpyObj('CourseService', {
        getTicketFieldInfo: Promise.resolve({
          kuvaus: '',
          kentat: courseDummyData.ticketFields
        }),
      });

      fakeTicketService = jasmine.createSpyObj('TicketService', {
        addFaq: Promise.resolve({ success: true,
            uusi: { tiketti: 2, kommentti: 4 }
        })
      });

      // Luodaan komponentti tiketin luomistilassa
      interface State { editFaq: boolean };
      const state: State = { editFaq: false };
      window.history.pushState(state, '', '');

      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(EditAttachmentsComponent),
          MockComponent(EditorComponent),
          MockComponent(BeginningButtonComponent),
          MockComponent(HeadlineComponent),
          SubmitFaqComponent
        ],
        imports: [
          BrowserAnimationsModule,
          MatIconModule,
          MatInputModule,
          ReactiveFormsModule,
          RouterTestingModule,
          SharedModule
        ],
        providers: [
          { provide: CourseService, useValue: fakeCourseService },
          { provide: StoreService },
          { provide: TicketService, useValue: fakeTicketService }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(SubmitFaqComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('calls correct method to create a new FAQ after Publish click', fakeAsync(() => {
      component.courseid = '1';
      component.id = '';
      const titleText = 'Uusi UKK';
      const questionText = 'Usein kysytty kysymys';
      const answerText = 'Vastaus';
      const fieldTexts = [ 'Tehtävä 1', 'Kotitehtävä' ];
      const fields = courseDummyData.ticketFields;

      const expectedFAQ: UusiUKK = {
        otsikko: titleText,
        viesti: questionText,
        kentat: [
          { arvo: fieldTexts[0], id: fields[0].id },
          { arvo: fieldTexts[1], id: fields[1].id }
        ],
        vastaus: answerText
      }

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      setFieldValue(fixture, 'title', titleText);
      setFieldValue(fixture, 'message', questionText);
      setFieldValue(fixture, 'answer', answerText);
      fieldTexts.forEach((fieldText, index) => {
        setFieldValue(fixture, 'field-' + index, fieldText);
      });
      findEl(fixture, 'send-button').nativeElement.click();

      expect(component.form.invalid).toBe(false);
      expect(fakeTicketService.addFaq).toHaveBeenCalledWith(
        expectedFAQ, component.courseid);
    }));

  });

  describe('Edit existing FAQ', () => {

    beforeEach(async () => {
      fakeCourseService = jasmine.createSpyObj('CourseService', {
        getTicketFieldInfo: Promise.resolve({
          kuvaus: '',
          kentat: courseDummyData.ticketFields
        }),
      });

      fakeTicketService = jasmine.createSpyObj('TicketService', {
        editFaq: undefined,
        getTicket: Promise.resolve(ticketDummyData.ukk)
      });

      // Luodaan komponentti tiketin luomistilassa
      interface State { editFaq: boolean };
      const state: State = { editFaq: true };
      window.history.pushState(state, '', '');

      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(EditAttachmentsComponent),
          MockComponent(EditorComponent),
          MockComponent(BeginningButtonComponent),
          MockComponent(HeadlineComponent),
          SubmitFaqComponent
        ],
        imports: [
          BrowserAnimationsModule,
          MatAutocompleteModule,
          MatIconModule,
          MatInputModule,
          MatTooltipModule,
          ReactiveFormsModule,
          RouterTestingModule,
          SharedModule,
        ],
        providers: [
          { provide: CourseService, useValue: fakeCourseService },
          { provide: StoreService },
          { provide: TicketService, useValue: fakeTicketService }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(SubmitFaqComponent);
      component = fixture.componentInstance;
      component.courseid = '1'
      component.id = String(ticketDummyData.ukk.id);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });


    it('prefills the form fields', fakeAsync(() => {
      const ticket = ticketDummyData.ukk;
      const expextedTitle = ticket.otsikko;
      const expextedMessage = ticket.viesti;
      const fields = ticket.kentat;
      const expectedField = fields ? [fields[0].arvo, fields[1].arvo] : '';
      const expectedFieldLabel = fields ? [fields[0].otsikko, fields[1].otsikko] : '';
      tick(1000);
      fixture.detectChanges(); // Ei löydä lisäkenttiä ilman tätä toista kutsua.
      tick(1000);
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


  });

});
