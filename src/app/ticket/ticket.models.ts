/* Tänne exportoitavat modelit, joita käytetään useammassa komponentissa
ja joita on tarkoitus käyttää tämän feature-moduulin sisällä.

  Rajapinnoissa on mainittu, missä metodissa sitä käytetään ja mitä palvelimen
  API:a se vastaa. Rajapintojen jäsenmuuttujien arvojen järjestys noudattaa
  API-dokumentin järjestystä. */

import { User } from "../core/core.models";

export interface AddTicketResponse {
  success: Boolean;
  uusi: {
    tiketti: string;
    kommentti: string;
  }
}

/* Tiketin lisäkenttä.
Metodi: getTicketInfo -> getTickgetFields,
API: /api/tiketti/:tiketti-id/kentat/
Uusia propertyjä: tyyppi ja ohje.
Palautustyypit tarkistettu 27.4.23. */
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
// TODO: tiketin ja kommentin aikaleimojen tyypin voisi yhtenäistää.
export interface Kommentti {
  id: string;
  lahettaja: User;
  aikaleima: Date;
  tila: number;
  viesti: string;
  liitteet: Array<Liite>;
}

export interface Liite {
  kommentti: string;
  tiedosto: string;
  nimi: string;
}

// Vastaus kommentin lisäämiseen.
export interface NewCommentResponse {
  success: boolean;
  kommentti: string;
}

export interface SortableTicket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
  tilaID: number;
  tila: string;
}

// Metodi: getQuestions, API: /api/kurssi/:kurssi-id/[kaikki|omat]/
// Tikettilistan näyttämistä varten.
export interface TiketinPerustiedot {
  id: string;
  otsikko: string;
  aikaleima: string;
  aloittaja: User;
  tila: number;
}

/* Metodi: getTicketInfo. API /api/tiketti/:tiketti-id/[|kentat|kommentit]
  Lisäkentät ja kommentit ovat valinnaisia, koska ne haetaan
  eri vaiheessa omilla kutsuillaan. Backend palauttaa 1. kommentissa tiketin
  viestin sisällön, josta tulee jäsenmuuttujan "viesti" -sisältö ja sen id:stä
  kommenttiID. Tätä tarvitaan mm.  Vastaavasti 1. kommentin liitteet
  ovat tiketin liitteitä. */
export interface Tiketti extends TiketinPerustiedot {
  kurssi: number;
  viesti: string;
  ukk?: boolean;
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
  aikaleima: string;
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
