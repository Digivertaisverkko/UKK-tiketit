import { ComponentFixture, ComponentFixtureAutoDetect, TestBed
    } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent } from 'ng-mocks';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { LoginComponent } from '@user/login/login.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      login: undefined,
      navigateToLogin: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      getBaseTitle: undefined,
      setNotLoggedIn: undefined,
      setParticipant: undefined,
      setUserInfo: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        LoginComponent,
        MockComponent(HeadlineComponent)
      ],
      imports: [
        BrowserAnimationsModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AuthService, useValue: fakeAuthService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
