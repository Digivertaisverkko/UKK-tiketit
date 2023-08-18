import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PrivacyModalComponent } from './privacy-modal.component';

describe('PrivacyModalComponent', () => {
  let component: PrivacyModalComponent;
  let fixture: ComponentFixture<PrivacyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivacyModalComponent ],
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue : {} },
        { provide: MAT_DIALOG_DATA, useValue : {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
