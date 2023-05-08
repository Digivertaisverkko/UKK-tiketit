import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler }
    from '@angular/common/http';
import { Observable, PartialObserver, tap } from 'rxjs';
import { truncate } from '../shared/utils';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })

// Kaikkien HTTP-pyyntöjen yhteydessä tehtävät toimet.
export class CustomHttpInterceptor implements HttpInterceptor {

  private readonly observer: PartialObserver<any> = {
    error: () => this.store.stopLoading(),
    complete: () => this.store.stopLoading()
  };

  constructor (private readonly store: StoreService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>> {
    this.store.startLoading();
    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            this.consoleLogError(request, event);
            this.store.stopLoading();
          }
        },
        error: (error) => {
          this.store.stopLoading()
        }
      })
    );
  }

  private consoleLogError(request: any, event: any): void {
    const responseBody = JSON.stringify(event.body);
    console.log(`Tehtiin ${request.method}-pyyntö URL:iin "${request.url} +
      ". Tilakoodi ${event.status}. ` +
    // `Saatiin vastaukseksi "${responseBody}".`);
    `Saatiin vastaukseksi "${truncate(responseBody, 500, true)}".`);
    if (request.body != null && request.body.length > 0) {
      const requestBody = JSON.stringify(request.body);
      console.log(`Pyynnön body: "$${truncate(requestBody, 500, true)}"`);
    }
  }

}

