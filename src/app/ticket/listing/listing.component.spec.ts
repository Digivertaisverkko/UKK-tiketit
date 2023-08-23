import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent } from 'ng-mocks';

import { ListingComponent } from './listing.component';
import { AuthService } from '@core/services/auth.service';
import { HeadlineComponent } from '@shared/components/headline/headline.component';
import { ticketDummyData } from '@ticket/ticket.dummydata';
import { TicketService } from '@ticket/ticket.service';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fakeTicketService: Partial<TicketService>;
  let fixture: ComponentFixture<ListingComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('AuthService', {
      getDenyDataConsent: undefined,
      navigateToLogin: undefined
    });

    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getFAQlist: Promise.resolve(ticketDummyData.FAQsInlist)
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
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetches data for Mat table dataSource correctly.', () => {
    const courseID = '1';

    it('fetches correct FAQ data for dataSource.', fakeAsync (() => {
      component.fetchFAQ(courseID);
      tick();
      expect(component.dataSource.filteredData.length).toBeGreaterThan(0);
      const dataSourceData = JSON.stringify(component.dataSource.data);
      const FAQsDummyData = JSON.stringify(ticketDummyData.FAQsInlist);
      expect(dataSourceData).toEqual(FAQsDummyData);

    }));

  })

});
