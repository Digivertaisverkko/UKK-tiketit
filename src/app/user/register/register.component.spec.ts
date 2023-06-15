import { ComponentFixture, ComponentFixtureAutoDetect, TestBed
    } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { RegisterComponent } from '@user/register/register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      createAccount:undefined,
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
      onIsUserLoggedIn: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(HeadlineComponent),
        RegisterComponent
      ],
      imports: [
        MatFormFieldModule
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
