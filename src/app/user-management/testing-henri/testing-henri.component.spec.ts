import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingHenriComponent } from './testing-henri.component';

describe('TestingHenriComponent', () => {
  let component: TestingHenriComponent;
  let fixture: ComponentFixture<TestingHenriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingHenriComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingHenriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
