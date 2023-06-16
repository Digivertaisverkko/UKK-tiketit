import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessComponent } from './success.component';
import { MatIconModule } from '@angular/material/icon';

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessComponent ],
      imports: [
        MatIconModule
      ]
    });
    fixture = TestBed.createComponent(SuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
