import { Role } from "../core/core.models";

// Metodi: getInvitedInfo
// API: /api/kurssi/:kurssi-id/osallistujat/kutsu/:kutsu-id
export interface InvitedInfo {
  id: string;
  kurssi: string;
  sposti: string;
  vanhenee: string;
  rooli: Role;
}

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
