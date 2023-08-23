import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';

import { HeadlineComponent } from './headline.component';
import { CourseService } from '@course/course.service';

describe('HeadlineComponent', () => {
  let component: HeadlineComponent;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<HeadlineComponent>;
  let activatedRoute: ActivatedRoute;

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
        { provide: CourseService, useValue: fakeCourseService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ courseid: '1' }))
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadlineComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
