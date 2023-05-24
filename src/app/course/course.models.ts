import { Role } from "../core/core.models";

/* Tiketin lisäkentän tiedot sisältävä kenttäpohja.
  Metodi: getTicketFieldInfo
  API: /api/kurssi/:kurssi-id/uusitiketti/kentat/,
  api/kurssi/:kurssi-id/tiketinkentat/
  id vapaaehtoinen, koska lähetettäessä sitä ei ole. */
  export interface Kenttapohja {
    id?: string;
    otsikko: string;
    pakollinen: boolean;
    esitaytettava: boolean;
    ohje: string;
    valinnat: string[];
  }

// Metodi: getMyCourses, API: /api/kurssi/omatkurssit/
export interface Kurssini {
  kurssi: number;
  asema: Role;
}
