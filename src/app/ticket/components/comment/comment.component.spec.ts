import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MockComponent } from 'ng-mocks';

import { CommentComponent } from './comment.component';
import { SenderInfoComponent } from '@shared/components/sender-info/sender-info.component';
import { TicketService } from '@ticket/ticket.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';
import { MessageComponent } from '@ticket/components/message/message.component';
import { AuthDummyData } from '@core/services/auth.dummydata';
import { StoreService } from '@core/services/store.service';
import { LOCALE_ID } from '@angular/core';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { ViewAttachmentsComponent } from '../view-attachments/view-attachments.component';
import { EditorComponent } from '@shared/editor/editor.component';
import { TicketModule } from '@ticket/ticket.module';

describe('CommentComponent', () => {
  const authDymmyData = new AuthDummyData;
  let component: CommentComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<CommentComponent>;
  let store: StoreService
  const ticketDummyData = new TicketDummyData;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      editComment: undefined,
      removeComment: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        CommentComponent,
        MessageComponent,
        EditorComponent,
        MockComponent(EditAttachmentsComponent),
        MockComponent(SenderInfoComponent),
        MockComponent(ViewAttachmentsComponent)
      ],
      imports: [
        MatCardModule,
        MatIconModule,
        TicketModule,
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService },
        { provide: LOCALE_ID, useValue: 'fi-FI' },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    store = TestBed.inject(StoreService);
    component = fixture.componentInstance;
    component.courseid = '1';
    component.user = authDymmyData.userInfoTeacher;
    component.comment = ticketDummyData.kommentti;
    component.ticketID = '3';
    component.isInCopyAsFAQ = false;
    store.setUserInfo(authDymmyData.userInfoTeacher);
    store.setLoggedIn();
    store.setParticipant(true);
    // Eri kuin kommentin ID eli kommentti ei ole ediointitilassa.
    component.editingCommentID = '5';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows correct comment text content', () => {
    const expectedMessage = "Testikommentti";
    const message = findEl(fixture, 'message').nativeElement;
    const messageText = message.textContent.trim();
    expect(messageText).toContain(expectedMessage);
    expect(component).toBeTruthy();
  });
});
