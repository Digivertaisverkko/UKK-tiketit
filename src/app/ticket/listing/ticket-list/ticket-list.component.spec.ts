import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { TicketListComponent } from './ticket-list.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { SortableTicket, TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';

describe('TicketListComponent', () => {
  let component: TicketListComponent;
  let fakeTicketService: Partial<TicketService>;
  // let fakeTicketService: jasmi ne.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketListComponent>;
  let getTicketListSpy: jasmine.Spy;

  beforeEach(async () => {
    /*
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getTicketList: undefined
    }); */

    /*
    fakeTicketService = {
      async getTicketList(courseID: string, option?: {
        option: 'onlyOwn' | 'archived'
      }): Promise<SortableTicket[] | null> {
        return ticketDummyData.ticketListClientData;
      }
    } as Partial<TicketService>;
    */

    fakeTicketService = {
      getTicketList: getTicketListSpy
    };

    // spyOn(fakeTicketService, 'getTicketList').and.callThrough();

    getTicketListSpy = jasmine.createSpy().and.returnValue(
      Promise.resolve(ticketDummyData.ticketListClientData)
    );

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(SearchBarComponent),
        TicketListComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        RouterTestingModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it('shows ticklet list', () => {
    expect(getTicketListSpy).toHaveBeenCalled();
    // expect(fakeTicketService.getTicketList).toHaveBeenCalled();
  })
  */

});
