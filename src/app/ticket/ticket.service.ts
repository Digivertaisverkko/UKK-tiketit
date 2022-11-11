import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { firstValueFrom, Subject, Observable, throwError } from 'rxjs';

export interface Comment {
  aikaleima: Date;
  lahettaja: {
    id: number;
    nimi: string;
    sposti: string;
    asema: string;
  }
  viesti: string;
}

export interface Course {
  id: string;
  nimi: string;
}

// Field = Tiketin lisäkenttä
export interface Field {
  id: number;
  arvo: string;
}

export interface Question {
  tila: number;
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: {
    id: number,
    nimi: string;
    sposti: string;
    asema: string;
  };
}

// Kentät ja kommentit ovat valinnaisia, koska ne haetaan myöhemmässä vaiheess omilla kutsuillaan.
export interface FieldInfo {
  id: string
  otsikko: string
  pakollinen: boolean
  esitaytettava: boolean
}

export interface NewTicket {
  otsikko: string;
  viesti: string;
  kentat?: Array<Field>;
}

// Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan myöhemmässä vaiheessa omilla kutsuillaan.
export interface Ticket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittaja: {
    id: number;
    nimi: string;
    sposti: string;
    asema: string;
  }
  tila: number;
  kentat?: Array<Field>;
  viesti: string;
  kommentit: Array<Comment>;
}

export enum Tila {
  "Virhetila",
  "Lähetty",
  "Luettu",
  "Lisätietoa pyydetty",
  "Kommentoitu",
  "Ratkaistu",
  "Arkistoitu"
}

@Injectable({
  providedIn: 'root',
})

// Tämä service on käsittelee tiketteihin liittyvää tietoa.
export class TicketService {
  private messages$ = new Subject<string>();

  constructor(private http: HttpClient) {}

  // Ota vastaan viestejä tästä servicestä (subscribe vastaukseen).
  public onMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  // Lopeta viestien vastaanottaminen tästä servicestä.
  public unsubscribeMessage(): void {
    this.messages$.unsubscribe;
  }

