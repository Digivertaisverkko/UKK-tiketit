import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed
    } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { LoginComponent } from '@user/login/login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj(
      'AuthService',
      [
        'login',
        'navigateToLogin',
      ]
    );

    fakeStoreService = jasmine.createSpyObj(
      'StoreService',
      [
        'getBaseTitle',
        'setNotLoggedIn',
        'setParticipant',
        'setUserInfo'
      ]
    );

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AuthService, useValue: fakeAuthService },
        { provide: StoreService, useValue: fakeStoreService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
