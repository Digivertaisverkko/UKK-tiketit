import { LoginInfo, Role, User } from "@core/core.models"

export class AuthDummyData {

  public get loginInfo(): LoginInfo {
    return {
    "login-url": "course/1/login?loginid=d7cda27a-cc58-4825-b2ee-5f1df71072d8",
    "login-id": "d7cda27a-cc58-4825-b2ee-5f1df71072d8"
    }
  }

  public get minunOpettaja(): User {
    return {
    id: 2,
    nimi: "Marianna Laaksonen",
    sposti: "marianna.laaksonen@example.com",
    asema: null
    }
  }

  public get oikeudetOpettaja() {
    return {
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
    }
  }

  public get userInfoEsko(): User {
    return {
      id: 1,
      nimi: "Esko Seppä",
      sposti: "esko.seppa@example.com",
      asema: "opiskelija" as Role,
      asemaStr: "Opiskelija"
    }
  }

  public get userInfoRinne() {
    return {
    id: 3,
    nimi: "Piia Rinne",
    sposti: "piia.rinne@example.com",
    asema: "opiskelija" as Role,
    asemaStr: "Opiskelija"
    }
  }

  public get userInfoTeacher() {
    return {
    id: 2,
    nimi: "Marianna Laaksonen",
    sposti: "marianna.laaksonen@example.com",
    asema: "opettaja" as Role,
    asemaStr: "Opettaja"
    }
  }
}
