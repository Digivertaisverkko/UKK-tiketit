import { ComponentFixture, ComponentFixtureAutoDetect, TestBed
    } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MockComponent } from 'ng-mocks';

import { NoDataConsentComponent } from './no-data-consent.component';
import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('NoDataConsentComponent', () => {
  let component: NoDataConsentComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<NoDataConsentComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      removeDenyConsent: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      getBaseTitle: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(HeadlineComponent),
        NoDataConsentComponent
      ],
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AuthService, useValue: fakeAuthService },
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDataConsentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
