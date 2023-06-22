import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { StoreService } from './store.service';
import { CourseService } from '@course/course.service';

describe('AuthService', () => {
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeErrorService: jasmine.SpyObj<ErrorService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let service: AuthService;

  beforeEach(() => {
    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getMyCourses: undefined
    });

    fakeErrorService = jasmine.createSpyObj('ErrorService', {
      handleServerError: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      setCourseName: undefined,
      setLoggedIn: undefined,
      setNotLoggedIn: undefined,
      setParticipant: undefined,
      setUserInfo: undefined,
      unsetPosition: undefined
    });

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: CourseService, useValue: fakeCourseService },
        { provide: ErrorService, useValue: fakeErrorService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
