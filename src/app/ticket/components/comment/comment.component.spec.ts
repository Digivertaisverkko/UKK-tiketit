import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { findEl, setFieldValue } from '@shared/spec-helpers/element.spec-helper';
import { LOCALE_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MockComponent } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { CommentComponent } from './comment.component';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';
import { EditorComponent } from '@shared/editor/editor.component';
import { MessageComponent } from '@ticket/components/message/message.component';
import { SenderInfoComponent } from '@shared/components/sender-info/sender-info.component';
import { StoreService } from '@core/services/store.service';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { TicketModule } from '@ticket/ticket.module';
import { TicketService } from '@ticket/ticket.service';
import { ViewAttachmentsComponent } from '../view-attachments/view-attachments.component';

describe('CommentComponent', () => {
  const authDymmyData = new AuthDummyData;
  let component: CommentComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<CommentComponent>;
  let store: StoreService
  const ticketDummyData = new TicketDummyData;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      editComment: Promise.resolve({ success: true }),
      removeComment: Promise.resolve({success: true})
    });

    await TestBed.configureTestingModule({
      declarations: [
        CommentComponent,
        EditorComponent,
        MessageComponent,
        MockComponent(EditAttachmentsComponent),
        MockComponent(SenderInfoComponent),
        MockComponent(ViewAttachmentsComponent)
      ],
      imports: [
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule,
        TicketModule,
      ],
      providers: [
        { provide: StoreService },
        { provide: TicketService, useValue: fakeTicketService },
        { provide: LOCALE_ID, useValue: 'fi-FI' },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    store = TestBed.inject(StoreService);
    component = fixture.componentInstance;
    component.comment = ticketDummyData.kommentti;
    component.courseid = '1';
    component.isInCopyAsFAQ = false;
    component.ticketID = '3';
    let userInfo = authDymmyData.userInfoTeacher
    userInfo.osallistuja = true;
    component.user = authDymmyData.userInfoTeacher;
    // Kommentin lähettäjä.
    store.setUserInfo(authDymmyData.userInfoTeacher);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls correct method after clicking edit and remove-icon', fakeAsync(() => {
    findEl(fixture, 'edit-button').nativeElement.click();
    fixture.detectChanges();
    findEl(fixture, 'remove-button').nativeElement.click();
    tick(600);
    fixture.detectChanges();
    findEl(fixture, 'confirm-button').nativeElement.click();
    tick();
    expect(fakeTicketService.removeComment).toHaveBeenCalledWith(component.ticketID,
      component.comment.id, component.courseid);
  }));

  it('calls correct method after editing comment and clicking OK', fakeAsync(() => {
    const newMessage = "Testikommentti";
    const expectedMessage = "<p>" + newMessage + "</p>";
    findEl(fixture, 'edit-button').nativeElement.click();
    fixture.detectChanges();
    setFieldValue(fixture, 'editor', newMessage);
    findEl(fixture, 'ok-button').nativeElement.click();
    expect(fakeTicketService.editComment).toHaveBeenCalledWith(
      component.ticketID,
      component.comment.id,
      expectedMessage,
      4,
      component.courseid
    );
  }));

  it('shows correct comment text content', () => {
    const expectedMessage = "Testikommentti";
    const message = findEl(fixture, 'message').nativeElement;
    const messageText = message.textContent.trim();
    expect(messageText).toContain(expectedMessage);
    expect(component).toBeTruthy();
  });
});
