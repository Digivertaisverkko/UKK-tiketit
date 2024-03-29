import { AuthDummyData } from "@core/services/auth.dummydata";
import { Role } from "@core/core.models";
import { Kentta, Kommentti, Liite, SortableTicket, Tiketti, TikettiListassa, UKK } from "./ticket.models";

/**
 * Dummy dataa testausta varten.
 * id arvot tulevat palvelimelta numeroina, mutta ne tallennetaan ja
 * käsitellään frontissa string:nä.
 *
 * @export
 * @class TicketDummyData
 */
export class TicketDummyData {

  readonly authDummyData = new AuthDummyData;


  public get kommentti(): Kommentti {
    return {
      id: '25',
      viesti: "<p>Testikommentti</p>",
      lahettaja: {
        id: 2,
        nimi: "Marianna Laaksonen",
        sposti: "marianna.laaksonen@example.com",
        asema: "opettaja"
      },
      aikaleima: new Date("2023-09-22T10:54:02.119Z"),
      tila: 4,
      muokattu: null,
      liitteet: [
        {
          kommentti: '25',
          tiedosto: "06734754-9af4-4597-869b-19da98f1a645",
          nimi: "testiliite.js",
          koko: 0
        }
      ]
    }
  }

  public get liitteet(): Liite[] {
    return [
      {
        kommentti: '23',
        tiedosto: 'eec5e8e3-0a11-4447-bd1f-60cf8c33aa3a',
        nimi: 'Tiedosto yksi',
        koko: 4818
      },
      {
        kommentti: '25',
        tiedosto: '7186f3fd-18f1-4965-b0a9-6cfab33f357d',
        nimi: 'Tiedosto kaksi',
        koko: 65818
      }
    ]
  }

  public get sortableTicketArray(): SortableTicket[]  {
    return [
      {
        tilaID: 3,
        tila: "3-Lisätietoa pyydetty",
        id: 3,
        kurssi: '1',
        otsikko: "”Index out of bounds”?",
        aikaleima: new Date("2023-06-21T09:37:36.124Z"),
        aloittajanNimi: "Piia Rinne",
        kentat: [
          {
            tiketti: 3,
            arvo: "2",
            otsikko: "Tehtävä"
          },
          {
            tiketti: 3,
            arvo: "Ongelma",
            otsikko: "Ongelman tyyppi"
          }
        ],
        liite: false,
        viimeisin: new Date("2023-06-21T09:37:36.142Z"),
        viimeisinStr: "21.6."
      },
      {
        tilaID: 4,
        tila: "4-Kommentoitu",
        id: 4,
        kurssi: '1',
        otsikko: "Ohjelma tulostaa numeroita kirjainten sijasta!",
        aikaleima: new Date("2023-06-22T09:37:36.125Z"),
        aloittajanNimi: "Esko Seppä",
        kentat: [
          {
            tiketti: 4,
            arvo: "2",
            otsikko: "Tehtävä"
          },
          {
            tiketti: 4,
            arvo: "Kurssin suoritus",
            otsikko: "Ongelman tyyppi"
          }
        ],
        liite: true,
        viimeisin: new Date("2023-06-22T09:37:36.142Z"),
        viimeisinStr: "22.6."
      }
    ]
  }

  public get archivedTicketArray(): TikettiListassa[]  {
    return [
      {
        id: "1",
        kurssi: 1,
        otsikko: "Kotitehtävä ei käänny",
        aikaleima: new Date("2023-09-08T04:48:23.549Z"),
        aloittaja: {
          id: 1,
          nimi: "Esko Seppä",
          sposti: "esko.seppa@example.com",
          asema: "opiskelija"
        },
        ukk: false,
        tila: 6,
        kentat: [
          {
            tiketti: 1,
            arvo: "1",
            otsikko: "Tehtävä"
          },
          {
            tiketti: 1,
            arvo: "Ongelma",
            otsikko: "Ongelman tyyppi"
          }
        ],
        viimeisin: "2023-09-16T04:48:23.672Z",
        liite: false
      }
    ]
  }

