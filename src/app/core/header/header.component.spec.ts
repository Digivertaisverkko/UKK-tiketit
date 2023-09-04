import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from "@angular/router/testing";
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from './header.component';
import { StoreService } from '@core/services/store.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {

    fakeAuthService = jasmine.createSpyObj('AuthService', {
      login: undefined,
      navigateToLogin: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      sendMessage: undefined,
      trackIfParticipant: undefined,
      trackLoggedIn: undefined,
      trackUserInfo: of('')
    });

    await TestBed.configureTestingModule({
      declarations: [
        HeaderComponent
      ],
      imports: [
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
