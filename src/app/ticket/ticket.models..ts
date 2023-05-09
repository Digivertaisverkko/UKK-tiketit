// Tänne exportoitavat modelit, joita on tarkoitus käyttää tämän feature -
// moduulin sisällä.
import { User } from "../core/core.models";

export interface AddTicketResponse {
  success: Boolean;
  uusi: {
    tiketti: string;
    kommentti: string;
  }
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
