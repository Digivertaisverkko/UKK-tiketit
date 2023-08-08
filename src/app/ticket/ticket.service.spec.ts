import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { initializeLanguageFI } from '../app.initializers';
import { SortableTicket, TicketService } from './ticket.service';
import { storeDummyData } from '@core/services/store.service.dummydata';
import { StoreService } from '@core/services/store.service';
import { ticketDummyData } from './ticket.dummydata';
import { ErrorService } from '@core/services/error.service';

environment.testing = true;
const api = environment.apiBaseUrl;

describe('TicketService', () => {
  let controller: HttpTestingController;
  let errors: ErrorService;
  let store: StoreService;
  let tickets: TicketService;

  beforeEach(async () => {

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: APP_INITIALIZER, useFactory: () => initializeLanguageFI, multi: true },
        { provide: LOCALE_ID, useValue: 'fi' },
        StoreService
      ]
    });

    errors = TestBed.inject(ErrorService)
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
    let actualTicketListData: SortableTicket[] | null | undefined;
    store.setUserInfo(storeDummyData.teacherUser);
    const courseID = '1';

    tickets.getTicketList(courseID).then(res => {
      actualTicketListData = res;
      expect(actualTicketListData).toEqual(ticketDummyData.ticketListClientData);
      done();
    }).catch (e => {
      console.log(e);
      done();
    })
    const target = 'kaikki'
    const url = `${api}/kurssi/${courseID}/tiketti/${target}`;
    const request = controller.expectOne(url);
    request.flush(ticketDummyData.ticketListServerData);
  });

  it('retrieves ticket with all properties', fakeAsync(() => {
    store.setUserInfo(storeDummyData.teacherUser);
    const courseID = '1';
    const ticketID = '3';

    tickets.getTicket(ticketID, courseID).then(res => {
      const ticketProperties = ticketDummyData.ticketProperties;
      const resProperties = Object.keys(res);
      expect(resProperties).toEqual(ticketProperties);
      // done();
    }).catch (e => {
      console.log(e);
      // done();
    })

    const ticketUrl = `${api}/kurssi/${courseID}/tiketti/${ticketID}`;
    const ticketRequest = controller.expectOne(ticketUrl);
    ticketRequest.flush(ticketDummyData.ticket3);
    // Advance the asynchronous execution of the test to resolve promises.
    tick();

    const fieldsUrl = `${api}/kurssi/${courseID}/tiketti/${ticketID}/kentat`;
    console.log(' URLI 2: ' + fieldsUrl);
    const fieldsRequest = controller.expectOne(fieldsUrl);
    fieldsRequest.flush(ticketDummyData.ticket3fields);
    tick();

    const commentsUrl = `${api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti`
      + `/kaikki`;
    const commentsRequest = controller.expectOne(commentsUrl);
    commentsRequest.flush(ticketDummyData.ticket3comments);
    tick();
  }));

  it('handles an error when getting ticket list', (done) => {
    store.setUserInfo(storeDummyData.teacherUser);
    const courseID = '1';
    tickets.getTicketList(courseID).then(res => {
      fail('ei napattu virhettä.');
    }).catch (err => {
      expect(err).toBeDefined();
      done();
    })
  
  const target = 'kaikki'
  const url = `${api}/kurssi/${courseID}/tiketti/${target}`;
  const req = controller.expectOne(url);
  const status = 400;
  const errorid = 1000;
  const error = errors.createError(status, errorid);
  req.flush(error, { status: status, statusText: 'Forbidden'});
  });
  

  it('gets a file', fakeAsync (() => {
    const ticketID = '123';
    const commentID = '456';
    const fileID = '789';
    const courseID = '1';
    
    const mockBlob = new Blob(['mock file content'], { type: 'application/octet-stream' });

    tickets.getFile(ticketID, commentID, fileID, courseID).then((response: Blob) => {
      expect(response).toEqual(mockBlob);
    });

    const expectedUrl = `${api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/${commentID}/liite/${fileID}/tiedosto`;

    const req = controller.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');

    req.flush(mockBlob);
    tick();
  }));

});
