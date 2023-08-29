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
import { SharedModule } from '@shared/shared.module';
import { MatTooltip } from '@angular/material/tooltip';


describe('SubmitTicketComponent', () => {
  let component: SubmitTicketComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitTicketComponent>;

  const helpText = 'Muista valita oikea tehtävä.';

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
        SharedModule
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

  it('renders the form and sends a new ticket', fakeAsync(() => {
    component.id = '';
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

    component.ngOnInit();
    tick();
    fixture.detectChanges();
    tick();

    const helpTextP = findEl(fixture, 'help-text').nativeElement;
    expect(helpTextP.innerText).toBe(helpText);
    
    const prefilledField = findEl(fixture, 'field-0').nativeElement;
    const prefilledText = fields[0].esitaytto;
    expect(prefilledField.value).toBe(prefilledText);

    /*
    const tooltipIcon = findEl(fixture, 'field-tooltip-0').nativeElement;
    const tooltipDirective = tooltipIcon.injector.get(MatTooltip);
    
    // Simulate a click to trigger tooltip
    tooltipIcon.triggerEventHandler('click', null);
    tick();
    fixture.detectChanges();
    tick();
    const tooltipText = tooltipDirective.message;
    expect(tooltipText).toBe(fields[0].ohje);
    */

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

});
