import { Role } from "@core/core.models"

export const authDummyData = {
  oikeudetOpettaja: {
    oikeudet: {
      id: 2,
      nimi: "Marianna Laaksonen",
      sposti: "marianna.laaksonen@example.com",
      asema: "opettaja"
    },
    login: {
      lti_login: false,
      perus: true
    }
  },

  userInfoTeacher: {
    id: 2,
    nimi: "Marianna Laaksonen",
    sposti: "marianna.laaksonen@example.com",
    asema: "opettaja" as Role,
    asemaStr: "Opettaja"
  },

  minunOpettaja: {
    id: 2,
    nimi: "Marianna Laaksonen",
    sposti: "marianna.laaksonen@example.com",
    asema: null
  }
}
