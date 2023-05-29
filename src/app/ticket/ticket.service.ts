/* Tämä service on käsittelee tiketteihin eli kysymyksiin liittyvää tietoa.
    UKK:t ovat tikettejä myöskin. Tikettipohjat ovat kurssin asetuksia ja
    niistä vastaavassa servicessä. */

import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders }
    from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, firstValueFrom, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../core/auth.service';
import { ErrorService } from '../core/error.service';
import { Role } from '../core/core.models';
import { AddTicketResponse, Kentta, Kommentti, NewCommentResponse, SortableTicket,
  TiketinPerustiedot, Tiketti, UKK, UusiTiketti, UusiUKK } from './ticket.models';
import { StoreService } from '../core/store.service';

interface GetTicketsOption {
  option: 'onlyOwn' | 'archived';
}

@Injectable({ providedIn: 'root' })

export class TicketService {

  private debug: boolean = false;

  constructor (
    private auth: AuthService,
    private errorService: ErrorService,
    private http: HttpClient,
    private store: StoreService
    ) {}

  // Lisää uusi kommentti tikettiin. Palauttaa true jos viestin lisääminen onnistui.
  public async addComment(ticketID: string, message: string, tila?: number):
      Promise<NewCommentResponse> {
    if (isNaN(Number(ticketID))) {
      throw new Error('Kommentin lisäämiseen tarvittava ticketID ei ole numero.')
    }
    if (tila !== undefined) {
      if (tila < 0 || tila > 6) {
        throw new Error('ticketService.addComment: tiketin tilan täytyy olla väliltä 0-6.');
      }
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
      this.store.setLoggedIn();
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  // Sama kuin alla, mutta ei uppaa tiedostoja.
  // editFaq: editoidaanko olemassa olevaa UKK:a.
  public async addFaq(ID: string, newFaq: UusiUKK, editFaq?: boolean) {
    let url = (editFaq?.toString() === 'true') ? `/tiketti/${ID}/muokkaaukk` :
        `/kurssi/${ID}/ukk`;
    url = environment.apiBaseUrl + url;
    let response: any;
    const body = newFaq;
    try {
      response = firstValueFrom(this.http.post<UusiUKK>(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return response
  }

  // Lisää tiketti ilman tiedostoja.
  public async addTicket(courseID: string, newTicket: UusiTiketti):
      Promise<AddTicketResponse> {
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

   // Arkistoi (poista) UKK.
  public async archiveFAQ(ticketID: number): Promise<{ success: boolean }> {
    let response: any;
    const url = `${environment.apiBaseUrl}/tiketti/${String(ticketID)}/arkistoiukk`;
    try {
      response = await firstValueFrom<{ success: boolean }>(
        this.http.post<{ success: boolean }>(url, {})
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Arkistoi tiketti.
  public async archiveTicket(ticketID: string): Promise<{ success: boolean }> {
    let response: any;
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/valmis`;
    try {
      response = await firstValueFrom<{ success: boolean }>(
        this.http.post<{ success: boolean }>(url, {})
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  public async editComment(ticketID: string, commentID: string, comment: string,
        state: number): Promise<boolean> {
    let response: any;
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/kommentti/${commentID}`;
    let body;
    if (state < 3 || state > 5) {
      console.error('Muokattavan Kommentin tila täytyy olla 3, 4 tai 5.');
      body = { viesti: comment }
    } else {
      body = { viesti: comment, tila: state }
    }
    try {
      // console.log(`Lähetetään ${JSON.stringify(body)} osoitteeseen ${url}`)
      response = await firstValueFrom(this.http.put(url, body));
    } catch (error: any) {
      this.handleError(error);
    }
    return (response?.success === true) ? true : false;
  }


  public async editTicket(ticketID: string, ticket: UusiTiketti, fileList?: File[]):
      Promise<boolean> {
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
  public getTicketState(numericalState: number, role: Role | ''): string {
    let string: string;
    switch (numericalState) {
      case 0: string = $localize`:@@Virhetila:Virhetila`; break;
      case 1:
        if (role === 'opettaja') {
          string = $localize`:@@Lukematon:Lukematon`;
        } else {
          string = $localize`:@@Lähetetty:Lähetetty`;
        }
        break;
      case 2: string = $localize`:@@Luettu:Luettu`; break;
      case 3: string = $localize`:@@Lisätietoa pyydetty:Lisätietoa pyydetty`; break;
      case 4: string = $localize`:@@Kommentoitu:Kommentoitu`; break;
      case 5: string = $localize`:@@Ehdotettu:Ehdotettu`; break;
      case 6: string = $localize`:@@Ratkaistu:Ratkaistu`; break;
      default:
        throw new Error('getTicketState: Tiketin tilan numeerinen arvo täytyy olla välillä 0-6.');
    }
    // Numero edessä, koska järjestetään taulukossa sen mukaan.
    string = numericalState + '-' + string;
    return string;
  }

  // Lähetä tiedosto palauttaen edistymistietoja.
  public uploadFile(ticketID: string, commentID: string, file: File): Observable<any>{
    let formData = new FormData();
    formData.append('tiedosto', file);
    const progress = new Subject<number>();
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/kommentti/${commentID}/liite`;
    // Virheiden testaukseen vaihda http.post -> fakeHttpPost
    // this.fakeHttpPost(url, formData, { reportProgress: true, observe: 'events' }, )
    this.http.post(url, formData, { reportProgress: true, observe: 'events' }, )
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total !== undefined) {
            const percentDone = Math.round(100 * event.loaded / event.total);
            progress.next(percentDone);
          } else if (event.type === HttpEventType.Response) {
            progress.complete();
          }
        },
        error: (error) => {
          console.error('ticketService.newUploadFile: saatiin virhe.');
          // this.handleError(error);
          progress.error(error);
        }
      })
    return progress.asObservable()
  }

  // Tiedoston lähetyksen testaamisessa voi http.post korvata tällä, niin saa virheitä.
  public fakeHttpPost(url?: any, formData?: any, options?: any): Observable<any> {
    const errorResponse = new HttpErrorResponse({
      error: 'File upload failed',
      status: 400,
      statusText: 'Bad Request',
    });
    const fakePost = new Observable(observer => {
      observer.error(errorResponse);
    })
    return fakePost
  }

  // Testaamista varten.
  public getError(x: any, y : any, z: any): Observable<any> {
    const errorResponse = new HttpErrorResponse({
      error: 'File upload failed',
      status: 400,
      statusText: 'Bad Request',
    });
    return of(errorResponse);
  }

  // Lähetä yksi liitetiedosto. Palauttaa, onnistuiko tiedoston lähettäminen.
  public async sendFile(ticketID: string, commentID: string, file: File): Promise<boolean> {
    let formData = new FormData();
    formData.append('tiedosto', file);
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

  // Lataa liitetiedosto.
  public async getFile(ticketID: string, commentID: string, fileID: string): Promise<Blob> {
    let url = environment.apiBaseUrl;
    url += `/tiketti/${ticketID}/kommentti/${commentID}/liite/${fileID}/lataa`;
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

  public async removeComment(ticketID: string, commentID: string) {
    let response: any;
    const url = `${environment.apiBaseUrl}/tiketti/${ticketID}/kommentti/${commentID}`;
    try {
      response = await firstValueFrom<{ success: boolean }>(
        this.http.delete<{ success: boolean }>(url, {})
      );
    } catch (error: any) {
      this.handleError(error);
    }
    return response;
  }

  // Poista tiketti.
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


  /*  Palauttaa listan tikettien tiedoista taulukkoa varten. Opiskelijalle itse
      lähettämät tiketit ja opettajalle kaikki kurssin tiketit. onlyOwn = true
      palauttaa ainoastaan itse luodut tiketit. */
  public async getTicketList(courseID: string, option?: GetTicketsOption) {
    const currentRoute = window.location.href;
    if (currentRoute.indexOf('/list-tickets') === -1) {
      return null
    }
    if (courseID === '') throw new Error('Ei kurssi ID:ä.');
    let target;
    switch (option?.option ?? '') {
      case 'onlyOwn':
        target = 'omat'; break;
      case "archived":
        target = "arkistoidut"; break;
      default:
        target = "kaikki"
    }
    let url = environment.apiBaseUrl + '/kurssi/' + String(courseID) + '/' + target;
    let response: any;
    try {
      response = await firstValueFrom(this.http.get<TiketinPerustiedot[]>(url));
    } catch (error: any) {
      this.handleError(error);
    }
    // Muutetaan taulukkoon sopivaan muotoon.
    const user = this.store.getUserInfo();
    const myName = user?.nimi ?? '';
    const myRole = user?.asema ?? '';
    const me = $localize`:@@Minä:Minä`;
    let sortableData: SortableTicket[] = response.map((ticket: TiketinPerustiedot) => (
      {
        tilaID: ticket.tila,
        tila: this.getTicketState(ticket.tila, myRole),
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
    // TODO: alla olevat kutsut voisi tehdä rinnakkain.
    response = await this.getFields(ticketID);
    ticket.kentat = response;
    response  = await this.getComments(ticketID);
    // Tiketin viestin sisältö on sen ensimmäinen kommentti.
    /// TODO: 1. kommentti ei välttämättä viittaa tikettiin aina, vaan pitäisi
    // ottaa aikaleiman mukaan vanhin.
    ticket.viesti = response[0].viesti;
    ticket.kommenttiID = response[0].id;
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
    this.errorService.handleServerError(error);
  }

}
