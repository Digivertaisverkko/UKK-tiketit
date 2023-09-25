import { InvitedInfo, Kenttapohja } from "./course.models"
/**
 * Testaamiseen käytettävää dummy dataa.
 *
 * @export
 * @class CourseDummyData
 */
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

  // settings.component.spec, course.service.spec
  public get ticketFieldInfo(): { kuvaus: string, kentat: Kenttapohja[] } {
    return {
      kuvaus: "Testikuvaus",
      kentat: this.ticketFieldFromsService
    }
  }

  // Servicelta tulevassa muodossa.
  public get ticketFieldFromsService(): Kenttapohja[] {
    return [
      {
        id: "1",
        otsikko: "Tehtävä",
        ohje: "Kirjoita tehtävän numero",
        esitaytettava: true,
        pakollinen: false,
        valinnat: [
          ""
        ]
      },
      {
        id: "2",
        otsikko: "Ongelman tyyppi",
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

  // Palvelimelta tulevassa muodossa.
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
