import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MockComponent } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';

import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { courseDummyData } from '@course/course.dummydata';
import { CourseService } from '@course/course.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';
import { EditorComponent } from '@shared/editor/editor.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { SharedModule } from '@shared/shared.module';
import { SubmitFaqComponent } from './submit-faq.component';
import { TicketService, UusiUKK } from '@ticket/ticket.service';
import { StoreService } from '@core/services/store.service';

describe('SubmitFaqComponent', () => {
  let component: SubmitFaqComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitFaqComponent>;

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
      }),
      editFaq: undefined,
      getTicket: undefined
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
    setFieldValue(fixture, 'question', questionText);
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
