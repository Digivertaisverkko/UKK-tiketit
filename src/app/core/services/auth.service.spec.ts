import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { authDummyData } from './auth.dummydata';
import { ErrorService } from './error.service';
import { StoreService } from './store.service';
import { CourseService } from '@course/course.service';
import { User } from '@core/core.models';

const api = environment.apiBaseUrl;
const courseID = '1';
environment.testing = true;

fdescribe('AuthService', () => {
  let auth: AuthService;
  let controller: HttpTestingController;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeErrorService: jasmine.SpyObj<ErrorService>;
  let store: StoreService;

  beforeEach(() => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getMyCourses: undefined
    });

    fakeErrorService = jasmine.createSpyObj('ErrorService', {
      handleServerError: undefined
    });

    /*
    fakeStoreService = jasmine.createSpyObj('StoreService', {
      setCourseName: undefined,
      setLoggedIn: undefined,
      setNotLoggedIn: undefined,
      setParticipant: undefined,
      setUserInfo: undefined,
      unsetPosition: undefined
    }); */

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService },
        { provide: ErrorService, useValue: fakeErrorService },
        StoreService
      ]
    });
    // { provide: StoreService, useValue: fakeStoreService }
    auth = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
    store = TestBed.inject(StoreService);

  });

  afterEach(() => {
    controller.verify(); // Verify that there are no outstanding requests
  });

  it('should be created', () => {
    expect(auth).toBeTruthy();
  });


  describe('state of auth info is correctly set and retrieved', () => {

    it('logged in status when logged in', fakeAsync(() => {

      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(authDummyData.oikeudetOpettaja);
      tick();

      store.trackLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBeTrue();
      })

    }))

    it('logged in status when logged out', fakeAsync(() => {

      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(null);
      tick();

      const url2 = `${api}/minun`;
      const request2 = controller.expectOne(url2);
      request2.flush(null);
      tick();

      store.trackLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBeFalse();
      });

    }));


    it('user info when logged in', fakeAsync(() => {

      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(authDummyData.oikeudetOpettaja);
      tick();

      store.trackUserInfo().subscribe((userInfo: User | null) => {
        expect(userInfo).toEqual(authDummyData.userInfoTeacher);
      })

    }));

    it('course participation status when participating', fakeAsync(() => {

      const courseID = '1';
      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(authDummyData.oikeudetOpettaja);
      tick();

      store.trackIfParticipant().subscribe(isParticipant => {
        expect(isParticipant).toBeTrue();
      })

    }));

    it('logged status when logged to another course', fakeAsync(() => {

      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(null);
      tick();

      const url2 = `${api}/minun`;
      const request2 = controller.expectOne(url2);
      request2.flush(authDummyData.minunOpettaja);
      tick();

      store.trackLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBeTrue();
      });

    }));

    it('user info when logged to another course', fakeAsync(() => {

      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(null);
      tick();

      const url2 = `${api}/minun`;
      const request2 = controller.expectOne(url2);
      request2.flush(authDummyData.minunOpettaja);
      tick();

      store.trackUserInfo().subscribe((userInfo: User | null) => {
        expect(userInfo).toEqual(authDummyData.minunOpettaja);
      })

    }));

  });


});
