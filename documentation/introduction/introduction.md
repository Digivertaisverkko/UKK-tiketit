# Järjestelmän kuvaus

Tämä ohje pyrkii antamaan yleisen kuvauksen Tukki-järjestelmän frontendistä ohjelman ylläpitäjälle. 
Tämän kuvauksen ymmärtämiseksi olisi hyvä tuntea perustiedot Angularin
yleisistä käsitteistä, kuten *moduuli* (*module* tai *ngModule*), 
*komponentti* (*component*), *template* ja *service*.  Näistä voi lukea esimerkiksi [Angularin virallisesta dokumentaatiosta](https://angular.io/guide/architecture). Tiedostojen nimissä käytetään [Angularin suosituksia](https://angular.io/guide/styleguide#naming).

## Tekniikat

Tämän frontendin tekemisessä käytettyjä tekniikoita. Suurin osa näistä tulee Angularin mukana.

- Angular Framework. Tätä kirjoittaessa versio 16.
- HTML - Templatien määrittely.
- SASS/SCSS - CSS:n esikäsittelykieli, jolla tehdyt tyylitiedostot kääntyvät CSS:ksi.
- TypeScript - JavaScriptin superset tyyppimäärityksillä.
- RxJS - Kirjasto reaktiivisen ohjelmoinnin toteuttamiseen käyttäen observableja.
- Angular Material - Komponenttikirjasto käyttöliittymäelementteille.
- Angular Router - Reititys ja navigointi.
- Angular HTTP Client - Kirjasto HTTP-pyyntöjen käsittelyyn.
- Angular CLI - Komentorivityökalu.
- Angular Reactive Forms - Reaktiivisten lomakkeiden tekemiseen.
- Ngx-editor - Rich-text editori -komponentti.
- Npm - Riippuvuuksien hallintaan.
- Jasmine - Testaus framework yksikkötesteillle.
- Karma - Testien suoritusympäristö, joka toimii Jasminen kanssa.
- Git - versionhallinta.
- ESLint - Staattinen koodinanalyysi.

## Moduulit

Sovellus koostuu eri moduuleista. Moduulit puolestaan sisältävät mm. eri komponentteja.
Moduulien hakemistot sijaitsevat hakemistossa **src/app**. Moduulit sisältävät tyypillisesti seuraavat tiedostot:

- *.module.ts. - Moduulin asetukset lukuunottamatta reitityksen määrittelyjä.
- *.module.routing.ts - Moduulin tarjoamia reitityksen määrittelyjä.
- *.models.ts - Moduulissä käytettyjä malleja, tyypillisesti rajapintoja.
- *.service.ts - Moduulissa käytetty service.
- *.spec.ts - Automaattitestejä.
- *.dummydata.ts - Testien käyttämää dataa.

Komponentit ovat moduulien alihakemistoissa. Sovellus koostuu seuraavista moduuleista:

- **app.module**
  - Sovelluksen päämoduuli. Sisältää juurikomponentin AppComponent, joka toimii sovelluksen näkymän perustana. 
  - Määritellään kaikki muut moduulit.

- **core.module**
  - Sovelluksen ydintoiminnallisuus.
  - Yleisiä komponentteja, kuten header ja footer.
  - Yleisiä näkymiä ja virhenäkymiä.
  - Monia yleiskäyttöisiä servicejä, kuten auth.service.

- **Feature -moduulit**
  
  Ryhmittelevät toisiinsa liittyvää toiminnallisuutta. Jokainen moduuli shared.modulea lukuunottamatta sisältää niiden toiminnallisuudesta vastaavan servicen sekä
  reitityksen määrittelyt.

  - **ticket.module** - Tiketteihin eli kysymyksiin liittyviä ominaisuuksia.

  - **user.module** - Käyttäjiin liittyviä ominaisuuksia.

  - **course.module** - Kursseihin liittyviä ominaisuuksia.

  - **shared.module** - Omainaisuuksia, joita on käytössä useissa eri feature-moduuleissa.

## Komponentit

Tähän komponenteista.

## Servicet

Tähän serviceistä.

## Teema ja tyylit

Sovellus käyttää *Angular Material* -kirjaston kustomoitua teemaa, jonka määrittelyt ovat tiedostossa **src/styles/custom-theme.scss**. Globaalit tyylimäärittelyt ovat tiedostossa **src/styles.scss**. Siellä on määrittelty kaikkialla sovelluksessa käytettyjä CSS -luokkia, joiden nimet ovat **.theme-** -alkuisia. Komponenttikohtaiset tyylit ovat määritelty komponenttien
*.component.scss -tiedostoissa. Jos tyyli koskee vain tiettyä tai tiettyjä komponenttia,
pitäisi niiden määrittely tehdä näissä tiedostoissa. 

## Kieli ja käännökset

Angularissa käännökset voidaan tehdä build-aikana tai ajonaikaisesti. Tässä sovelluksessa
noudatetaan jälkimmäistä tapaa. Käännöksen vaihtaminen ajon aikana aiheuttaa aina
sovelluksen uudelleenkäynnistyksen. Kieli haetaan ja alustetaan ohjelman käynnistyessä tiedostossa **src/app/app.initializers.ts**. Englanninkieliset käännökset sijaitsevat
tiedostossa **src/assets/en-US.json**. Käännökset ovat muodossa:

  ```"Suomenkielinen käännösavain": "Englanninkielinen käännös"```

Suomenkielinen, alkuperäinen teksti on komponenttien templateissa. Käännös haetaan käännösavaimeen viittaamalla. 

## Muita tiedostoja

- **/src/assets** - Kuvat, logot ja käännökset.
- **index.html** - Fonttien ja faviconin osoitteet.
