import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPrivilegesComponent } from './no-privileges.component';

describe('NoPrivilegesComponent', () => {
  let component: NoPrivilegesComponent;
  let fixture: ComponentFixture<NoPrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoPrivilegesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoPrivilegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
