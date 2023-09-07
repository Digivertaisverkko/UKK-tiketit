import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import * as shajs from 'sha.js';
import { TestBed } from '@angular/core/testing';

import { AuthDummyData } from './auth.dummydata';
import { AuthService } from './auth.service';
import { CourseService } from '@course/course.service';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';
import { LoginInfo, LoginResult, User } from '@core/core.models';
import { StoreService } from './store.service';

let api = environment.apiBaseUrl;
const courseID = '1';
environment.testing = true;
const authDummyData = new AuthDummyData;

describe('AuthService', () => {
  let auth: AuthService;
  let controller: HttpTestingController;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeErrorService: jasmine.SpyObj<ErrorService>;
  let store: StoreService;

  beforeEach(async () => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getMyCourses: undefined
    });

    fakeErrorService = jasmine.createSpyObj('ErrorService', {
      handleServerError: undefined
    });

    await TestBed.configureTestingModule({
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
      });

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
        expect(userInfo?.id).toEqual(authDummyData.userInfoTeacher.id);
        expect(userInfo?.nimi).toEqual(authDummyData.userInfoTeacher.nimi);
        expect(userInfo?.sposti).toEqual(authDummyData.userInfoTeacher.sposti);
        expect(userInfo?.asema).toEqual(authDummyData.userInfoTeacher.asema);
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

  describe('log manually in', () => {

    it('/login request has the correct headers.', (done) => {

      const loginType = 'own';
      const codeChallenge = '61b6ec7fff6f21ed0f9b96ad1ae7b5f741c89412c044d5c5e6a344a0f4c94438';

      const expectedHeaders = {
        'login-type': loginType,
        'code-challenge': codeChallenge,
        'kurssi': courseID,
      };

      auth.getLoginInfo(loginType, courseID).then(() => {
        done();
      }).catch(e => {
        console.log(e);
      })

      const url = `${api}/login`;
      const req = controller.expectOne(url);
      const loginUrl = 'course/1/login?loginid=2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      const loginID = '2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      const result = {
        'login-url': loginUrl,
        'login-id': loginID
      }

      req.flush(result);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('login-type')).toEqual(expectedHeaders['login-type']);
      expect(req.request.headers.has('code-challenge')).toBeTrue();
      expect(req.request.headers.get('kurssi')).toEqual(expectedHeaders['kurssi']);


    });

    it('/omalogin request has the correct headers.', (done) => {

      let api = environment.apiBaseUrl;
      const email = 'marianna.laaksonen@example.com';
      const password = 'salasana';
      const loginID = '2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      // const codeChallenge = '61b6ec7fff6f21ed0f9b96ad1ae7b5f741c89412c044d5c5e6a344a0f4c94438';

      const expectedHeaders = {
        'ktunnus': email,
        'salasana': password,
        'login-id': loginID,
      }

      auth.login(email, password, loginID).then(() => {
        done();
      }).catch(e => {
        console.log(e);
      })

      const url = `${api}/omalogin`;
      const req = controller.expectOne(url);
      const result = {
      }
      req.flush(result);

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('ktunnus')).toEqual(expectedHeaders['ktunnus']);
      expect(req.request.headers.get('salasana')).toEqual(expectedHeaders['salasana'])
      expect(req.request.headers.has('login-id')).toBeTrue();

    });


    it('/authtoken request after /omalogin with correct headers',  fakeAsync(()  => {

      let api = environment.apiBaseUrl;
      const email = 'marianna.laaksonen@example.com';
      const password = 'salasana';
      const loginID = '2209fe8d-9a04-41fb-bf63-2475ce8efda3';
      const loginCode = '9c16b0e1-a101-47a6-93dc-2c6b2961d195';

      const loginType = 'own'
      const expectedHeaders2 = {
        'login-type': loginType,
        'code-verifier': '12345',
        'login-code': loginCode,
      };

      auth.login(email, password, loginID).then(res => {

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

    it('logs in using all 3 login requests', fakeAsync(() => {

      const loginType = 'own';
      const email = 'marianna.laaksonen@example.com';
      const password = 'salasana';

      auth.getLoginInfo(loginType, courseID).then((loginInfo: LoginInfo) => {
        expect(loginInfo['login-id']).toBeDefined();
        return auth.login(email, password, loginInfo['login-id']);
      }).then((loginResult: LoginResult) => {
        expect(loginResult.success).toBe(true);
      }).catch(e => {
        console.log(e);
      })

      const url = `${api}/login`;
      const req = controller.expectOne(url);

      const loginID = '728deabd-a694-4585-99ac-19a361821a5b';
      const loginUrl = 'course/1/login?loginid=' + loginID;
      const realCodeChallenge = req.request.headers.get('code-challenge');
      const result = {
        'login-url': loginUrl,
        'login-id': loginID
      }
      req.flush(result);
      tick();

      const loginCode = '9c16b0e1-a101-47a6-93dc-2c6b2961d195';
      const url2 = `${api}/omalogin`;
      const req2 = controller.expectOne(url2);
      const result2 = {
        success: true,
        'login-code': loginCode
      }
      req2.flush(result2);
      tick();

      const url3 = `${api}/authtoken`;
      const req3 = controller.expectOne(url3);
      const realCodeVerifier = req3.request.headers.get('code-verifier');
      let codeChallenge;

      if (realCodeVerifier !== null) {
        codeChallenge = shajs('sha256').update(realCodeVerifier).digest('hex');
      } else {
        fail("'code-verifier' ei löydetty kutsun headereista. ");
      }

      let result3;
      if (realCodeChallenge === codeChallenge) {
        result3 = { "success": true }
      } else {
        result3 = { "success": false }
      }
      req3.flush(result3);
      tick();
    }));

  });



});
