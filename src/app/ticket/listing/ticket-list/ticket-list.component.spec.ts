import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick }
    from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { HarnessLoader } from '@angular/cdk/testing';
import localeFi from '@angular/common/locales/fi';
import { LOCALE_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockComponent } from 'ng-mocks';
import { registerLocaleData } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { AuthDummyData } from '@core/services/auth.dummydata';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { TicketDummyData } from '@ticket/ticket.dummydata';
import { TicketListComponent } from './ticket-list.component';
import { TicketService } from '@ticket/ticket.service';

describe('TicketListComponent', () => {
  const authDummyData = new AuthDummyData;
  let component: TicketListComponent;
  let fixture: ComponentFixture<TicketListComponent>;
  let loader: HarnessLoader;
  let router: Router;
  let ticketService: Pick<TicketService, 'getTicketList'>;
  const ticketDummyData = new TicketDummyData;

  registerLocaleData(localeFi);

  beforeEach(async () => {
    // Pitää olla ennen TestBed:n konfigurointia.
    ticketService = jasmine.createSpyObj('TicketService', {
      getTicketList: Promise.resolve(ticketDummyData.sortableTicketArray)
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
        { provide: LOCALE_ID, useValue: 'fi-FI' },
        { provide: TicketService, useValue: ticketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
    // Tällä tulee error: No provider for TicketListComponent!
    // component = TestBed.inject(TicketListComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it("clicking ticket's title routes to ticket's view", fakeAsync(() => {
    const courseID = '1';
    component.courseid = courseID;
    component.user = authDummyData.userInfoTeacher;
    const ticketList =  ticketDummyData.sortableTicketArray;
    const ticketID = ticketList[0].id;
    const navigateSpy = spyOn(router, 'navigateByUrl');
    const expectedRoute = `/course/${courseID}/ticket-view/${ticketID}`;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const titleAnchor = findEl(fixture, `table-title-a-${ticketID}`).nativeElement;
    titleAnchor.click();
    tick();
    const [actualRoute, navigationOptions] = navigateSpy.calls.mostRecent().args;
    expect(String(actualRoute)).toBe(expectedRoute);
    discardPeriodicTasks();
  }));

  it('filters rows by sender name', fakeAsync (async() => {
    const filterValue = 'esko';
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    component.applyFilter(filterValue);     // Saadaan search komponentista.
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows table rows', fakeAsync (async() => {
    component.courseid = '1';
    component.user = authDummyData.userInfoTeacher;
    component.ngOnInit();
    tick();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBeGreaterThan(0);
    discardPeriodicTasks();
  }));

  describe('fetches data for ticket list correctly.', () => {
    const courseID = '1';

    it('sets correct ticket data.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      expect(component.dataSource.filteredData.length).toBeGreaterThan(0);
      expect(component.dataSource.filteredData).toEqual(ticketDummyData.sortableTicketArray);
      expect(component.dataSource.data).toEqual(ticketDummyData.sortableTicketArray);
    }));

    it('fetches ticket data for sorting correctly.', fakeAsync (() => {
      component.fetchTickets(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn).toBeDefined();
      expect(sortFn?.sortables.size).toBeGreaterThanOrEqual(4);
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
    it('sets 5 sortable columns when there is one with attachment', fakeAsync (() => {
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
