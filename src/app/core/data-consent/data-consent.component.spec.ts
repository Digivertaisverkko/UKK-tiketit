import { ComponentFixture, ComponentFixtureAutoDetect, TestBed
    } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MockComponent } from 'ng-mocks';

import { DataConsentComponent } from './data-consent.component';
import { AuthService } from '@core/services/auth.service';
import { StoreService } from '@core/services/store.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('DataConsentComponent', () => {
  let component: DataConsentComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<DataConsentComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      sendDataConsent: undefined
    });

    fakeStoreService = jasmine.createSpyObj('StoreService', {
      getBaseTitle: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        DataConsentComponent,
        MockComponent(HeadlineComponent)
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

    fixture = TestBed.createComponent(DataConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
