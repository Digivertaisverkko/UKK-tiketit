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