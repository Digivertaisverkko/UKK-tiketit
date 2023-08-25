import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { BeginningButtonComponent } from '@shared/components/beginning-button/beginning-button.component';
import { TicketViewComponent } from './ticket-view.component';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { TicketService, Tiketti } from '@ticket/ticket.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { StoreService } from '@core/services/store.service';
import { authDummyData } from '@core/services/auth.dummydata';
import { User } from '@core/core.models';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { EditorComponent } from '@shared/editor/editor.component';

import { SharedModule } from '@shared/shared.module';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';


describe('TicketViewComponent', () => {
  let component: TicketViewComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketViewComponent>;
  let loader: HarnessLoader;
  let store: StoreService
  const ticket: Tiketti = ticketDummyData.ticket;
  const user: User = authDummyData.userInfoTeacher;

  beforeEach(async() => {

    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getTicket: Promise.resolve(ticket),
    });
    const id = '4';

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(BeginningButtonComponent),
        MockComponent(HeadlineComponent),
        EditorComponent,
        TicketViewComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => id }
            }
          }
        },
        StoreService,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketViewComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    store = TestBed.inject(StoreService);

    fixture.detectChanges();
    store.setUserInfo(user);
    store.setLoggedIn();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fetches proper ticket data from service.', fakeAsync(() => {
    component.courseid = '1';
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    // Ei subscribaa timeriin, joten kutsutaan manuaalisesti.
    component.fetchTicket(component.courseid);
    tick();
    expect(fakeTicketService.getTicket).toHaveBeenCalledTimes(1);
    expect(component.ticket).toEqual(ticket);
    discardPeriodicTasks();  // Varalta jos tiketin pollaus käynnistyy.
  }));

  it('sets correctly if ticket is editable and removable.', fakeAsync(() => {
    component.courseid = '1';
    component.ngOnInit();
    fixture.detectChanges();
    // Ei subscribaa timeriin, joten kutsutaan manuaalisesti.
    component.fetchTicket(component.courseid);
    tick();
    if (ticket.aloittaja.id === user.id) {
      expect(component.isEditable).toEqual(true);
      if (ticket.kommentit.length === 0) {
        expect(component.isRemovable).toEqual(true);
      } else {
        expect(component.isRemovable).toEqual(false);
      }
    } else {
      expect(component.isEditable).toEqual(false);
      expect(component.isRemovable).toEqual(false);
    }
    discardPeriodicTasks();  // Varalta jos tiketin pollaus käynnistyy.
  }));

});
