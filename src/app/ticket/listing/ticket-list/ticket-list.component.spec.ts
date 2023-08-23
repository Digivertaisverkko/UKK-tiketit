import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick }
    from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockComponent } from 'ng-mocks';
import { RouterTestingModule } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { authDummyData } from '@core/services/auth.dummydata';
import { initializeLanguageFI } from 'src/app/app.initializers';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { TicketListComponent } from './ticket-list.component';
import { TicketService } from '@ticket/ticket.service';

describe('TicketListComponent', () => {
  let component: TicketListComponent;
  let fixture: ComponentFixture<TicketListComponent>;
  let loader: HarnessLoader;
  let ticketService: Partial<TicketService>;

  beforeEach(async () => {
    // Pitää olla ennen TestBed:n konfigurointia.
    ticketService = jasmine.createSpyObj('TicketService', {
      getTicketList: Promise.resolve(ticketDummyData.ticketListClientData)
    });

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
    const filterValue = 'esko';
    initializeLanguageFI(); // datePipeen
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    component.applyFilter(filterValue);
    tick();
    const filteredData = component.dataSource.filteredData;
    const containsString = filteredData.some(entry =>
      Object.values(entry).some(value => typeof value === 'string' &&
          value.toLowerCase().includes(filterValue.toLowerCase()))
    );
    expect(containsString).toBe(true);
    discardPeriodicTasks();
  }));

  it('filters rows by additional field content', fakeAsync (async() => {
    let filterValue = 'Kurssin suoritus';
    filterValue = filterValue.toLowerCase();
    initializeLanguageFI(); // datePipeen
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    component.applyFilter(filterValue);
    tick();
    const filteredData = component.dataSource.filteredData;
    const containsString = filteredData.some(entry =>
      entry.kentat.some(kentat =>
        kentat.arvo.toLowerCase().includes(filterValue) ||
        kentat.otsikko.toLowerCase().includes(filterValue)
      )
    );
    expect(containsString).toBe(true);
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

    it('fetches tickets 3 times in 2 minutes', fakeAsync(() => {
      const pollingRateMin = 1;
      const pollingRateSec = pollingRateMin * 60;
      component.ngOnInit();
      tick();
      expect(ticketService.getTicketList).toHaveBeenCalledTimes(1);

      tick(pollingRateSec * 1000);
      expect(ticketService.getTicketList).toHaveBeenCalledTimes(2);

      tick(pollingRateSec * 1000);
      expect(ticketService.getTicketList).toHaveBeenCalledTimes(3);
      discardPeriodicTasks();
    }));

    /*
    fit('sets 5 sortable columns when there is one with attachment', fakeAsync (() => {
      // Ei voi tehdä testBedin konffauksen jälkeen.
      let dummyData = ticketDummyData.ticketListClientData;
      dummyData[1].liite = true;
      component.fetchTickets(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn?.sortables.size).toBeGreaterThanOrEqual(5);

      discardPeriodicTasks();

    }));
    */

  });

});
