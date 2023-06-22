import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsermenuComponent } from './usermenu.component';
import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';

describe('UsermenuComponent', () => {
  let component: UsermenuComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<UsermenuComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      logout: undefined,
      navigateToLogin: undefined,
      saveRedirectURL: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      trackIfParticipant: undefined,
      trackLoggedIn: undefined,
      trackUserInfo: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [ UsermenuComponent ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsermenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
