import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { NoPrivilegesComponent } from './no-privileges.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';

describe('NoPrivilegesComponent', () => {
  let component: NoPrivilegesComponent;
  let fixture: ComponentFixture<NoPrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(HeadlineComponent),
        NoPrivilegesComponent
      ]
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
