import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MockComponent } from 'ng-mocks';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '@core/services/auth.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { ListingComponent } from './listing.component';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { TicketService } from '@ticket/ticket.service';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeTicketService: Pick<TicketService, 'getFAQlist'>;
  let fixture: ComponentFixture<ListingComponent>;
  let router: Router;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      getDenyDataConsent: undefined,
      navigateToLogin: undefined
    });

    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getFAQlist: Promise.resolve(ticketDummyData.UKKarray)
    });

    // Rivi 133: checkSuccessMessage()
    window.history.pushState({ message: ''}, '', '');

    await TestBed.configureTestingModule({
      declarations: [
        ListingComponent,
        MockComponent(HeadlineComponent)
      ],
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        MatSortModule,
        MatTableModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("clicking FAQ's title routes to it's view", fakeAsync(() => {
    const courseID = '1';
    component.courseid = courseID;
    const faqList =  ticketDummyData.UKKarray;
    const faqID = faqList[0].id;
    const navigateSpy = spyOn(router, 'navigateByUrl');
    const expectedRoute = `/course/${courseID}/faq-view/${faqID}`;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    const titleAnchor = findEl(fixture, `faq-title-a-${faqID}`).nativeElement;
    titleAnchor.click();
    tick();
    const [actualRoute, navigationOptions] = navigateSpy.calls.mostRecent().args;
    expect(String(actualRoute)).toBe(expectedRoute);
    discardPeriodicTasks();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetches data for FAQ-table correctly.', () => {
    const courseID = '1';

    it('fetches correct FAQ data.', fakeAsync (() => {
      component.fetchFAQ(courseID);
      tick();
      expect(component.dataSource.filteredData.length).toBeGreaterThan(0);
      const dataSourceData = JSON.stringify(component.dataSource.data);
      const FAQsDummyData = JSON.stringify(ticketDummyData.UKKarray);
      expect(dataSourceData).toEqual(FAQsDummyData);
    }));

    it('fetches ticket data for sorting correctly.', fakeAsync (() => {
      component.fetchFAQ(courseID);
      tick();
      expect(component.dataSource.sort).toBeDefined();
    }));

    it('sets default sorting to "Date/Päivämäärä" column starting from ascending order.', fakeAsync (() => {
      component.fetchFAQ(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn).toBeDefined();
      expect(sortFn?.active).toBe('aikaleima');
      expect(sortFn?.start).toBe('asc');
      const columnCount = 2;
      expect(sortFn?.sortables.size).toBe(columnCount);
    }));

    it('sets two sorting columns.', fakeAsync (() => {
      component.fetchFAQ(courseID);
      tick();
      const sortFn = component.dataSource.sort;
      expect(sortFn?.sortables.size).toBe(2);
    }));

    it('sets filtering function.', fakeAsync (() => {
      component.fetchFAQ(courseID);
      tick();
      const dataSource = component.dataSource;
      expect(dataSource.filterPredicate).toBeDefined();
    }));

    it('fetches tickets 3 times in 10 minutes.', fakeAsync(() => {
      const pollingRateMin = 5;
      const pollingRateSec = pollingRateMin * 60;
      component.ngOnInit();
      tick();
      expect(fakeTicketService.getFAQlist).toHaveBeenCalledTimes(1);

      tick(pollingRateSec * 1000);
      expect(fakeTicketService.getFAQlist).toHaveBeenCalledTimes(2);

      tick(pollingRateSec * 1000);
      expect(fakeTicketService.getFAQlist).toHaveBeenCalledTimes(3);
      discardPeriodicTasks();
    }));

  })

});
