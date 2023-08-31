import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { initializeLanguageFI } from '../app.initializers';
import localeFi from '@angular/common/locales/fi';
import localeEn from '@angular/common/locales/en';
import { SortableTicket, TicketService } from './ticket.service';
import { storeDummyData } from '@core/services/store.service.dummydata';
import { StoreService } from '@core/services/store.service';
import { ErrorService } from '@core/services/error.service';
import { ticketDummyData } from './ticket.dummydata';

environment.testing = true;
const api = environment.apiBaseUrl;
initializeLanguageFI();

describe('TicketService', () => {
  let controller: HttpTestingController;
  let errors: ErrorService;
  let store: StoreService;
  let tickets: TicketService;


  beforeEach(async () => {

    await TestBed.configureTestingModule({
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


  /*
  it('retrieves the full ticket list', (done) => {
    let actualTicketListData: SortableTicket[] | null | undefined;
    store.setUserInfo(storeDummyData.teacherUser);
    const courseID = '1';

    tickets.getTicketList(courseID).then(res => {
      actualTicketListData = res;
      const ignoredProperty: keyof SortableTicket = 'tila';
      let actualWithoutIgnoredProperty
      if (actualTicketListData) {
        actualWithoutIgnoredProperty = actualTicketListData.map(ticket => {
          const { [ignoredProperty]: deletedProperty, ...ticketWithoutIgnoredProperty } = ticket;
          return ticketWithoutIgnoredProperty;
        });
      }
      expect(actualWithoutIgnoredProperty).toEqual(ticketDummyData.ticketListClientData);
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
  */


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
    const fieldsRequest = controller.expectOne(fieldsUrl);
    fieldsRequest.flush(ticketDummyData.ticket3KenttaArray);
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


  it('gets an attachment', fakeAsync (() => {
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
    const contentTypeHeader = req.request.headers.get('Content-Type');
    expect(contentTypeHeader).toBe('multipart/form-data');

    req.flush(mockBlob);
    tick();
  }));


  it('upload a file and report progress', (done: DoneFn) => {
    const ticketID = '123';
    const commentID = '456';
    const courseID = '1';
    const file = new File(['test file content'], 'test.txt', { type: 'text/plain' });

    const uploadProgressSpy = jasmine.createSpy('uploadProgressSpy');
    const errorSpy = jasmine.createSpy('errorSpy');
    const completeSpy = jasmine.createSpy('completeSpy');

    const progressObservable = tickets.uploadFile(ticketID, commentID, courseID, file);
    progressObservable.subscribe({
      next: (progress: number) => {
        uploadProgressSpy(progress);
      },
      error: (error: any) => {
        errorSpy(error);
      },
      complete: () => {
        completeSpy();
        expect(uploadProgressSpy).toHaveBeenCalledWith(50);
        expect(completeSpy).toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        done();
      }
    });

    const req = controller.expectOne(
      `${api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/${commentID}/liite`
    );

    expect(req.request.method).toBe('POST');
    req.event({ type: 1, loaded: 50, total: 100 }); // Progress event

    req.flush({}, { status: 200, statusText: 'OK' }); // Response
  });

  it('handles error during upload', (done: DoneFn) => {
    const ticketID = '123';
    const commentID = '456';
    const courseID = '1';
    const file = new File(['test file content'], 'test.txt', { type: 'text/plain' });

    const uploadProgressSpy = jasmine.createSpy('uploadProgressSpy');
    const errorSpy = jasmine.createSpy('errorSpy');
    const completeSpy = jasmine.createSpy('completeSpy');

    const progress = tickets.uploadFile(ticketID, commentID, courseID, file);
    progress.subscribe({
      next: (progress: number) => {
        uploadProgressSpy(progress);
      },
      error: (error: any) => {
        errorSpy(error);
        expect(errorSpy).toHaveBeenCalled();
        expect(uploadProgressSpy).not.toHaveBeenCalled();
        expect(completeSpy).not.toHaveBeenCalled();
        done();
      },
      complete: () => {
        completeSpy();
      }
    });

    const req = controller.expectOne(
      `${api}/kurssi/${courseID}/tiketti/${ticketID}/kommentti/${commentID}/liite`
    );

    req.error(new ProgressEvent('error', { loaded: 0, total: 0 }));

  });


});
