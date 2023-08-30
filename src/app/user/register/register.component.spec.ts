import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, tick
    } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { CourseService } from '@course/course.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { RegisterComponent } from '@user/register/register.component';
import { courseDummyData } from '@course/course.dummydata';
import { findEl } from '@shared/spec-helpers/element.spec-helper';


fdescribe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeCourseService: jasmine.SpyObj<CourseService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<RegisterComponent>;

  const invitationID = '469a1aac-1962-4eef-9035-2a662ff43c94';

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      createAccount: undefined,
      getLoginInfo: undefined,
      login: undefined,
      logout: undefined
    });

    fakeCourseService = jasmine.createSpyObj('CourseService', {
      getCourseName: Promise.resolve('Ohjelmointimatematiikan perusteet'),
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
        MatFormFieldModule,
        ReactiveFormsModule,
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
    component.ngOnInit();
  });

  it('fetches invitation info and shows form', fakeAsync(() => {
    tick();
    expect(fakeCourseService.getInvitedInfo).toHaveBeenCalledWith(
      component.courseid, invitationID
    );
    const email = findEl(fixture, 'email').nativeElement;
    expect(email).toBeTruthy();
    expect(email.value).toBe(courseDummyData.invitedInfo.sposti);
    const submitButton = findEl(fixture, 'submit-button').nativeElement;
    expect(submitButton).toBeTruthy();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
