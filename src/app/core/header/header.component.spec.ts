import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from "@angular/router/testing";
import { Routes } from '@angular/router';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from './header.component';
import { StoreService } from '@core/services/store.service';
import { MockComponent } from 'ng-mocks';
import { ProfileComponent } from '@user/profile/profile.component';
import { SettingsComponent } from '@course/settings/settings.component';

describe('HeaderComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: HeaderComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<HeaderComponent>;
  let location: Location;
  let store: StoreService;

  const routes: Routes = [
    { path: 'course/:courseid/profile', component: MockComponent(ProfileComponent)},
    { path: 'course/:courseid/settings', component: MockComponent(SettingsComponent)}
  ];

  /* Kuin findEl, mutta jos elementtiä ei ole, niin palauttaa null errorin sijaan.
  Testaamiseen, onko jokin elementti renderoitu. */
  function findElIfExists(fixture: ComponentFixture<any>, selector: string):
      HTMLElement | null {
    try {
      return findEl(fixture, selector).nativeElement;
    } catch {
      return null;
    }
  }

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      logout: Promise.resolve({ success: true }),
      navigateToLogin: Promise.resolve(true)
    });

    await TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        MockComponent(ProfileComponent)
      ],
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        MatToolbarModule,
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        Location,
        StoreService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    location = TestBed.inject(Location);
    store = TestBed.inject(StoreService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* For logged in user 'Logout' is shown and clicking it calls correct method. */

  it('shows logout option when logged in and makes correct method call', fakeAsync(() => {
    component.courseid = '1';
    fixture.detectChanges();
    tick();
    findEl(fixture, 'account-button').nativeElement.click();
    tick(500);
    const loginBtn = findEl(fixture, 'login-button').nativeElement;
    const logoutBtn = findElIfExists(fixture, 'logout-button');
    expect(loginBtn).toBeDefined();
    expect(logoutBtn).toBe(null);
    loginBtn.click();
    tick();
    expect(fakeAuthService.navigateToLogin).toHaveBeenCalled();
    flush();
  }));

  it('shows login option when logged out and makes correct method call', fakeAsync(() => {
    component.courseid = '1';
    store.setUserInfo(authDummyData.userInfoEsko);
    fixture.detectChanges();
    tick();
    findEl(fixture, 'account-button').nativeElement.click();
    tick(500);
    const logoutBtn = findEl(fixture, 'logout-button').nativeElement;
    const loginBtn = findElIfExists(fixture, 'login-button');
    expect(logoutBtn).toBeDefined();
    expect(loginBtn).toBe(null);
    logoutBtn.click();
    tick();
    expect(fakeAuthService.logout).toHaveBeenCalled();
    flush();
  }));

  it('shows correct user name and role for student', fakeAsync(() => {
    component.courseid = '1';
    const user = authDummyData.userInfoEsko;
    store.setUserInfo(user);
    fixture.detectChanges();
    tick();
    const username = findEl(fixture, 'header-username').nativeElement;
    expect(username.textContent).toContain(user.nimi);
    const userrole = findEl(fixture, 'header-user-role').nativeElement;
    expect(userrole.textContent).toContain(user.asemaStr);
  }));

  it('shows correct user name and role for teacher', fakeAsync(() => {
    component.courseid = '1';
    const user = authDummyData.userInfoTeacher
    store.setUserInfo(user);
    tick();
    fixture.detectChanges();
    tick();
    const username = findEl(fixture, 'header-username').nativeElement;
    expect(username.textContent).toContain(user.nimi);
    const userrole = findEl(fixture, 'header-user-role').nativeElement;
    expect(userrole.textContent).toContain(user.asemaStr);
  }));

  /* Shows profile option for logged in user and clicking it routes to correct
      view. */
  it('shows profile option when logged in and clicking it routes to correct view', fakeAsync(() => {
    component.courseid = '1';
    store.setUserInfo(authDummyData.userInfoEsko);
    fixture.detectChanges();
    findEl(fixture, 'account-button').nativeElement.click();
    tick(100);
    const profileBtn = findEl(fixture, 'profile-button').nativeElement;
    profileBtn.click();
    tick();
    expect(location.path()).toContain('profile');
    flush();
  }));

  /* Settings button in shown when user role is teacher and is participant in course */
  it('shows working settings button when user role is teacher and is participant in course', fakeAsync(() => {
    component.courseid = '1';
    let userInfo = authDummyData.userInfoTeacher;
    userInfo.osallistuja = true;
    store.setUserInfo(userInfo);
    fixture.detectChanges();
    tick();
    findEl(fixture, 'account-button').nativeElement.click();
    tick();
    const settingsBtn = findEl(fixture, 'settings-button').nativeElement;
    expect(settingsBtn).toBeDefined();
    settingsBtn.click();
    tick(100);
    expect(location.path()).toContain('settings');
    flush();
  }));

  it("doesn't show settings button when user role is teacher and not participant in course", fakeAsync(() => {
    component.courseid = '1';
    let userInfo = authDummyData.userInfoTeacher;
    userInfo.osallistuja = false;
    store.setUserInfo(userInfo);
    fixture.detectChanges();
    tick();
    findEl(fixture, 'account-button').nativeElement.click();
    tick();
    const settingsBtn = findElIfExists(fixture, 'settings-button');
    expect(settingsBtn).toBe(null);
    flush();
  }));

  it("doesn't show settings button when user role is student", fakeAsync(() => {
    component.courseid = '1';
    let userInfo = authDummyData.userInfoEsko;
    userInfo.osallistuja = true;
    store.setUserInfo(userInfo);
    fixture.detectChanges();
    tick();
    findEl(fixture, 'account-button').nativeElement.click();
    tick();
    const settingsBtn = findElIfExists(fixture, 'settings-button');
    expect(settingsBtn).toBe(null);
    flush();
  }));

});
