import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { JoinComponent } from './join.component';
import { AuthService } from '@core/services/auth.service';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(() => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      logout: undefined,
      navigateToLogin: undefined,
      saveRedirectURL: undefined
    });

    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: undefined,
      getInvitationInfo: undefined,
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
