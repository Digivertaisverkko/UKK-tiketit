import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { PageNotFoundComponent } from './page-not-found.component';
import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<PageNotFoundComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      createAccount: undefined,
      getLoginInfo: undefined,
      login: undefined,
      logout: undefined
    });

    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: undefined,
      getInvitedInfo: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      getBaseTitle: undefined,
      getIsLoggedIn: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(HeadlineComponent),
        PageNotFoundComponent
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: CourseService, useValue: fakeCourseService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
