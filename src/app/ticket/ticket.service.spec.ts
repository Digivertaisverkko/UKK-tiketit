import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { initializeLanguageFI } from '../app.initializers';
import { SortableTicket, TicketService } from './ticket.service';
import { storeDummyData } from '@core/services/store.service.dummydata';
import { StoreService } from '@core/services/store.service';
import { ticketDummyData } from './ticket.service.dummydata';
import { User } from '@core/core.models';

const courseID = '1';
const courseName = 'Testikurssi';
const api = environment.apiBaseUrl;

fdescribe('TicketService', () => {
  // let fakeStoreService: Pick<StoreService, keyof StoreService>;
  // let fakeStoreService: jasmine.SpyObj<StoreService>
  let tickets: TicketService;
  let controller: HttpTestingController;
  let store: StoreService;

  beforeEach(async () => {

    /*
    // fakeStoreService = jasmine.createSpyObj('StoreService', [ 'getUserInfo' ]);
      fakeStoreService = {
        getUserInfo(): User | null {
          return storeDummyData.teacherUser;
        }
      } as Pick<StoreService, keyof StoreService>;
    */
    // spyOn(fakeStoreService, 'getUserInfo').and.callThrough();

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: StoreService, useClass: StoreService },
        { provide: APP_INITIALIZER, useFactory: () => initializeLanguageFI, multi: true },
        { provide: LOCALE_ID, useValue: 'fi' }
      ]
    });

    // { provide: StoreService, useValue: fakeStoreService },
    tickets = TestBed.inject(TicketService);
    controller = TestBed.inject(HttpTestingController);
    store = TestBed.inject(StoreService);

  });

  afterEach(() => {
    controller.verify(); // Verify that there are no outstanding requests
  });

  it('should be created', () => {
    expect(tickets).toBeTruthy();
  });

  it('retrieves the full ticket list', (done) => {
    const target = 'kaikki'
    const url = `${api}/kurssi/${courseID}/tiketti/${target}`;
    let actualTicketListData: SortableTicket[] | null | undefined;
    store.setUserInfo(storeDummyData.teacherUser);

    tickets.getTicketList(courseID).then(res => {
      actualTicketListData = res;
      expect(actualTicketListData).toEqual(ticketDummyData.ticketListClientData);
      done();
    }).catch (e => {
      console.log(e);
      done();
    })
    const request = controller.expectOne(url);
    request.flush(ticketDummyData.ticketListServerData);
  });

});
