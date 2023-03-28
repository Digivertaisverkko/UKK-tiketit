import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataConsentComponent } from './data-consent.component';

describe('DataConsentComponent', () => {
  let component: DataConsentComponent;
  let fixture: ComponentFixture<DataConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataConsentComponent ]
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
