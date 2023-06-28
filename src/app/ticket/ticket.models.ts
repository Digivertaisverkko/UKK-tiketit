/* Tänne exportoitavat modelit, joita käytetään useammassa komponentissa
ja joita on tarkoitus käyttää tämän feature-moduulin sisällä.

  Rajapinnoissa on mainittu, missä metodissa sitä käytetään ja mitä palvelimen
  API:a se vastaa. Rajapintojen jäsenmuuttujien arvojen järjestys noudattaa
  API-dokumentin järjestystä. */

import { User } from "@core/core.models";

export interface AddTicketResponse {
  success: Boolean;
  uusi: {
    tiketti: string;
    kommentti: string;
  }
}

// 'error' tarkoittaa virhettä tiedoston valitsemisvaiheessa, uploadError
// lähetysvaiheessa. Käytetään liitetiedostoja lisättäessä.
export interface FileInfo {
  filename: string;
  file: File;
  error?: string;
  errorToolTip?: string;
  progress?: number;
  uploadError?: string;
  done?: boolean;
}

/* Tiketin lisäkenttä.
Metodi: getFields
API: /api/tiketti/:tiketti-id/kentat/ */
export interface Kentta {
  id: string;
  otsikko: string;
  arvo: string;
  tyyppi: string;
  ohje: string;
  pakollinen: boolean;
  esitaytettava: boolean;
  valinnat: string[];
}

// Tiketin kommentti
// Metodi: getComments. API: /api/tiketti/:tiketti-id/kommentit/
export interface Kommentti {
  id: string;
  lahettaja: User;
  aikaleima: Date;
  muokattu: Date;
  tila: number;
  viesti: string;
  liitteet: Array<Liite>;
}

export interface Liite {
  kommentti: string;
  tiedosto: string;
  nimi: string;
  koko: number;
}

// Vastaus kommentin lisäämiseen.
export interface NewCommentResponse {
  success: boolean;
  kommentti: string;
}

export interface SortableTicket {
  id: number;
  otsikko: string;
  aikaleima: Date;
  aloittajanNimi: string
  tilaID: number;
  tila: string;
  liite?: boolean;
  kentat: [{
    tiketti: string;
    arvo: string;
    otsikko: string;
  }]
}

// Käytetään pohjana muihin interfaceihin.
interface Tikettipohja {
  id: string;
  otsikko: string;
  aikaleima: Date;
  aloittaja: User;
  tila: number;
  ukk: boolean;
}

// Metodi: getTicketList, API: /api/kurssi/:kurssi-id/[kaikki|omat]/
// Tikettilistan näyttämistä varten.
export interface TikettiListassa extends Tikettipohja {
  viimeisin: string;
  liite?: boolean;
  kentat: [{
    tiketti: number;
    arvo: string;
    otsikko: string;
  }]
}

/* Metodi: getTicketInfo. API /api/tiketti/:tiketti-id/[|kentat|kommentit]
  Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan
  eri vaiheessa omilla kutsuillaan. Backend palauttaa 1. kommentissa tiketin
  viestin sisällön, josta tulee jäsenmuuttujan "viesti" -sisältö ja sen id:stä
  kommenttiID. Tätä tarvitaan mm.  Vastaavasti 1. kommentin liitteet
  ovat tiketin liitteitä. */
export interface Tiketti extends Tikettipohja {
  kurssi: number;
  viesti: string;
  arkistoitava: boolean;
  kentat?: Array<Kentta>;
  kommenttiID: string;
  kommentit: Array<Kommentti>;
  liitteet?: Array<Liite>;
}

// Metodi: getFAQ. API: /api/kurssi/:kurssi-id/ukk/
export interface UKK {
  id: number;
  otsikko: string;
  aikaleima: Date;
  tila: number;
}

// Metodi: addTicket, API: /api/kurssi/:kurssi-id/uusitiketti/
export interface UusiTiketti {
  otsikko: string;
  viesti: string;
  kentat?: Array< { id: number, arvo: string } >;
}

// Metodi: sendFaq. API: /api/kurssi/:kurssi-id/ukk/
export interface UusiUKK extends UusiTiketti {
  vastaus: string;
}
