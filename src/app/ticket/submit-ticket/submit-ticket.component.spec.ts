import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { TicketService } from '@ticket/ticket.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';

describe('SubmitTicketComponent', () => {
  let component: SubmitTicketComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitTicketComponent>;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getTicketFieldInfo: Promise.resolve(''),
    });

    fakeTicketService = jasmine.createSpyObj('TicketService', {
      addTicket: undefined,
      editTicket: undefined,
      getTicket: undefined
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
        RouterTestingModule
      ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService },
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
