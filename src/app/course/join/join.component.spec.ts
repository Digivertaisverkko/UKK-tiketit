import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { JoinComponent } from './join.component';
import { AuthService } from '@core/services/auth.service';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { CourseDummyData } from '@course/course.dummydata';

describe('JoinComponent', () => {
  let component: JoinComponent;
  const courseDummyData = new CourseDummyData;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: Partial<CourseService>;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(() => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      logout: undefined,
      navigateToLogin: undefined,
      saveRedirectURL: undefined
    });

    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: undefined,
      getInvitedInfo: Promise.resolve(courseDummyData.invitedInfo),
      joinCourse: undefined
    });

    TestBed.configureTestingModule({
      declarations: [
        JoinComponent,
        MockComponent(HeadlineComponent)
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: CourseService, useValue: fakeCourseService }
      ]
    });
    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    component.invitation = '1234567890';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
