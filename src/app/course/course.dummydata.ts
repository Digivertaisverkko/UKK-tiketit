import { InvitedInfo, Kenttapohja } from "./course.models"

export class CourseDummyData {

  public get invitedInfo() {
    return {
      id: 2,
      kurssi: 1,
      sposti: 'marianna.laaksonen@example.com',
      vanhenee: '2023-08-23',
      rooli: 'opettaja',
    }
  }

  public get invitedInfoCourse2() {
    return {
      id: 2,
      kurssi: 2,
      sposti: 'marianna.laaksonen@example.com',
      vanhenee: '2023-08-23',
      rooli: 'opettaja',
    }
  }

  public get ticketFields() {
    return [
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
    ]
  }

}
