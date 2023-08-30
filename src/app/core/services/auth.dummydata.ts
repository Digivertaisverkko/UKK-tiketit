import { Role } from "@core/core.models"

export const authDummyData = {

  loginInfo: {
    "login-url": "course/1/login?loginid=d7cda27a-cc58-4825-b2ee-5f1df71072d8",
    "login-id": "d7cda27a-cc58-4825-b2ee-5f1df71072d8"
  },

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

  userInfoEsko: {
      id: 1,
      nimi: "Esko Seppä",
      sposti: "esko.seppa@example.com",
      asema: "opiskelija" as Role,
      asemaStr: "Opettaja"
  },

  minunOpettaja: {
    id: 2,
    nimi: "Marianna Laaksonen",
    sposti: "marianna.laaksonen@example.com",
    asema: null
  }
}
