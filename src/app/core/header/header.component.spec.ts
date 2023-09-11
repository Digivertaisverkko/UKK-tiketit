import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from "@angular/router/testing";

import { AuthDummyData } from '@core/services/auth.dummydata';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from './header.component';
import { StoreService } from '@core/services/store.service';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { ActivationEnd } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: HeaderComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: StoreService;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      logout: Promise.resolve({ success: true }),
      navigateToLogin: Promise.resolve(true)
    });

    await TestBed.configureTestingModule({
      declarations: [
        HeaderComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        StoreService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    store = TestBed.inject(StoreService);
    component = fixture.componentInstance;
    const courseID = '1';
    const activationEndEvent = new ActivationEnd(null!);
    activationEndEvent.snapshot = {
      paramMap: {
        get: () => courseID
      }
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* For logged in user 'Logout' is shown and clicking it calls right method. */
  /*
  it('shows logout option when logged in and it makes correct method call', fakeAsync(() => {
    store.setNotLoggegIn();
    fixture.detectChanges();
    tick();
    // const accountBtn = findEl(fixture, 'account-button');
    // const logoutBtn = findEl(fixture, 'logout-button');
    findEl(fixture, 'account-button').nativeElement.click();
    tick(500);
    const loginBtn = findEl(fixture, 'login-button').nativeElement;
    expect(loginBtn).toBeDefined();
    loginBtn.click();
    tick();
    expect(fakeAuthService.navigateToLogin).toHaveBeenCalled();
    flush();
  }));
  */

  it('shows login option when logged out and it makes correct method call', fakeAsync(() => {

    store.setUserInfo(authDummyData.userInfoEsko);
    store.setLoggedIn();
    fixture.detectChanges();
    tick();
    // const accountBtn = findEl(fixture, 'account-button');
    // const logoutBtn = findEl(fixture, 'logout-button');
    findEl(fixture, 'account-button').nativeElement.click();
    tick(500);
    const logoutBtn = findEl(fixture, 'logout-button').nativeElement;
    expect(logoutBtn).toBeDefined();
    logoutBtn.click();
    tick();
    expect(fakeAuthService.logout).toHaveBeenCalled();
    flush();
  }));
});
