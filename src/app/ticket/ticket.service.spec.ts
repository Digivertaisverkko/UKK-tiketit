import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { ticketDummyData } from './ticket.service.dummydata';
import { storeDummyData } from '@core/services/store.service.dummydata';
import { SortableTicket, TicketService, TikettiListassa } from './ticket.service';
import { StoreService } from '@core/services/store.service';
import { User } from '@core/core.models';

const courseID = '1';
const courseName = 'Testikurssi';
const api = environment.apiBaseUrl;
const user: User = storeDummyData.teacherUser;

fdescribe('TicketService', () => {
  let fakeStoreService: jasmine.SpyObj<StoreService>
  let tickets: TicketService;
  let controller: HttpTestingController;

  beforeEach(() => {

    fakeStoreService = jasmine.createSpyObj('StoreService', [ 'getUserInfo' ]);

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    tickets = TestBed.inject(TicketService);
    controller = TestBed.inject(HttpTestingController);
    fakeStoreService.getUserInfo.and.returnValue(user);
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


    tickets.getTicketList(courseID).then((response: SortableTicket[] | null) => {
      actualTicketListData = response;
      const request = controller.expectOne(url);
      request.flush(ticketDummyData.ticketListServerData);  
      expect(actualTicketListData).toEqual(ticketDummyData.ticketListClientData);
      done();
    }).catch(e => {
      done.fail(e);
    })
    
  })

});
