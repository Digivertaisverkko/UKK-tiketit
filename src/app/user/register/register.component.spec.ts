import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, tick
    } from '@angular/core/testing';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { authDummyData } from '@core/services/auth.dummydata';
import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { RegisterComponent } from '@user/register/register.component';
import { courseDummyData } from '@course/course.dummydata';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<RegisterComponent>;

  const courseName = 'Ohjelmointimatematiikan perusteet';
  const invitationID = '469a1aac-1962-4eef-9035-2a662ff43c94';

  beforeEach(async () => {

    fakeAuthService = jasmine.createSpyObj('AuthService', {
      createAccount: Promise.resolve({ success: true }),
      getLoginInfo: Promise.resolve(authDummyData.loginInfo),
      login: Promise.resolve({ success: true }),
      logout: undefined
    });

    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: Promise.resolve(courseName),
      getInvitedInfo: Promise.resolve(courseDummyData.invitedInfo)
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      getBaseTitle: undefined,
      onIsUserLoggedIn: of('false')
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(HeadlineComponent),
        RegisterComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AuthService, useValue: fakeAuthService },
        { provide: CourseService, useValue: fakeCourseService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    component.invitation = invitationID;
    component.courseid = '1';
    component.ngOnInit();
  });

  it('fetches invitation info and shows form', fakeAsync(() => {
    tick();
    expect(fakeCourseService.getInvitedInfo).toHaveBeenCalledWith(
      component.courseid, invitationID
    );
    /*
    const courseName = findEl(fixture, 'course-name').nativeElement;
    console.dir(courseName);
    expect(courseName.innerHTML).toBe(courseName);
    expect(courseName).toBeTruthy();
    */
    const email = findEl(fixture, 'email').nativeElement;
    expect(email).toBeTruthy();
    expect(email.value).toBe(courseDummyData.invitedInfo.sposti);
    const submitButton = findEl(fixture, 'submit-button').nativeElement;
    expect(submitButton).toBeTruthy();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("sends an invitation, logs in and routes to course's list view", fakeAsync(() => {
    const name = 'Test User';
    const password = 'salasana';
    const email = courseDummyData.invitedInfo.sposti;
    const navigateSpy = spyOn(component.router, 'navigate');
    const courseID = courseDummyData.invitedInfo.kurssi;
    const loginID = authDummyData.loginInfo['login-id'];
    const expectedRoute = ['course/' + courseID +'/list-tickets'];
    const expectedState = { message: 'account created' };
    const submitButton = findEl(fixture, 'submit-button').nativeElement;

    tick(100);
    setFieldValue(fixture, 'name', name);
    setFieldValue(fixture, 'password', password);
    setFieldValue(fixture, 'repassword', password);
    submitButton.click();
    tick();
    fixture.detectChanges();

    expect(fakeAuthService.createAccount).toHaveBeenCalledWith(
      name, email, password, invitationID
    );
    expect(fakeAuthService.getLoginInfo).toHaveBeenCalledWith(
      'own', String(courseID)
    );
    expect(fakeAuthService.login).toHaveBeenCalledWith(
      email, password, loginID
    );
    expect(navigateSpy).toHaveBeenCalledWith(expectedRoute, { state: expectedState });
  }));
});
