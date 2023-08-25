import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, tick
    } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MockComponent } from 'ng-mocks';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { LoginComponent } from '@user/login/login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fakeAuthService: Partial<AuthService>;
  let fakeRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };
  let fixture: ComponentFixture<LoginComponent>;

  const courseId = '123';
  const loginId = '321';
  const redirectUrl = 'course/' + loginId + '/list-tickets';

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      login: Promise.resolve({success: true, redirectUrl: redirectUrl})
    });

    await TestBed.configureTestingModule({
      declarations: [
        LoginComponent,
        MockComponent(HeadlineComponent)
      ],
      imports: [
        BrowserAnimationsModule,
        MatInputModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AuthService, useValue: fakeAuthService },
        {
          provide: StoreService,
          useValue: {
            setNotLoggegIn: () => {},
            setParticipant: () => {}
          } as Partial<StoreService>
        },
        { provide: Router, useValue: fakeRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // asetetaan Input() loginid arvo
    component.courseid = courseId;
    component.loginid = loginId;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('successfully submit login and navigate correctly', fakeAsync(async () => {
    fixture.detectChanges();

    expect(findEl(fixture, 'submit').properties['disabled']).toBe(true);

    setFieldValue(fixture, 'email', 'testi');
    setFieldValue(fixture, 'password', '12345');

    // odota, että async validaattorit tekevät tehtävänsä
    tick(100);
    fixture.detectChanges();

    expect(findEl(fixture, 'submit').properties['disabled']).toBe(false);

    findEl(fixture, 'form').triggerEventHandler('submit', {});
    tick(100);
    fixture.detectChanges();

    expect(fakeAuthService.login).toHaveBeenCalled();
    expect(fakeRouter.navigateByUrl).toHaveBeenCalledWith(redirectUrl);
  }));

});
