import { Role } from "@core/core.models";

/* id arvot tulevat palvelimelta numeroina, mutta ne tallennetaan
   ja käsitellään frontissa string:nä. */

export const ticketDummyData = {

  LiiteArray: [
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
  ],

  ticketListServerData:
  [
    {
      id: 3,
      kurssi: 1,
      otsikko: "”Index out of bounds”?",
      aikaleima: "2023-06-21T09:37:36.124Z",
      aloittaja: {
        id: 3,
        nimi: "Piia Rinne",
        sposti: "piia.rinne@example.com",
        asema: "opiskelija"
      },
      ukk: false,
      tila: 3,
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
      viimeisin: "2023-06-21T09:37:36.142Z",
      liite: false
    },
    {
      id: 4,
      kurssi: 1,
      otsikko: "Ohjelma tulostaa numeroita kirjainten sijasta!",
      aikaleima: "2023-06-22T09:37:36.125Z",
      aloittaja: {
        id: 1,
        nimi: "Esko Seppä",
        sposti: "esko.seppa@example.com",
        asema: "opiskelija"
      },
      ukk: false,
      tila: 4,
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
      viimeisin: "2023-06-22T09:37:36.142Z",
      liite: false
    }
  ],

  ticketListClientData:
  [
    {
      tilaID: 3,
      tila: "3-Lisätietoa pyydetty",
      id: 3,
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
      liite: false,
      viimeisin: new Date("2023-06-22T09:37:36.142Z"),
      viimeisinStr: "22.6."
    }
  ],

  ticket3: {
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
  },

  ticket3KenttaArray: [
    {
      id: 1,
      arvo: "2",
      otsikko: "Tehtävä",
      tyyppi: 1,
      ohje: "",
      esitaytettava: false,
      pakollinen: true,
      valinnat: [
        ""
      ]
    },
    {
      id: 2,
      arvo: "Ongelma",
      otsikko: "Ongelman tyyppi",
      tyyppi: 1,
      ohje: "",
      esitaytettava: false,
      pakollinen: true,
      valinnat: [
        "Kotitehtävä",
        "Määräajat",
        "Yleinen"
      ]
    }
  ],

  ticket3comments: [
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
  ],

  ticketProperties: [
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
  ],

  UKKarray: [
    {
      id: 7,
      otsikko: 'UKK kusymys',
      aikaleima: new Date("2023-06-21T09:37:36.124Z"),
      aikaleimaStr: '21.6.',
      tila: 2,
      kentat: [
        {
          arvo: "2",
          ohje: "",
          otsikko: "Tehtävä",
          tiketti: 7,
          tyyppi: 1
        },
        {
          arvo: "Aikataulu",
          ohje: "",
          otsikko: "Ongelman tyyppi",
          tiketti: 7,
          tyyppi: 1,
        }
      ]
    }
  ],

  ticket: {
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
