import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MockComponent } from 'ng-mocks';

import { CommentComponent } from './comment.component';
import { SenderInfoComponent } from '@shared/components/sender-info/sender-info.component';
import { TicketService } from '@ticket/ticket.service';
import { EditAttachmentsComponent } from '@ticket/components/edit-attachments/edit-attachments.component';
import { MessageComponent } from '@ticket/components/message/message.component';
import { AuthDummyData } from '@core/services/auth.dummydata';

describe('CommentComponent', () => {
  const authDymmyData = new AuthDummyData;
  let component: CommentComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      editComment: undefined,
      removeComment: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        CommentComponent,
        MockComponent(EditAttachmentsComponent),
        MockComponent(MessageComponent),
        MockComponent(SenderInfoComponent)
      ],
      imports: [
        MatCardModule,
        MatIconModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.courseid = '1';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
