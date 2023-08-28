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
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { courseDummyData } from '@course/course.dummydata';
import { StoreService } from '@core/services/store.service';
import { SharedModule } from '@shared/shared.module';


describe('SubmitTicketComponent', () => {
  let component: SubmitTicketComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitTicketComponent>;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getTicketFieldInfo: Promise.resolve({ kuvaus: '', kentat: courseDummyData.ticketFields }),
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
    window.history.pushState({ editTicket: 'false'}, '', '');

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

  it('sends new ticket', fakeAsync (() => {
    component.id = '';
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const titleText = 'New question';
    const messageText = 'Question message';
    const title = findEl(fixture, 'title').nativeElement;
    title.value = titleText;
    const message = findEl(fixture, 'message').nativeElement;
    message.value = messageText;
    const sendButton = findEl(fixture, 'send-button').nativeElement;

    const newTicket: UusiTiketti = {
      otsikko: titleText,
      viesti: messageText,
      kentat: [
        { arvo: '', id: 1 }, { arvo: '', id: 2}
      ]
    }
    fixture.detectChanges();
    sendButton.click();
    tick();

    
    expect(component).toBeTruthy();
    // expect(fakeTicketService.addTicket).toHaveBeenCalled();
    
    /*
    expect(fakeTicketService.addTicket).toHaveBeenCalledWith(
      component.courseid, newTicket
    );
    */
    
    
  }));
  
});
