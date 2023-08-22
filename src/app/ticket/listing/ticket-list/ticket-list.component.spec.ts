import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
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
import { TestScheduler } from 'rxjs/testing';

import { MatTableHarness } from '@angular/material/table/testing';

import { initializeLanguageFI } from 'src/app/app.initializers';
import { TicketListComponent } from './ticket-list.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { TicketService } from '@ticket/ticket.service';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { DebugElement } from '@angular/core';
import { authDummyData } from '@core/services/auth.dummydata';

describe('TicketListComponent', () => {
  let component: TicketListComponent;

  let loader: HarnessLoader;
  let ticketService: Partial<TicketService>;
  // let fakeTicketService: jasmi ne.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketListComponent>;
  let getTicketListSpy: jasmine.Spy;

  // Alla oleva ei toiminut, jos siirsi beforeEach.
  ticketService = jasmine.createSpyObj('TicketService', ['getTicketList']);
  getTicketListSpy = ticketService.getTicketList as jasmine.Spy;
  getTicketListSpy.and.returnValue(
    Promise.resolve(ticketDummyData.ticketListClientData)
  )

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
        { provide: TicketService, useValue: ticketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;

    // Tällä tulee error: No provider for TicketListComponent!
    // component = TestBed.inject(TicketListComponent);

    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters rows by sender name', fakeAsync (async() => {
    initializeLanguageFI(); // datePipeen
    tick();
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    component.applyFilter('esko');
    tick();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBe(1);
    discardPeriodicTasks();
  }));

  it('filters rows by additional field content', fakeAsync (async() => {
    initializeLanguageFI(); // datePipeen
    tick();
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    component.applyFilter('Kurssin suoritus');
    tick();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBe(1);
    discardPeriodicTasks();
  }));

  it('renders table rows', fakeAsync (async() => {
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBeGreaterThan(0);
    discardPeriodicTasks();
  }));

  describe('fetches data for Mat table dataSource correctly.', () => {
    const courseID = '1';

    it('fetches correct ticket data for dataSource.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      expect(component.dataSource.filteredData.length).toBeGreaterThan(0);
      expect(component.dataSource.filteredData).toEqual(ticketDummyData.ticketListClientData);
      expect(component.dataSource.data).toEqual(ticketDummyData.ticketListClientData);
    }));

    it('fetches ticket data for sorting correctly.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      console.dir(component.sortQuestions);
      expect(component.dataSource.sort).toBeDefined();

    }));

    it('sets default sorting to "Edited/Muokattu" column starting from ascending order.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn).toBeDefined();
      expect(sortFn?.active).toBe('viimeisin');
      expect(sortFn?.start).toBe('asc');
      const columnCount = 4;
      expect(sortFn?.sortables.size).toBe(columnCount);
    }));

    it('sets at least four sorting columns.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn?.sortables.size).toBeGreaterThanOrEqual(4);
    }));

    it('sets filtering function.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      const dataSource = component.dataSource;
      expect(dataSource.filterPredicate).toBeDefined();
    }));

    // Ei toimi.
    /*
    it('fetches tickets 3 times in 2 minutes', fakeAsync(() => {

      const pollingRateMin = 1;
      const pollingRateSec = pollingRateMin * 60;

      fixture.detectChanges();
      //component.ngOnInit();

      expect(getTicketListSpy).toHaveBeenCalledTimes(1);

      tick(pollingRateSec * 1000);

      expect(getTicketListSpy).toHaveBeenCalledTimes(2);

      tick(pollingRateSec * 1000);

      expect(getTicketListSpy).toHaveBeenCalledTimes(3);
    }));
    */

    /* Ei toimi.
    it('sets 5 sortable columns when there is one with attachment', fakeAsync (() => {
      let dummyData = ticketDummyData.ticketListClientData;
      dummyData[1].liite = true;
      getTicketListSpy = ticketService.getTicketList as jasmine.Spy;
      getTicketListSpy.and.returnValue(
        Promise.resolve(dummyData)
      );

      component.fetchTickets(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn?.sortables.size).toBeGreaterThanOrEqual(5);

      console.warn('spec');
      console.log(component.dataSource.sort?.sortables);
    }));
    */

  });

});
