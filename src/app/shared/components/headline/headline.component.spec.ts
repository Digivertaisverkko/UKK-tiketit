import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeadlineComponent } from './headline.component';
import { CourseService } from '@course/course.service';

describe('HeadlineComponent', () => {
  let component: HeadlineComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<HeadlineComponent>;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [ HeadlineComponent ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
