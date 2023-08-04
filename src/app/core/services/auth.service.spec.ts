import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { authDummyData } from './auth.dummydata';
import { ErrorService } from './error.service';
import { StoreService } from './store.service';
import { CourseService } from '@course/course.service';

const api = environment.apiBaseUrl;
environment.testing = true;

fdescribe('AuthService', () => {
  let auth: AuthService;
  let controller: HttpTestingController;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeErrorService: jasmine.SpyObj<ErrorService>;
  let store: StoreService;
  // let fakeStoreService: jasmine.SpyObj<StoreService>;
  let service: AuthService;

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


  describe('state of auth info is correctly set', () => {

    it('gets logged in status when logged in', fakeAsync(() => {

      const courseID = '1';
      auth.fetchUserInfo(courseID);

      const url = `${api}/kurssi/${courseID}/oikeudet`;
      const request = controller.expectOne(url);
      request.flush(authDummyData.oikeudetOpettaja);
      tick();

      store.trackLoggedIn().subscribe(isLoggedIn => {
        expect(isLoggedIn).toBeTrue();
      })

    }))

  });


});
