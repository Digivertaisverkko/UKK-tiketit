import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent } from 'ng-mocks';

import { SubmitFaqComponent } from './submit-faq.component';
import { CourseService } from '@course/course.service';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { EditorComponent } from '@shared/editor/editor.component';
import { TicketService } from '@ticket/ticket.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';

describe('SubmitFaqComponent', () => {
  let component: SubmitFaqComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<SubmitFaqComponent>;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getTicketFieldInfo: Promise.resolve(''),
    });

    fakeTicketService = jasmine.createSpyObj('TicketService', {
      addFaq: undefined,
      editFaq: undefined,
      getTicket: undefined
    });

    // Luodaan komponentti tiketin luomistilassa
    window.history.pushState({ editFaq: 'false'}, '', '');

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
        ReactiveFormsModule
      ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService },
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
