import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { NgxEditorModule } from 'ngx-editor';

import { EditorComponent } from './editor.component';
import { MenuLinkComponent } from './menu-link/menu-link.component';
import { MenuSrcComponent } from './menu-src/menu-src.component';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EditorComponent,
        MockComponent(MenuLinkComponent),
        MockComponent(MenuSrcComponent)
      ],
      imports: [
        NgxEditorModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
