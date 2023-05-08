// Tänne exportoitavat modelit, joita on tarkoitus käyttää tämän feature -
// moduulin sisällä.

export interface AddTicketResponse {
  success: Boolean;
  uusi: {
    tiketti: string;
    kommentti: string;
  }
}
export interface Liite {
  kommentti: string;
  tiedosto: string;
  nimi: string;
}

// Metodi: addTicket, API: /api/kurssi/:kurssi-id/uusitiketti/
export interface UusiTiketti {
  otsikko: string;
  viesti: string;
  kentat?: Array<{ id: number, arvo: string }>;
}

// Metodi: sendFaq. API: /api/kurssi/:kurssi-id/ukk/
export interface UusiUKK extends UusiTiketti {
  vastaus: string;
}