import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, tick
    } from '@angular/core/testing';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { AuthService } from '@core/services/auth.service';
import { courseDummyData } from '@course/course.dummydata';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { MatInputModule } from '@angular/material/input';
import { RegisterComponent } from '@user/register/register.component';
import { StoreService } from '@core/services/store.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
//import { FakeCourseService } from '@course/fake-course.service';

describe('RegisterComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: RegisterComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: Pick<CourseService, 'getCourseName' | 'getInvitedInfo'>;
  // let fakeCourseService: FakeCourseService;
  let fakeStoreService: Pick<StoreService, 'getBaseTitle' | 'onIsUserLoggedIn'>;
  let fixture: ComponentFixture<RegisterComponent>;
  let courseName: string;
  let invitationID: string;
  let loader: HarnessLoader;
  let courseID: string;

  describe('Course 1', () => {

    beforeEach(async () => {

      courseID = '1';
      courseName = 'Ohjelmointimatematiikan perusteet';
      invitationID = '469a1aac-1962-4eef-9035-2a662ff43c94';

      fakeAuthService = jasmine.createSpyObj('AuthService', {
        createAccount: Promise.resolve({ success: true }),
        getLoginInfo: Promise.resolve(authDummyData.loginInfo),
        login: Promise.resolve({ success: true }),
        logout: Promise.resolve({ success: true })
      });

      // fakeCourseService = jasmine.createSpyObj('AuthService', new FakeCourseService);

      fakeCourseService = jasmine.createSpyObj('CourseService', {
        getCourseName: Promise.resolve(courseName),
        getInvitedInfo: Promise.resolve(courseDummyData.invitedInfo),
      });

      fakeStoreService = jasmine.createSpyObj('StoreService', {
        getBaseTitle: undefined,
        onIsUserLoggedIn: of('false')
      });

      await TestBed.configureTestingModule({
        declarations: [
          MockComponent(HeadlineComponent),
          RegisterComponent,
        ],
        imports: [
          BrowserAnimationsModule,
          MatCheckboxModule,
          MatDialogModule,
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
      loader = TestbedHarnessEnvironment.loader(fixture);
      component = fixture.componentInstance;
      // @Input -arvoja, jotka otetaan URL:sta.
      component.invitation = invitationID;
      component.courseid = courseID;
      component.ngOnInit();
    });

    it('fetches invitation info and shows form', fakeAsync(() => {
      tick();
      expect(fakeCourseService.getInvitedInfo).toHaveBeenCalledWith(
        component.courseid, invitationID
      );
      fixture.detectChanges();
      tick();
      expect(fakeCourseService.getCourseName).toHaveBeenCalledWith(
        courseID
      );
      // Ei toimi vielä.
      // const nameEl = findEl(fixture, 'course-name').nativeElement;
      // expect(nameEl.textContent).toBe(courseName)
      const email = findEl(fixture, 'email').nativeElement;
      expect(email).toBeTruthy();
      expect(email.value).toBe(courseDummyData.invitedInfo.sposti);
      const submitButton = findEl(fixture, 'submit-button').nativeElement;
      expect(submitButton).toBeTruthy();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it("sends an invitation, logs in and routes to course's list view", fakeAsync(async() => {
      const checkbox = await loader.getHarness(MatCheckboxHarness.with(
        { selector: '[data-testid=consent-checkbox]' }));
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
      await checkbox.check();
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

// -----------------------------------------------------------------------------

  describe('Course 2', () => {

    beforeEach(async () => {

      courseID = '2'
      courseName = 'Testikurssi 2';
      invitationID = '82b3e5d8-8a49-4cd1-b9b0-ec09e9942ba7'

      fakeAuthService = jasmine.createSpyObj('AuthService', {
        createAccount: Promise.resolve({ success: true }),
        getLoginInfo: Promise.resolve(authDummyData.loginInfo),
        login: Promise.resolve({ success: true }),
        logout: undefined
      });

      fakeCourseService = jasmine.createSpyObj('CourseService', {
        getCourseName: Promise.resolve(courseName),
        getInvitedInfo: Promise.resolve(courseDummyData.invitedInfoCourse2)
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
          MatCheckboxModule,
          MatDialogModule,
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
      loader = TestbedHarnessEnvironment.loader(fixture);
      // @Input -arvoja, jotka otetaan URL:sta.
      component.invitation = invitationID;
      component.courseid = courseID;

      component.ngOnInit();
    });

    it("sends an invitation, logs in and routes to course's list view", fakeAsync(async () => {
      tick();
      const checkbox = await loader.getHarness(MatCheckboxHarness.with(
        { selector: '[data-testid=consent-checkbox]' }));
      const name = 'John Doe';
      const password = 'password';
      const email = courseDummyData.invitedInfoCourse2.sposti;
      const navigateSpy = spyOn(component.router, 'navigate');
      const courseID = courseDummyData.invitedInfoCourse2.kurssi;
      const loginID = authDummyData.loginInfo['login-id'];
      const expectedRoute = ['course/' + courseID +'/list-tickets'];
      const expectedState = { message: 'account created' };
      const submitButton = findEl(fixture, 'submit-button').nativeElement;

      tick(100);
      setFieldValue(fixture, 'name', name);
      setFieldValue(fixture, 'password', password);
      setFieldValue(fixture, 'repassword', password);
      await checkbox.check();
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


});