  public get tiketti(): Tiketti {
    return {
      arkistoitava: true,
      id: '4',
      otsikko: "Ohjelma tulostaa numeroita kirjainten sijasta!",
      aikaleima: new Date("2023-06-21T09:37:36.124Z"),
      aloittaja: {
        asema: "opiskelija" as Role,
        id: 1,
        nimi: "Esko Seppä",
        sposti: "esko.seppa@example.com",
      },
      kentat: [
        {
          arvo: "2",
          esitaytettava: false,
          id: "1",
          ohje: "Kirjoita tehtävän numero",
          otsikko: "Tehtävä",
          pakollinen: true,
          tyyppi: '1',
          valinnat: []
        },
        {
          arvo: "Kurssin suoritus",
          esitaytettava: false,
          id: "2",
          ohje: "",
          otsikko: "Ongelman tyyppi",
          pakollinen: true,
          tyyppi: '1',
          valinnat: []
        }
      ],
      kommentit: [],
      kommenttiID: '8',
      kurssi: 1,
      liitteet: [],
      tila: 4,
      ukk: false,
      viesti: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }
  }

  public get tiketti3() {
    return {
      id: 3,
      otsikko: "”Index out of bounds”?",
      aikaleima: "2023-06-21T09:37:36.124Z",
      aloittaja: {
        id: 3,
        nimi: "Piia Rinne",
        sposti: "piia.rinne@example.com",
        asema: "opiskelija"
      },
      tila: 3,
      kurssi: 1,
      ukk: false,
      arkistoitava: false
    }
  }

  public get tiketti3KenttaArray(): Kentta[] {
    return [
      {
        id: '1',
        arvo: "2",
        otsikko: "Tehtävä",
        tyyppi: '1',
        ohje: "",
        esitaytettava: false,
        pakollinen: true,
        valinnat: [
          ""
        ]
      },
      {
        id: '2',
        arvo: "Ongelma",
        otsikko: "Ongelman tyyppi",
        tyyppi: '1',
        ohje: "",
        esitaytettava: false,
        pakollinen: true,
        valinnat: [
          "Kotitehtävä",
          "Määräajat",
          "Yleinen"
        ]
      }
    ]
  }

  public get ticketProperties() {
    return [
      'id',
      'otsikko',
      'aikaleima',
      'aloittaja',
      'tila',
      'kurssi',
      'ukk',
      'arkistoitava',
      'kentat',
      'kommenttiID',
      'viesti',
      'liitteet',
      'kommentit'
    ]
  }

  public get tiketti3kommentit() {
    return [
      {
        id: 7,
        viesti: "Lorem ipsum dolor sit amet.",
        lahettaja: {
          id: 3,
          nimi: "Piia Rinne",
          sposti: "piia.rinne@example.com",
          asema: "opiskelija"
        },
        aikaleima: "2023-06-21T09:37:36.142Z",
        tila: 2,
        muokattu: null,
        liitteet: []
      }
    ]
  }

  public get UKKarray(): UKK[] {
    return [
      {
        id: 7,
        otsikko: 'UKK kysymys',
        aikaleima: new Date("2023-06-21T09:37:36.124Z"),
        aikaleimaStr: '21.6.',
        tila: 2,
        kentat: [
          {
            tiketti: 7,
            arvo: "2",
            ohje: "",
            otsikko: "Tehtävä",
            tyyppi: 1
          },
          {
            tiketti: 7,
            arvo: "Aikataulu",
            ohje: "",
            otsikko: "Ongelman tyyppi",
            tyyppi: 1,
          }
        ]
      }
    ]
  }

  public get ukk(): Tiketti {
    const faq: Tiketti = this.tiketti;
    faq.ukk = true;
    faq.tila = 2;
    faq.kommentit = [{
      id: '14',
      tila: 1,
      lahettaja: this.authDummyData.userInfoTeacher,
      aikaleima: new Date("2023-06-21T09:37:36.124Z"),
      muokattu: null,
      viesti: "Vastaus kysymykseen",
      liitteet: []
    }]
    return faq
  }

}
