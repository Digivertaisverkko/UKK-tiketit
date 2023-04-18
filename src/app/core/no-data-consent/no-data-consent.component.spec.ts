import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataConsentComponent } from './no-data-consent.component';

describe('NoDataConsentComponent', () => {
  let component: NoDataConsentComponent;
  let fixture: ComponentFixture<NoDataConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoDataConsentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDataConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
