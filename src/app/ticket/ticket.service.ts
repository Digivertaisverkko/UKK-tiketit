import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import '@angular/localize/init';
import { firstValueFrom, Observable, catchError, throwError, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../core/auth.service';
import { ErrorService } from '../core/error.service';

@Injectable({ providedIn: 'root' })

// Tämä service on käsittelee tiketteihin liittyvää tietoa.
export class TicketService {

  public $messages = new Subject<string>();
  private debug: boolean = false;

  constructor (private auth: AuthService,
    private errorService: ErrorService,
    private http: HttpClient) {}

  trackMessages(): Observable<string> {
    return this.$messages.asObservable();
  }

  // Hae kurssin UKK-kysymykset taulukkoon sopivassa muodossa.
  public async getFAQ(courseID: string): Promise<UKK[]> {
    let url = `${environment.apiBaseUrl}/kurssi/${courseID}/ukk`;
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<UKK[]>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    // Jos tarvitsee muokata dataa.
    // let tableData = response.map((faq: UKK ) => (
    //   {
    //     id: faq.id,
    //     otsikko: faq.otsikko,
    //     aikaleima: faq.aikaleima,
    //     tyyppi: faq. tyyppi,
    //     tila: faq.tila
    //   }
    // ));
    return response;
  }

  // Palauta tiketin sanallinen tila numeerinen arvon perusteella.
  public getTicketState(numericalState: number): string {
    let verbal: string;
    switch (numericalState) {
      case 0: verbal = $localize `:@@Virhetila:Virhetila`; break;
      case 1: verbal = $localize `:@@Lähetetty:Lähetetty`; break;
      case 2: verbal = $localize `:@@Luettu:Luettu`; break;
      case 3: verbal = $localize `:@@Lisätietoa pyydetty:Lisätietoa pyydetty`; break;
      case 4: verbal = $localize `:@@Kommentoitu:Kommentoitu`; break;
      case 5: verbal = $localize `:@@Ratkaistu:Ratkaistu`; break;
      case 6: verbal = $localize `:@@Arkistoitu:Arkistoitu`; break;
      default:
        throw new Error('getTicketState: Tiketin tilan numeerinen arvo täytyy olla välillä 0-6.');
    }
    return verbal;
  }

  // Lisää uusi kommentti tikettiin. Palauttaa true jos viestin lisääminen onnistui.
  public async addComment(ticketID: string, message: string, fileList: File[], tila?: number): Promise<NewCommentResponse> {
    if (isNaN(Number(ticketID))) {
      throw new Error('Kommentin lisäämiseen tarvittava ticketID ei ole numero.')
    }
    if (tila !== undefined) {
      if (tila < 0 || tila > 6) throw new Error('ticketService.addComment: tiketin tilan täytyy olla väliltä 0-6.');
    }
    interface newComment {
      viesti: string;
      tila?: number;
    }
    let body: newComment = { viesti: message }
    if (tila !== undefined) body.tila = tila
    let response: any;
    let url = `${environment.apiBaseUrl}/tiketti/${ticketID}/uusikommentti`;
    try {
      response = await firstValueFrom( this.http.post<NewCommentResponse>(url, body ) );
      this.auth.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    if (fileList.length == 0 ) return response;
    const commentID = String(response?.kommentti);
    if (commentID == null) {
      throw new Error('addComment: ei liitteiden lisäämiseen tarvittavaa kommentin id:ä.');
    }
    let sendFileResponse: any;
    for (let file of fileList) {
      try {
        sendFileResponse = await this.sendFile(ticketID, commentID, file);
      } catch (error: any) {
        this.handleError(error);
      }
    }
    return response
  }

  // Hae uutta tikettiä tehdessä tarvittavat lisätiedot: /api/kurssi/:kurssi-id/uusitiketti/kentat/
  public async getTicketFieldInfo(courseID: string, fieldID?: string): Promise <KentanTiedot[]> {
    let response: any;
    let url = `${environment.apiBaseUrl}/kurssi/${courseID}/tiketinkentat`;
    try {
      response = await firstValueFrom( this.http.get<KentanTiedot[]>(url) );
    } catch (error: any) {
      this.handleError(error);
    }
    if (fieldID) response = response.filter((field: KentanTiedot) => field.id == fieldID);
    return response;
  }

  // Luo uudet kentät tikettipohjalle.
  public async setTicketFieldInfo(courseID: string, fields: KentanTiedot[]) {
    for (let field of fields) {
      if (field.id != null) delete field.id;
    }
    const url = `${environment.apiBaseUrl}/kurssi/${courseID}/tiketinkentat`;
    let response: any;
    const body = { kentat: fields };
    try {
      console.log('Lähetetään GET-pyyntö urliin: ' + url);
      response = await firstValueFrom( this.http.put(url, body) );
    } catch (error: any) {
      this.handleError(error);
    }
    return (response?.success === true) ? true : false;
  }

  /* editFaq = Muokataanko vanhaa UKK:a (vai lisätäänkö kokonaan uusi).
     Edellisessä tapauksessa ID on UKK:n ID, jälkimmäisessä kurssi ID. */

  // FIXME: eri muotoinen nimi kuin esim. addTicket.
  public async sendFaq(ID: string, newFaq: UusiUKK, fileList: File[], editFaq?: boolean) {
    let url = (editFaq?.toString() === 'true') ? `/tiketti/${ID}/muokkaaukk` : `/kurssi/${ID}/ukk`;
    url = environment.apiBaseUrl + url;
    let response: any;
    const body = newFaq;
    try {
      response = await firstValueFrom(this.http.post<UusiUKK>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    if (fileList?.length === 0 ) return
    const ticketID = String(response.uusi.tiketti);
    const firstCommentID = String(response.uusi.kommentti);
    let sendFileResponse: any;
    for (let file of fileList) {
      try {
        sendFileResponse = await this.sendFile(ticketID, firstCommentID, file);
      } catch (error: any) {
        this.handleError(error);
      }
    }
  }

  public async editTicket(ticketID: string, ticket: UusiTiketti, fileList?: File[]): Promise<boolean> {
    let response: any;
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}`;
    const body = ticket;
    try {
      console.log(`Lähetetään ${JSON.stringify(body)} osoitteeseen ${url}`)
      response = await firstValueFrom(this.http.put(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response?.success !== true) return false
    if (fileList?.length == 0 || !fileList ) return true
    const firstCommentID = String(response.uusi.kommentti);
    let sendFileResponse: any;
    for (let file of fileList) {
      try {
        sendFileResponse = await this.sendFile(ticketID, firstCommentID, file);
      } catch (error: any) {
        this.handleError(error);
      }
    }
    return true
  }

  // Lisää uusi tiketti. Palauttaa true, jos lisääminen onnistui.
  public async addTicket(courseID: string, newTicket: UusiTiketti, fileList: File[]): Promise<boolean> {
    let response: any;
    const url = `${environment.apiBaseUrl}/kurssi/${courseID}/uusitiketti`;
    const body = newTicket;
    try {
      response = await firstValueFrom(this.http.post<AddTicketResponse>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    if (response?.success !== true) return false
    if (fileList.length == 0 ) return true
    const ticketID = String(response.uusi.tiketti);
    const firstCommentID = String(response.uusi.kommentti);
    let sendFileResponse: any;
    for (let file of fileList) {
      try {
        sendFileResponse = await this.sendFile(ticketID, firstCommentID, file);
      } catch (error: any) {
        this.handleError(error);
      }
    }
    return true
  }

  // Lisää tiketti ilman tiedostoja.
  public async addOnlyTicket(courseID: string, newTicket: UusiTiketti): Promise<AddTicketResponse> {
    let response: any;
    const url = `${environment.apiBaseUrl}/kurssi/${courseID}/uusitiketti`;
    const body = newTicket;
    try {
      response = await firstValueFrom(this.http.post<AddTicketResponse>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  public async uploadFiles(ticketID: string, commentID: string, fileList: File[]) {
    let sendFileResponse: any;
    for (let file of fileList) {
      try {
        sendFileResponse = await this.sendFile(ticketID, commentID, file);
      } catch (error: any) {
        this.handleError(error);
      }
    }
  }

    // if (response.success == undefined) {
    //   this.sendMessage($localize `:@@Kysymyksen lisäämisestä ei vahvistusta:Kysymyksen lisäämisen onnistumisesta ei saatu vahvistusta.`)
    //   return false;
    // } else {
    //   if (response.success == true) {
    //     this.sendMessage($localize `:@@Kysymys lisättiin onnistuneesti:Kysymys lisättiin onnistuneesti`);
    //     return true;
    //   } else {
    //     this.sendMessage($localize `:@@Kysymys lisääminen epäonnistui:Kysymys lisääminen epäonnistui`);
    //     return false;
    //   }
    // }

  

  // Lähetä yksi liitetiedosto. Palauttaa, onnistuiko tiedoston lähettäminen.
  public async sendFile(ticketID: string, commentID: string, file: File): Promise<boolean> {
    let formData = new FormData();
    formData.append('tiedosto', file);
    console.log('ticketService: Yritetään lähettää formData:');
    console.dir(formData);
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/kommentti/${commentID}/liite`;
    let response: any;
    try {
      // Huom. Ei toimi, jos asettaa headerin: 'Content-Type: multipart/form-data'
      response = await firstValueFrom<any>(this.http.post(url, formData));
    } catch (error: any) {
      this.handleError(error);
    }
    return (response?.success === true) ? true : false;
  }

  // Vastaava kuin yllä, mutta progress baria varten.
  public uploadFile(ticketID: string, commentID: string, file: File): Observable<any>{
    let formData = new FormData();
    formData.append('tiedosto', file);
    console.log('ticketService: Yritetään lähettää formData:');
    console.dir(formData);
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/kommentti/${commentID}/liite`;
    return this.http.post(url, formData, { reportProgress: true, observe: 'events' })
      .pipe(catchError(error => {
        console.log(error);
        return throwError(() => new Error(error));
      }
    ));
  }

  // Lataa tiedosto.
  public async getFile(ticketID: string, commentID: string, fileID: string): Promise<Blob> {
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/kommentti/${commentID}/liite/${fileID}/lataa`;
    const options = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
    };
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<Blob>(url, options));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  public async removeTicket(ticketID: string): Promise<boolean> {
    let response: any;
    let url = `${environment.apiBaseUrl}/tiketti/${ticketID}`;
    try {
      response = await firstValueFrom(this.http.delete(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response?.success === true ? true : false;
  }

  // Arkistoi (poista) UKK.
  public async archiveFAQ(ticketID: number): Promise<{success: boolean}> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    const url = `${environment.apiBaseUrl}/tiketti/${String(ticketID)}/arkistoiukk`;
    try {
      response = await firstValueFrom<{success: boolean}>(this.http.post<{success: boolean}>(url, {}));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Palauta kurssin nimi.
  public async getCourseName(courseID: string): Promise<string> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    let url = `${environment.apiBaseUrl}/kurssi/${courseID}`;
    try {
      response = await firstValueFrom( this.http.get<{'kurssi-nimi': string}[]>(url) );
    } catch (error: any) {
      this.handleError(error);
    }
    return response['nimi'];
  }

  // Palauta listan kaikista kursseista.
  public async getCourses(): Promise<Kurssi[]> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    let url = environment.apiBaseUrl + '/kurssit';
    try {
      response = await firstValueFrom<Kurssi[]>(this.http.get<any>(url));
      this.auth.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Palauta listan kaikista kursseista, joilla käyttäjä on.
  public async getMyCourses(): Promise<Kurssini[]> {
    //const httpOptions = this.getHttpOptions();;
    let response: any;
    let url = environment.apiBaseUrl + '/kurssi/omatkurssit';
    try {
      response = await firstValueFrom<Kurssini[]>(this.http.get<any>(url));
      this.auth.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /* lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana.
  Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
  onlyOwn = true palauttaa ainoastaan itse luodut tiketit. */
  public async getTicketListOld(courseID: string, onlyOwn?: boolean): Promise<TiketinPerustiedot[]> {
    if (courseID === '') {
      throw new Error('Ei kurssi ID:ä.');
    }
    //const httpOptions = this.getHttpOptions();;
    let target = (onlyOwn == true) ? 'omat' : 'kaikki';
    let url = environment.apiBaseUrl + '/kurssi/' + String(courseID) + '/' + target;
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<TiketinPerustiedot[]>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  /* Palauttaa listan tikettien tiedoista taulukkoa varten. Opiskelijalle itse lähettämät tiketit ja
  opettajalle kaikki kurssin tiketit. onlyOwn = true palauttaa ainoastaan itse luodut tiketit. */
  public async getTicketList(courseID: string, onlyOwn?: boolean): Promise<SortableTicket[]> {
    if (courseID === '') {
      throw new Error('Ei kurssi ID:ä.');
    }
    // //const httpOptions = this.getHttpOptions();;
    let target = (onlyOwn == true) ? 'omat' : 'kaikki';
    let url = environment.apiBaseUrl + '/kurssi/' + String(courseID) + '/' + target;
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<TiketinPerustiedot[]>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    // Muutetaan taulukkoon sopivaan muotoon.
    const myName = this.auth.getUserInfo().nimi;
    const me = $localize`:@@Minä:Minä`;
    let sortableData: SortableTicket[] = response.map((ticket: TiketinPerustiedot) => (
      {
        tilaID: ticket.tila,
        tila: this.getTicketState(ticket.tila),
        id: ticket.id,
        otsikko: ticket.otsikko,
        aikaleima: ticket.aikaleima,
        aloittajanNimi: (ticket.aloittaja.nimi === myName) ? me : ticket.aloittaja.nimi
      }
    ));
    return sortableData;
  }

  // Palauta yhden tiketin kaikki tiedot mukaanlukien kommentit.
  public async getTicketInfo(ticketID: string): Promise<Tiketti> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID;
    try {
      response = await firstValueFrom(this.http.get<Tiketti>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    let ticket: Tiketti = response;
    // TODO: Tee nämä kutsut rinnakkain.
    response = await this.getFields(ticketID);
    ticket.kentat = response;
    response  = await this.getComments(ticketID);
    // Tiketin viestin sisältö on sen ensimmäinen kommentti.
    ticket.viesti = response[0].viesti;
    ticket.liitteet = response[0].liitteet;
    response.shift();
    ticket.kommentit = response;
    return ticket
  }

  // Palauta listan tiketin kommenteista.
  private async getComments(ticketID: string): Promise<Kommentti[]>{
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kommentit';
    try {
      response = await firstValueFrom<Kommentti[]>(
        this.http.get<any>(url)
      );
    } catch (error: any) {
      this.handleError(error);
    }
    // if (Object.keys(response).length === 0) {
    // }
    let comments: Kommentti[];
    comments = this.arrangeComments(response);
    return comments
  }

  // Järjestä kommentit vanhimmasta uusimpaan.
  private arrangeComments(comments: Kommentti[]): Kommentti[] {
    const commentsWithDate = comments.map(comment => {
      return { ...comment, aikaleima: new Date(comment.aikaleima) }
    });
    const commentsAscending = commentsWithDate.sort(
      (commentA, commentB) => commentA.aikaleima.getTime() - commentB.aikaleima.getTime(),
    );
    // const commentsDescending = commentsWithDate.sort(
    //   (commentA, commentB) => commentB.aikaleima.getTime() - commentA.aikaleima.getTime(),
    // );
    // console.log('Kommentit järjestyksessä:');
    // console.dir(commentsAscending);
    return commentsAscending;
  }

  // Hae listan tietyn tiketin lisäkentistä.
  private async getFields(ticketID: string): Promise<Kentta[]> {
    let response: any;
    let url = environment.apiBaseUrl + '/tiketti/' + ticketID + '/kentat';
    try {
      response = await firstValueFrom<Kentta[]>( this.http.get<any>(url) );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // logitukseen.
  private getMethodName() {
    return this.getMethodName.caller.name
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403 && error?.error?.error?.tunnus == 1000) {
        console.error('Virhe: Et ole kirjautunut. Ohjataan kirjautumiseen.');
        this.auth.handleNotLoggedIn();
    } else {
      this.errorService.handleServerError(error);
    }
  }

}

// ========== Rajapinnat ==============

// Jäsenmuuttujien järjestys pitäisi vastata palvelimen API-dokumenttia.

export interface Error {
  tunnus: number;
  virheilmoitus: string;
}

// Rajapinnoissa on mainittu, missä metodissa sitä käytetään ja mitä palvelimen API:a se vastaa.

// Metodi: getCourses, API: /api/kurssit/
export interface Kurssi {
  id: string;
  nimi: string;
}

// Metodi: getMyCourses, API: /api/kurssi/omatkurssit/
export interface Kurssini {
  kurssi: number;
  asema: 'opiskelija' | 'opettaja' | 'admin';
}

export interface Kurssilainen {
  id: number,
  nimi: string;
  sposti: string;
  asema: string;
}

// Metodi: getQuestions, API: /api/kurssi/:kurssi-id/[kaikki|omat]/
// Tikettilistan näyttämistä varten.
export interface TiketinPerustiedot {
  id: string;
  otsikko: string;
  aikaleima: string;
  aloittaja: Kurssilainen;
  tila: number;
}

export interface SortableTicket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
  tilaID: number;
  tila: string;
}

/* Metodi: getTicketInfo. API /api/tiketti/:tiketti-id/[|kentat|kommentit]
  Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan
  eri vaiheessa omilla kutsuillaan.
  Backend palauttaa 1. kommentissa tiketin viestin sisällön, josta
  tulee jäsenmuuttujan "viesti" -sisältö. Vastaavasti 1. kommentin liitteet
  ovat tiketin liitteitä. */
export interface Tiketti extends TiketinPerustiedot {
  kurssi: number;
  viesti: string;
  ukk?: boolean;
  kentat?: Array<Kentta>;
  kommentit: Array<Kommentti>;
  liitteet?: Array<Liite>;
}

export interface Liite {
  kommentti: string;
  tiedosto: string;
  nimi: string;
}

// Metodi: getFAQ. API: /api/kurssi/:kurssi-id/ukk/
export interface UKK {
  id: number;
  otsikko: string;
  aikaleima: string;
  tila: number;
}

// Metodi: addTicket, API: /api/kurssi/:kurssi-id/uusitiketti/
export interface UusiTiketti {
  otsikko: string;
  viesti: string;
  kentat?: Array<{ id: number, arvo: string }>;
}

export interface AddTicketResponse {
  success: Boolean;
  uusi: {
    tiketti: string;
    kommentti: string;
  }
}

// Metodi: sendFaq. API: /api/kurssi/:kurssi-id/ukk/
export interface UusiUKK extends UusiTiketti {
  vastaus: string;
}

/* Tiketin lisäkenttä.
  Metodi: getTicketInfo -> getTickgetFields,
  API: /api/tiketti/:tiketti-id/kentat/
  Uusia propertyjä: tyyppi ja ohje.
  Palautustyypit tarkistettu 25.1.23. */
export interface Kentta {
  otsikko: string;
  arvo: string;
  tyyppi: string;
  ohje?: string;
}

/* Metodi: getTicketFieldInfo
  API: /api/kurssi/:kurssi-id/uusitiketti/kentat/,
  api/kurssi/:kurssi-id/tiketinkentat/
  id vapaaehtoinen, koska lähetettäessä sitä ei ole. */
export interface KentanTiedot {
  id?: string;
  otsikko: string;
  pakollinen: boolean;
  esitaytettava: boolean;
  ohje: string;
  valinnat: string[];
}

// Tiketin kommentti
// Metodi: getComments. API: /api/tiketti/:tiketti-id/kommentit/
// TODO: tiketin ja kommentin aikaleimojen tyypin voisi yhtenäistää.
export interface Kommentti {
  id: string;
  lahettaja: Kurssilainen;
  aikaleima: Date;
  tila: number;
  viesti: string;
  liitteet: Array<Liite>;
}

// Vastaus kommentin lisäämiseen.
export interface NewCommentResponse {
  success: boolean;
  kommentti: string;
}
