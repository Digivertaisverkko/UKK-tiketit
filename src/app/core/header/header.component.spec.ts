import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from "@angular/router/testing";

import { AuthDummyData } from '@core/services/auth.dummydata';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from './header.component';
import { StoreService } from '@core/services/store.service';

describe('HeaderComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: HeaderComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: StoreService;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* For logged in user 'Logout' is shown and clicking it calls right method. */

  it('shows logout option when logged in and makes correct method call', fakeAsync(() => {
    store.setNotLoggegIn();
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
    store.setLoggedIn();
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
});
