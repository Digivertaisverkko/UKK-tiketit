import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { EditFieldComponent } from './edit-field.component';
import { CourseService } from '@course/course.service';
import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('EditFieldComponent', () => {
  let component: EditFieldComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<EditFieldComponent>;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getTicketFieldInfo: undefined,
      setTicketField: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        EditFieldComponent,
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
      ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
