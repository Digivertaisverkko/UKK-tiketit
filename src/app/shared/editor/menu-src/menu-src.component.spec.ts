import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Editor } from 'ngx-editor';

import { MenuSrcComponent } from './menu-src.component';

describe('MenuSrcComponent', () => {
  let component: MenuSrcComponent;
  let fixture: ComponentFixture<MenuSrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuSrcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuSrcComponent);
    component = fixture.componentInstance;
    component.editor = new Editor();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
