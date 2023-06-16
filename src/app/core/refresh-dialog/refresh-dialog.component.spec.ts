import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { RefreshDialogComponent } from './refresh-dialog.component';
import { AuthService } from '@core/services/auth.service';

describe('RefreshDialogComponent', () => {
  let component: RefreshDialogComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<RefreshDialogComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      removeDenyConsent: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [ RefreshDialogComponent ],
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefreshDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
