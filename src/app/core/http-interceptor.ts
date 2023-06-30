import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler }
    from '@angular/common/http';
import { Observable, PartialObserver, tap } from 'rxjs';
import { truncate } from '../shared/utils';
import { StoreService } from './services/store.service';

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
    // Näyttää progress barin.
    this.store.startLoading();
    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            this.logResponse(request, event);
            this.store.stopLoading();
          }
        },
        error: (error) => {
          this.store.stopLoading()
        }
      })
    );
  }

  private logResponse(request: any, event: any): void {
    const responseBody = JSON.stringify(event.body);

    let huomautus: string;
    if (event.body === null) {
      huomautus = ' (voi olla myös tyhjä objekti "{}")'
    } else {
      huomautus = '';
    }

    let bodyMessage = '';
    if (request.body) {
      if (Object.keys(request.body).length < 4 ) {
       bodyMessage = ` Pyynnön body: "${JSON.stringify(request.body)}".`;
      } else {
        bodyMessage = ' Pyynnön body alla.';
      }
    }

    console.log(`Tehtiin ${request.method}-pyyntö URL:iin "${request.url}` +
      `".${bodyMessage} Tilakoodi ${event.status}. ` +
      `Saatiin vastaukseksi "${truncate(responseBody, 1500, true)}"` +
      huomautus + '.');

    if (request.body && Object.keys(request.body).length >= 4 ) {
      console.dir(request.body);
    }

  }

}

