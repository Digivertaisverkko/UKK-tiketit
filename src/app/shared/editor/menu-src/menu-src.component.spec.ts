import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuSrcComponent } from './menu-src.component';

describe('MenuSrcComponent', () => {
  let component: MenuSrcComponent;
  let fixture: ComponentFixture<MenuSrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuSrcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
