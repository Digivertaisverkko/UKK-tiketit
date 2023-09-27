import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockComponent } from 'ng-mocks';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { AppComponent } from './app.component';
import { FooterComponent } from '@core/footer/footer.component';
import { AuthService } from '@core/services/auth.service';
import { initializeLanguage } from './app.initializers';
import { StoreService } from '@core/services/store.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes } from '@angular/router';
import { ProfileComponent } from '@user/profile/profile.component';
import { SettingsComponent } from '@course/settings/settings.component';

describe('AppComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: AppComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<AppComponent>;
  let location: Location;
  let store: StoreService;

  const routes: Routes = [
    { path: 'course/:courseid/profile', component: MockComponent(ProfileComponent)},
    { path: 'course/:courseid/settings', component: MockComponent(SettingsComponent)}
  ];

  function findElIfExists(fixture: ComponentFixture<any>, selector: string):
      HTMLElement | null {
    try {
      return findEl(fixture, selector).nativeElement;
    } catch {
      return null;
    }
  }

  describe('Header in embedded view', () => {

    beforeEach(async () => {
      fakeAuthService = jasmine.createSpyObj('CourseService', {
        initialize: undefined
      });

      await TestBed.configureTestingModule({
        declarations: [
          AppComponent,
          MockComponent(FooterComponent)],
        imports: [
          BrowserAnimationsModule,
          MatIconModule,
          MatMenuModule,
          MatToolbarModule,
          MatTooltipModule,
          RouterTestingModule.withRoutes(routes)
        ],
        providers: [
          { provide: AuthService, useValue: fakeAuthService },
          {
            provide: APP_INITIALIZER,
            useFactory: () => initializeLanguage,
            multi: true
          },
          { provide: LOCALE_ID, useValue: 'fi' },
          Location,
          StoreService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      location = TestBed.inject(Location);
      store = TestBed.inject(StoreService);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('shows correct user role for student', fakeAsync(() => {
      component.courseid = '1';
      const user = authDummyData.userInfoEsko;
      store.setUserInfo(user);
      store.setLoggedIn();
      fixture.detectChanges();
      tick();
      const userrole = findEl(fixture, 'header-user-role').nativeElement;
      expect(userrole.textContent).toContain(user.asemaStr);
    }));

    it('shows profile option when logged in and clicking it routes to correct view', fakeAsync(() => {
      component.courseid = '1';
      store.setUserInfo(authDummyData.userInfoEsko);
      store.setLoggedIn();
      fixture.detectChanges();
      findEl(fixture, 'account-button').nativeElement.click();
      tick(300);
      const profileBtn = findEl(fixture, 'profile-button').nativeElement;
      profileBtn.click();
      tick();
      expect(location.path()).toContain('profile');
      flush();
    }));

    it("doesn't show settings button when user role is teacher and not participant in course", fakeAsync(() => {
      component.courseid = '1';
      store.setLoggedIn();
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
      store.setLoggedIn();
      let userInfo = authDummyData.userInfoEsko;
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

    it('shows working settings button when user role is teacher and is participant in course', fakeAsync(() => {
      component.courseid = '1';
      store.setLoggedIn();
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

    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    /*
    it('logout is shown and calls right method', () => {
      expect(component).toBeTruthy();
    });
    */

  });


});
