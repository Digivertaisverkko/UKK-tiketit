# Järjestelmän kuvaus

Tämän kuvauksen ymmärtämiseksi olisi hyvä tuntea perustiedot Angularin
yleisistä käsitteistä, kuten moduuli (*module tai ngModule*), komponentti
(*component*), *template* ja *service*.  Näistä voi lukea esimerkiksi [Angularin virallisesta dokumentaatiosta](https://angular.io/guide/understanding-angular-overview). Tiedostojen nimissä käytetään [Angularin suosituksia](https://angular.io/guide/styleguide#naming).

## Moduulit

Sovellus koostuu erilaisista moduuleista. Moduulit puolestaan sisältävät mm. eri komponentteja.

Sisältävät tyypillisesti seuraavat tiedostot:
*.module.ts. - Moduulin asetukset lukuunottamatta routing-asetuksia.
*.module.routing.ts - Routing -asetukset.
*.models.ts - Moduulissä käytettyjä modeleja, tyypillisesti rajapintoja.
*.service.ts - Moduulissa käytetty service.
.spec.ts - Jasmine -automaattitestit.
dummydata.ts - Testien käyttämää dummydataa.

Tämä sovellus koostuu app ja core moduuleista sekä eri feature-moduuleista:

- **app.module**
  - Sovelluksen päämoduuli. Sisältää juurikomponentin AppComponent, joka toimii sovelluksen näkymän perustana. 
  - Määritellään kaikki muut moduulit.
  - Otetaan käynnistyksessä käyttöön haluttu kieli funktiolla *initializeLanguage*.

- **core.module**
  - Sovelluksen ydintoiminnallisuus.
  - Yleisiä komponentteja, kuten header ja footer.
  - Yleisiä näkymiä ja virhenäkymiä.
  - Monia yleiskäyttöisiä servicejä, kuten auth.service.

- **Feature -moduulit**
  
  Nämä ovat tapa ryhmitellä toisiinsa liittyvää toiminnallisuutta. Jokainen moduuli shared.modulea lukuunottamatta sisältää niiden toiminnallisuudesta vastaavan servicen sekä routing määrittelyt tiedostoissa *.routing.module.ts.

  - **ticket.module**
    - Sisältää tiketteihin eli kysymyksiin liittyviä ominaisuuksia.

  - **user.module**
    - Sisältää käyttäjiin liittyviä ominaisuuksia.

  - **course.module**
    - Sisältää kursseihin liittyviä ominaisuuksia.

  - **shared.module**
    - Omainaisuuksia, joita on käytössä useissa eri feature-moduuleissa.

  ## Komponentit
  
  Tähän komponenteista.

  ## Servicet

  Tähän serviceistä.

  ## Teema ja tyylit

  Sovellus käyttää tyylien määrittelyyn SASS-kirjastoa ja sen Sassy CSS eli SCSS -määrittelytapaa. Tyylit ovat .scss -tiedostoissa. Sovellus käyttää *Angular Material* -kirjastoa ja kustomoitua teemaa, jonka tyyliasetukset ovat tiedostossa *src/styles/custom-theme.scss*. Globaalit tyylimäärittelyt ovat tiedostossa *src/styles.scss*. Täällä määrittelyt css -classien nimet ovat tyypillisesti ".theme-" -alkuisia. Suurin osa tyyleistä on määritelty komponenteissa .scss -tiedostoissa.
  
  ## Muut tiedostot

  *src/assets* sisältää hakemistot ikoneille ja logoille sekä käännöstiedoston en-US.json. Käännökset ovat muodossa:
  ```"Suomenkielinen käännösavain": "Englanninkielinen käännös"```
  Suomenkielinen teksti on komponenttien templateissa. Käännös haetaan käännösavaimeen viittaamalla. Käännös tehdäään ajonaikaisesti. Käännöksen vaihtaminen ajon aikana aiheuttaa sovelluksen uudelleenkäynnistyksen.