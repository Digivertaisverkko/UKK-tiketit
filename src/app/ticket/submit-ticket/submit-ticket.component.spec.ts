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
import { Kentta } from '@ticket/ticket.service';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { courseDummyData } from '@course/course.dummydata';
import { StoreService } from '@core/services/store.service';


describe('SubmitTicketComponent', () => {
  let component: SubmitTicketComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitTicketComponent>;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getTicketFieldInfo: Promise.resolve({
        kuvaus: '',
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
      editTicket: undefined,
      getTicket: Promise.resolve({
        otsikko: 'Testiotsikko',
        viesti: 'Testiviesti',
        liitteet: [],
        kommenttiID: 1,
        kentat: [] as Kentta[],
      }),
    });

    // Luodaan komponentti tiketin luomistilassa

    interface State { editTicket: boolean };
    const state: State = { editTicket: false };
    window.history.pushState(state, '', '');

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
        RouterTestingModule
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends a new ticket', fakeAsync(() => {
    component.id = '';
    const titleText = 'Uusi kysymys';
    const messageText = 'Kysymyksen teksti';
    const fieldTexts = ['Tehtävä 1', 'Kotitehtävä'];

    fixture.detectChanges();
    setFieldValue(fixture, 'title', titleText);
    setFieldValue(fixture, 'message', messageText);

    /*
    fieldTexts.forEach((fieldText, index) => {
      setFieldValue(fixture, 'field-' + index, fieldText);
    });
    */

    tick();
    findEl(fixture, 'send-button').nativeElement.click();
    // fixture.detectChanges();

    const fields = courseDummyData.ticketFields;
    const newTicket: UusiTiketti = {
      otsikko: titleText,
      viesti: messageText,
      kentat: [
        { arvo: '', id: fields[0].id },
        { arvo: '', id: fields[1].id }
      ]
    }
    expect(component.form.invalid).toBe(false);
    expect(fakeTicketService.addTicket).toHaveBeenCalledWith(
      component.courseid, newTicket
    );


  }));

});
