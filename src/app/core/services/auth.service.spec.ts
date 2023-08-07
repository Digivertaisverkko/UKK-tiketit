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

let api = environment.apiBaseUrl;
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

  fdescribe('log manually in', () => {

    it('/login request has the correct headers.', fakeAsync(() => {

      const loginType = 'own';

      const expectedHeaders = {
        'login-type': loginType,
        'code-challenge': 'EXPECTED_CODE_CHALLENGE',
        'kurssi': courseID,
      };

      auth.getLoginInfo(loginType, courseID).then(res => {

      }).catch(e => {
        console.log(e);
      })

      const url = `${api}/login`;
      const req = controller.expectOne(url);

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('login-type')).toEqual(expectedHeaders['login-type']);
      expect(req.request.headers.has('code-challenge')).toBeTrue();
      expect(req.request.headers.get('kurssi')).toEqual(expectedHeaders['kurssi']);

      req.flush(null);

    }));

    it('/omalogin request has the correct headers.', fakeAsync(() => {

      let api = environment.apiBaseUrl;
      const email = 'marianna.laaksonen@example.com';
      const password = 'salasana';
      const loginID = '2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      const loginType = 'own'
      const loginUrl = 'course/1/login?loginid=2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      // const codeChallenge = '61b6ec7fff6f21ed0f9b96ad1ae7b5f741c89412c044d5c5e6a344a0f4c94438';
      // const loginCode = '9c16b0e1-a101-47a6-93dc-2c6b2961d195';

      const expectedHeaders = {
        'ktunnus': email,
        'salasana': password,
        'login-id': loginID,
      }

      auth.login(email, password, loginID).then(res => {

      }).catch(e => {
        console.log(e);
      })

      const url = `${api}/omalogin`;
      const req = controller.expectOne(url);
      const result = {
        'login-url': loginUrl,
        'login-id': loginID
      }

      req.flush(result);

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('ktunnus')).toEqual(expectedHeaders['ktunnus']);
      expect(req.request.headers.get('salasana')).toEqual(expectedHeaders['salasana'])
      expect(req.request.headers.has('login-id')).toBeTrue();

    }));


    it('/authtoken request has correct headers',  fakeAsync(()  => {

      let api = environment.apiBaseUrl;
      const email = 'marianna.laaksonen@example.com';
      const password = 'salasana';
      const loginID = '2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      const loginCode = '9c16b0e1-a101-47a6-93dc-2c6b2961d195';

      const loginType = 'own'
      const codeChallenge = '61b6ec7fff6f21ed0f9b96ad1ae7b5f741c89412c044d5c5e6a344a0f4c94438';
      const expectedHeaders2 = {
        'login-type': loginType,
        'code-verifier': '12345',
        'login-code': loginCode,
      };

      const successResult = {}

      auth.login(email, password, loginID).then(res => {

        console.log('saatiin vastaus: ' + res);

        expect(req2.request.method).toBe('GET');
        expect(req2.request.headers.get('login-type')).toEqual(expectedHeaders2['login-type']);
        expect(req2.request.headers.has('code-verifier')).toEqual(true);
        expect(req2.request.headers.get('login-code')).toEqual(expectedHeaders2['login-code']);

        expect(res).toEqual({"success": true });

        // done();

      }).catch(e => {
        console.log(e);
      })

      const url = `${api}/omalogin`;
      const req = controller.expectOne(url);
      // const loginUrl = 'course/1/login?loginid=2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      const result = {
        success: true,
        'login-code': loginCode
      }
      req.flush(result);

      tick();

      const url2 = `${api}/authtoken`;
      const req2 = controller.expectOne(url2);
      const result2 = {"success": true };

      req2.flush(result2);
      tick();

    }));


  });

});
