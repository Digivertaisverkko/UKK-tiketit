import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { firstValueFrom, Subject, Observable, throwError } from 'rxjs';

export interface Question {
  id: string;
  otsikko: string;
  pvm: string;
  tila: number;
  tehtävä: string;
}

export interface Course {
  id: string;
  nimi: string;
  ulkotunnus: number;
}

export interface CourseName {
  'kurssi-nimi': string;
}

@Injectable({
  providedIn: 'root',
})

// Tämä service on käsittelee tiketteihin liittyvää tietoa.
export class TicketServiceService {
  private messages$ = new Subject<string>();

  constructor(private http: HttpClient) {}

  // Ota vastaan viestejä tästä servicestä (subscribe).
  public onMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  // Älä ota vastaan viestejä tästä servicestä.
  public unsubscribeMessage(): void {
    this.messages$.unsubscribe;
  }

  // Palauta kurssin nimi.
  public async getCourseName(courseID: string): Promise<string> {
    let sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('No session id set.');
    }
    console.log('session id on: ' + sessionID);
    console.log(typeof sessionID);
    let httpOptions = {
      headers: new HttpHeaders({
        'session-id': sessionID
      })
    };
    console.log('httpOptions: ' + JSON.stringify(httpOptions))
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID;
    console.dir(httpOptions);
    try {
      response = await firstValueFrom(
        this.http.get<CourseName[]>(url, httpOptions)
      );
      console.log(
        'Got from "' + url + '" response: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == false) {
      throw new Error('Request denied. Error message: ' + response.error);
    }
    return response;
  }

  // Palauta lista käyttäjän kursseista.
  public async getCourses(): Promise<Course[]> {
    const httpOptions = this.getHttpOptions();
    console.log(JSON.stringify(httpOptions));
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Course[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log(
        'Got from "' + url + '" response: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == false) {
      throw new Error('Request denied. Error message: ' + response.error);
    }
    return response;
  }

  // Palauta lista käyttäjän tekemistä kysymyksistä.
  public async getQuestions(courseID: string): Promise<Question[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/omat';
    try {
      response = await firstValueFrom<Question[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log(
        'Got from "' + url + '" response: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response.success == false) {
      throw new Error('Request denied. Error message: ' + response.error);
    }
    return response;
  }

  private getHttpOptions(): object {
    let sessionID = window.sessionStorage.getItem('SESSION_ID');
    if (sessionID == undefined) {
      throw new Error('No session id set.');
    }
    console.log('session id on: ' + sessionID);
    let options = {
      headers: new HttpHeaders({
        'session-id': sessionID
      })
    };
    console.log(' Palautetaan: ' + JSON.stringify(options));
    return options;
  }

  // Virheidenkäsittely
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    let message = 'Yhteydenotto palvelimeen ei onnistunut.';
    if (error !== undefined) {
      if (error.error.length > 0) {
        message += 'Virhe: ' + error.error;
      }
      if (error.status !== undefined) {
        message += 'Tilakoodi: ' + error.status;
      }
    }
    this.sendMessage(message);
    return throwError(
      () => new Error('Unable to get user questions from server.')
    );
  }

  // Lähetä virheviesti näkymään.
  private sendMessage(message: string) {
    this.messages$.next(message);
  }
}
