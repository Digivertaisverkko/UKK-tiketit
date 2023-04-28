import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorLegacyComponent } from './editor-legacy.component';

describe('EditorLegacyComponent', () => {
  let component: EditorLegacyComponent;
  let fixture: ComponentFixture<EditorLegacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorLegacyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorLegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