  // Lisää uusi kommentti tikettiin. Palauttaa true jos viestin lisääminen onnistui.
  public async addComment(ticketID: string, message: string): Promise<boolean> {
    if (isNaN(Number(ticketID))) {
      throw new Error('Kommentin lisäämiseen tarvittava ticketID ei ole numero.')
    }
    const httpOptions = this.getHttpOptions();
    const body: object =  {
      viesti: message
    }
    let response: any;
    console.log('message: ' + body);
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/uusikommentti';
    console.dir(httpOptions);
    try {
      response = await firstValueFrom(
        this.http.post<object>(url, body, httpOptions)
      );
      console.log(
        'Saatiin POST-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    if (response.success !== undefined && response.success == true) {
      this.sendMessage('Kommentin lisääminen tikettiin onnistui.');
      return true;
    } else {
      this.sendMessage('Kommentin lisääminen tikettiin epäonnistui.');
      return false;
    }
  }

  // Hae uutta tikettiä tehdessä tarvittavat lisätiedot: /api/kurssi/:kurssi-id/uusitiketti/kentat/
  public async getTicketFieldInfo(courseID: string): Promise<FieldInfo[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/uusitiketti/kentat';
    console.dir(httpOptions);
    try {
      response = await firstValueFrom(
        this.http.get<FieldInfo[]>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  // Lisää uusi tiketti. Palautusarvo kertoo, onnistuiko tiketin lisääminen.
  public async addTicket(courseID: string, newTicket: NewTicket): Promise<boolean> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    const url = environment.apiBaseUrl + '/kurssi/' + courseID + '/uusitiketti';
    const body = newTicket;
    try {
      console.log('Yritetään lähettää tiketti: ' + JSON.stringify(newTicket) + '  ULR:iin "' +
      url + '"');
      response = await firstValueFrom(
        this.http.post<NewTicket>(url, body, httpOptions)
      );
      console.log(
        'saatiin vastaus tiketin lisäämiseen: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    let message: string = '';
    if (response.success == undefined) {
      this.sendMessage('Tiketin lisäyksen onnistumisesta ei saatu vahvistusta.');
      return false; 
    } else {
      if (response.success == true) {
        this.sendMessage('Tiketti lisättiin onnistuneesti');
        return true;
      } else {
        this.sendMessage('Tiketin lisääminen epäonnistui');
        return false;
      }
    }
  }

  // Palauta kurssin nimi.
  public async getCourseName(courseID: string): Promise<string> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/' + courseID;
    console.dir(httpOptions);
    try {
      response = await firstValueFrom(
        this.http.get<{'kurssi-nimi': string}[]>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      console.log(typeof response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response['nimi'];
  }

  // Palauta lista käyttäjän kursseista.
  public async getCourses(): Promise<Course[]> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Course[]>(this.http.get<any>(url, httpOptions));
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  /* lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana.
  Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
  onlyOwn = true palauttaa ainoastaan itse luodut tiketit. */ 
  public async getQuestions(courseID: string, onlyOwn?: boolean): Promise<Question[]> {
    const httpOptions = this.getHttpOptions();
    let target: string;
    if (onlyOwn !== undefined && onlyOwn == true) {
      target = 'omat';
    } else {
      target = 'kaikki';
    }
    let url = environment.apiBaseUrl + '/kurssi/' + courseID + '/' + target;
    let response: any;
    try {
      response = await firstValueFrom(
        this.http.get<Question[]>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  // Ei tarvita: käytä Tila: enum tämän sijaan.
  // public getTicketState(stateNumber: number): string {
  //   let state: string = '';
  //   switch (stateNumber) {
  //     case 0: state = "Virhetila"; break;
  //     case 1: state = "Lähetty"; break;
  //     case 2: state = "Luettu"; break;
  //     case 3: state = "Lisätietoa pyydetty"; break;
  //     case 4: state = "Kommentoitu"; break;
  //     case 5: state = "Ratkaistu"; break;
  //     case 6: state = "Arkistoitu"; break;
  //     default: throw new Error('Tiketin tilaa ei määritelty välillä 0-6.');
  //   }
  //   return state;
  // }

  // Palauta yhden tiketin tiedot.
  public async getTicketInfo(ticketID: string): Promise<Ticket> {
    const httpOptions = this.getHttpOptions();
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID;
    try {
      response = await firstValueFrom(
        this.http.get<Ticket>(url, httpOptions)
      );
      console.log('Saatiin "' + url + '" vastaus: ' + JSON.stringify(response) + ' . Vastaus myös alla.');
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    let ticket: Ticket = response;
    response = await this.getFields(ticketID, httpOptions);
    ticket.kentat = response;
    response  = await this.getComments(ticketID, httpOptions);
    // Tiketin viestin sisältö on palautuksen ensimmäinen kommentti.
    ticket.viesti = response[0].viesti;
    response.shift();
    ticket.kommentit = response;

    console.log('Lopullinen tiketti alla:');
    console.log(ticket);
    return ticket
  }

  // Palauta listan tiketin kommenteista.
  private async getComments(ticketID: string, httpOptions: object): Promise<Comment[]>{
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kommentit';
    try {
      response = await firstValueFrom<Comment[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log('Got from "' + url + '" response: ' + JSON.stringify(response));
      console.dir(response);
    } catch (error: any) {
      this.handleError(error);
    }
    // if (Object.keys(response).length === 0) {
    // }
    let comments: Comment[];
    comments = this.arrangeComments(response);
    return comments
  }

  // Järjestä kommentit vanhimmasta uusimpaan.
  private arrangeComments(comments: Comment[]): Comment[] {
    const commentsWithDate = comments.map(comment => {
      return { ...comment, aikaleima: new Date(comment.aikaleima) }
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

  // Hae lisäkentät
  private async getFields(ticketID: string, httpOptions: object): Promise<Field[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kentat';
    try {
      response = await firstValueFrom<Field[]>(
        this.http.get<any>(url, httpOptions)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
      console.log(
        'Saatiin GET-kutsusta URL:iin "' + url + '" vastaus: ' + JSON.stringify(response)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    this.checkErrors(response);
    return response;
  }

  // Palauta HttpOptions, johon on asetettu session-id headeriin.
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
    return options;
  }

  // HTTP-kutsujen virheidenkäsittely
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred.
      console.error('Virhe tapahtui:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Saatiin virhe tilakoodilla ${error.status} ja viestillä: `,
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
      () => new Error(message)
    );
  }

  // Palvelimelta saatujen vastauksien virheenkäsittely.
  private checkErrors(response: any) {
    var message: string = '';
    if (response == undefined) {
      message = 'Virhe: ei vastausta palvelimelta.';
      this.sendMessage(message);
      throw new Error(message);
    }
    if (response.error !== undefined && response.error.success == false) {
      let errorInfo: string = '';
      if (response.error !== undefined) {
        const error = response.error;
        errorInfo = 'Virhekoodi: ' + error.tunnus + ', virheviesti: ' + error.virheilmoitus;
      }
      message = 'Yhteydenotto palvelimeen epäonnistui. ' + errorInfo;
      this.sendMessage(message);
      throw new Error(message);
    }
  }

  // Lähetä virheviesti komponenttiin ja consoleen.
  private sendMessage(message: string) {
    console.log('ticketService: ' + message);
    this.messages$.next(message);
  }
}
