import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockPipe } from 'ng-mocks';

import { MessageComponent } from './message.component';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MessageComponent,
        MockPipe(SafeHtmlPipe, (...args) => args[0])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
