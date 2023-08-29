export const courseDummyData = {
  fields:  [
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

  invitedInfo: {
    id: 2,
    kurssi: 1,
    sposti: 'marianna.laaksonen@example.com',
    vanhenee: '2023-08-23',
    rooli: 'opettaja',
  },

  ticketFields: [
    {
      id: 1,
      otsikko: "Tehtävä",
      tyyppi: 1,
      ohje: "Kirjoita tehtävän numero",
      esitaytettava: true,
      esitaytto: 'Tehtävä 3',
      pakollinen: false,
      valinnat: [
        ""
      ]
    },
    {
      id: 2,
      otsikko: "Ongelman tyyppi",
      tyyppi: 1,
      ohje: "",
      esitaytettava: false,
      pakollinen: false,
      valinnat: [
        "Kotitehtävä",
        "Määräajat",
        "Yleinen"
      ]
    }
  ],
}
