import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { firstValueFrom, Subject, Observable, throwError } from 'rxjs';
import { state } from '@angular/animations';
import { getMatFormFieldMissingControlError } from '@angular/material/form-field';

export interface Question {
  id: string;
  otsikko: string;
  pvm: Date;
  tila: number;
  tehtävä: string;
}

// Ulkotunnus lähtee pois.
export interface Course {
  id: string;
  nimi: string;
  ulkotunnus: number;
}

export interface Comment {
  'kirjoittaja-id': string;
  aikaleima: Date;
  tila: number;
  teksti: string; 
}

export interface Ticket {
  otsikko: string;
  viesti: string;
  'aloittaja-id': number;
  tila: string;
  kentat?: [{
    nimi: string;
    arvo: string;
  }];
  kommentit?: [Comment];
}
    
//     {
//     'kirjoittaja-id': string;
//     pvm: string;
//     tila: number;
//     teksti: string; 
//   }]
// }

export interface AdditionalField {
  nimi: string;
  arvo: string;
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
        this.http.get<{'kurssi-nimi': string}[]>(url, httpOptions)
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
    const courseName = response['nimi'];
;    return courseName;
  }

  // Palauta lista käyttäjän kursseista.
  public async getCourses(): Promise<Course[]> {
    const httpOptions = this.getHttpOptions();
    console.log(JSON.stringify(httpOptions));
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Course[]>(this.http.get<any>(url, httpOptions));
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
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
      response = await firstValueFrom(
        this.http.get<Question[]>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response == undefined) {
      throw new Error('Vastausta palvelimelta ei saatu.');
    }
    if (response?.success == false) {
      throw new Error('Request denied. Error message: ' + response.error);
    }
    return response;
  }

  public async getTicketInfo(ticketID: string): Promise<Ticket> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let ticket: Ticket;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID;
    try {
      response = await firstValueFrom(
        this.http.get<Ticket>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response == undefined) {
      throw new Error('Vastausta palvelimelta ei saatu.');
    };
    if (response?.success == false) {
      throw new Error('Request to ' + url + ' denied. Error message: ' + response.error);
    }
    ticket = response[0];
    response = await this.getAdditionalFields(ticketID, httpOptions);
    ticket.kentat = response;

    response = await this.getComments(ticketID, httpOptions);
    ticket.kommentit = response;
    return ticket
  }

  private async getComments(ticketID: string, httpOptions: object): Promise<Comment[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kommentit';
    try {
      response = await firstValueFrom<Comment[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response == undefined ) {
      throw new Error("Error. Didn't get response from server.");
    } else if (response?.success == false) {
      throw new Error('Request to ' + url + ' unsuccesfulll. Error message: ' + response.error.virheilmoitus);
    }
    let comments: Comment[];
    comments = this.arrangeComments(response);
    return comments;
  }

  private arrangeComments(comments: Comment[]): Comment[] {
    const commentsWithDate = comments.map(comment => {
      return {...comment, aikaleima: new Date(comment.aikaleima) };
    });
    const commentsAscending = commentsWithDate.sort(
      (commentA, commentB) => commentA.aikaleima.getTime() - commentB.aikaleima.getTime(),
    );
    // const commentsDescending = commentsWithDate.sort(
    //   (commentA, commentB) => commentB.aikaleima.getTime() - commentA.aikaleima.getTime(),
    // );
    console.log('Kommentit järjestyksessä:');
    console.dir(commentsAscending);
    return commentsAscending;
  }

  private async getAdditionalFields(ticketID: string, httpOptions: object): Promise<AdditionalField[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kentat';
    try {
      response = await firstValueFrom<AdditionalField[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    if (response == undefined ) {
      throw new Error("Error. Didn't get response from server.");
    } else if (response.success == false) {
      throw new Error('Request to ' + url + ' denied. Error message: ' + response.error);
    }
    return response;
  }

  public getTicketState(stateNumber: number): string {
    let state: string = '';
    switch (stateNumber) {
      case 0: state = "Virhetila"; break;
      case 1: state = "Lähetty"; break;
      case 2: state = "Luettu"; break;
      case 3: state = "Lisätietoa pyydetty"; break;
      case 4: state = "Kommentoitu"; break;
      case 5: state = "Ratkaistu"; break;
      case 6: state = "Arkistoitu"; break;
      default: throw new Error('Tiketin tilaa ei määritelty välillä 0-6.');
    }
    return state;
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
        `Palvelin palautti koodin ${error.status}, viestin runko: `,
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
