import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAttachmentsComponent } from './edit-attachments.component';

describe('EditAttachmentsComponent', () => {
  let component: EditAttachmentsComponent;
  let fixture: ComponentFixture<EditAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAttachmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
