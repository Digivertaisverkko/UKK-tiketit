import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { MatTableHarness } from '@angular/material/table/testing';

import { TicketListComponent } from './ticket-list.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { SortableTicket, TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { DebugElement } from '@angular/core';

describe('TicketListComponent', () => {
  let component: TicketListComponent;
  let fakeTicketService: Partial<TicketService>;
  // let fakeTicketService: jasmi ne.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketListComponent>;
  let getTicketListSpy: jasmine.Spy;
  let loader: HarnessLoader;

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

    fakeTicketService = {
      getTicketList: getTicketListSpy
    }; */

    fakeTicketService = jasmine.createSpyObj('TicketService', ['getTicketList']);

    getTicketListSpy = fakeTicketService.getTicketList as jasmine.Spy;
    getTicketListSpy.and.returnValue(
      Promise.resolve(ticketDummyData.ticketListClientData)
    );

    // spyOn(fakeTicketService, 'getTicketList').and.callThrough();

    /*
    getTicketListSpy = jasmine.createSpy().and.returnValue(
      Promise.resolve(ticketDummyData.ticketListClientData)
    ); */

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
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('ticket list table is created', fakeAsync (() => {
    const courseID = '1';
    component.fetchTickets(courseID);

    tick();

    const tableDebugElement: DebugElement = fixture.debugElement.query(By.css('.theme-table')); // Update the selector
    expect(tableDebugElement).toBeTruthy(); // Check if the table exists

    /*
    const rowsDebugElements: DebugElement[] = tableDebugElement.queryAll(By.css('.mat-row'));
    expect(rowsDebugElements.length).toBeGreaterThan(0); // Check if there are rows
    */
  }))

});
