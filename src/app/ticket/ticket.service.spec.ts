import { APP_INITIALIZER } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { LOCALE_ID } from '@angular/core';
import { ticketDummyData } from './ticket.service.dummydata';
import { storeDummyData } from '@core/services/store.service.dummydata';
import { SortableTicket, TicketService, TikettiListassa } from './ticket.service';
import { StoreService } from '@core/services/store.service';
import { User } from '@core/core.models';
import { initializeLanguage } from '../app.initializers';

const courseID = '1';
const courseName = 'Testikurssi';
const api = environment.apiBaseUrl;
const user: User = storeDummyData.teacherUser;

fdescribe('TicketService', () => {
  // let fakeStoreService: jasmine.SpyObj<StoreService>
  let fakeStoreService: Pick<StoreService, keyof StoreService>;
  let tickets: TicketService;
  let controller: HttpTestingController;

  beforeEach(async () => {

    // fakeStoreService = jasmine.createSpyObj('StoreService', [ 'getUserInfo' ]);
    fakeStoreService = {
      getUserInfo(): User | null {
        return storeDummyData.teacherUser;
      }
    } as Pick<StoreService, keyof StoreService>;

    spyOn(fakeStoreService, 'getUserInfo').and.callThrough();

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: StoreService, useValue: fakeStoreService },
        { provide: APP_INITIALIZER, useFactory: () => initializeLanguage, multi: true },
        { provide: LOCALE_ID, useValue: 'fi' }
      ]
    });

    tickets = TestBed.inject(TicketService);
    controller = TestBed.inject(HttpTestingController);
    // fakeStoreService.getUserInfo.and.returnValue(user);
  });

  afterEach(() => {
    controller.verify(); // Verify that there are no outstanding requests
  });

  it('should be created', () => {
    expect(tickets).toBeTruthy();
  });

  it('gets the full ticket list', (done) => {
    const target = 'kaikki'
    const url = `${api}/kurssi/${courseID}/tiketti/${target}`;
    console.log('pitäisi olla tämä url: ' + url);
    let actualTicketListData: SortableTicket[] | null | undefined;
    
      tickets.getTicketList(courseID).then(res => {
        actualTicketListData = res;
        expect(actualTicketListData).toEqual(ticketDummyData.ticketListClientData);
        done();
      }).catch ( e => {
        console.log(e);
        done();

      })
    const request = controller.expectOne(url);
    request.flush(ticketDummyData.ticketListServerData);
  });

});
