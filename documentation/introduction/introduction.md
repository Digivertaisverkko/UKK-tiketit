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

Sovellus koostuu eri moduuleista. App.module on hakemistossa **/src/app**, jossa
on alihakemistot muille moduuleille.
Moduulit sisältävät tyypillisesti seuraavat tiedostot:

- *.module.ts. - Moduulin asetukset lukuunottamatta reitityksen määrittelyjä.
- *.module.routing.ts - Moduulin tarjoamia reitityksen määrittelyjä.
- *.models.ts - Moduulissä käytettyjä malleja, tyypillisesti rajapintoja.
- *.service.ts - Moduulissa käytetty service.
- *.spec.ts - Automaattitestejä.
- *.dummydata.ts - Testien käyttämää dataa.
- Komponentteja, jotka ovat omissa alihakemistoissaan.

Sovellus koostuu seuraavista moduuleista:

 **app.module**
  - Sovelluksen päämoduuli, jossa määritellään kaikki muut moduulit.
  - Sisältää juurikomponentin AppComponent, joka toimii sovelluksen näkymän perustana. 

 **core.module**
  - Sovelluksen ydintoiminnallisuus.
  - Sisältää yleisiä...
    - komponentteja, kuten header ja footer.
    - näkymiä, kuten *home* tai tietojenkäyttösuostumus
    - virhenäkymiä, kuten *Ei oikeuksia* ja *404*.
    - servicejä, kuten auth.service ja error.service.
  - Lisäksi
    - http-interceptor.ts, joka logittaa HTTP-kutsuja.

 **Feature -moduulit**
  
  Muu sovelluksen toiminnallisuus on ryhmitelty näihin moduuleihin. Jokainen moduuli shared.modulea lukuunottamatta sisältää niiden toiminnallisuudesta vastaavan servicen sekä
  reitityksen määrittelyt.

  - **ticket.module** - Tiketteihin eli kysymyksiin liittyviä ominaisuuksia.

  - **user.module** - Käyttäjiin liittyviä ominaisuuksia.

  - **course.module** - Kursseihin liittyviä ominaisuuksia.

  - **shared.module** - Omainaisuuksia, joita on käytössä useissa eri feature-moduuleissa.

## Komponentit

Kukin komponentti vastaa tietystä käyttöliittymän osasta. Se voi olla tiettyyn
reittiin sidottu näkymä tai rajatumpi käyttöliittymän osa, kuten header tai
tiketin kommentti. Komponentit voivat sisältää muita komponentteja. Komponentit kuuluvat johonkin moduuliin, sijaitsevat moduulissa omassa hakemistossaan ja sisältävät yleensä seuraavat tiedostot:

- *.component.html - Komponentin template, jonka mukaan komponentin näkymä renderöidään. 
- *.component.ts - Komponentin määrittelyt sekä sen TypeScript -luokka, joka käsittelee näkymässä tarvittavaa logiikkaa. Muu logiikka injektoidaan serviceinä.
- *.component.scss - Templatessa käytetyt SCSS/SASS -tyylimäärittelyt.
- *.component.spec.ts - Komponentin Jasmine -testit.


## Servicet

Sisältävät toiminnallisuuksia, jotka eivät suoraan liity näytettään käyttöliittymään. Kaikki yhteydenpito backendiin tapahtuu serviceissä. Yleiset servicet ovat hakemistossa **/src/app/core/services**, joiden lisäksi feature-moduuleilla on kullakin omansa shared.modulea lukuunottamatta. Servicet ovat *.service.ts -tiedostoissa. Samassa hakemistossa on myös vastaava
*.service.spec.ts - tiedosto, jossa on servicen testit.

### Eri servicet ja ja niiden vastuualueet

**auth.service**

Käyttäjäautentikaatioon liittyvät toiminnot, kuten
käyttäjien kirjautuminen ja kirjautumiseen liittyvien tietojen käsittely.

**store.service**

Komponentit ja servicet tallentavat ja palauttavat muistissa olevia  muuttujia tänne. Sisältää myös vakioita. Tämä tila haetaan uudestaan näkymiä vaihdettassa eikä tallenneta sessioiden välilä. Sessioiden yli säilyvää tila tallennetaan local storageen. Komponenttien ja niiden lapsien tai vanhempien välinen tiedonvaihto käydään suoraan niiden välillä. Tällä servicellä voidaan välittää tieto minkä tahansa komponenttien ja serviceiden välillä.

 **error.service**

Serviceissä tapahtuvat virheet ohjataan ensin tänne, jossa ne logitetaan console.log:lla. *403* eli *ei oikeuksia* -virhetilanteissa reititetäänä täältä sitä vastaavaan virhenäkymään. Virheet heitetään uudelleen, jolloin komponentit voivat napata ne ja esittää ne tarvittaessa käyttäjälle tai tehdä muita toimia. Servicellä on mahdollista myös testausta varten generoida virheitä. HTTP-kutsuja logittaa *http-interceptor*.

**utils.service**

Yleishyödyllisiä funktioita, jotka eivät suoraan liity toisten serviceiden vastuualueeseen.

Feature-moduulien servicet:

**ticket.service**

Käsittelee tiketteihin eli kysymyksiin liittyviä toiminnallisuuksia, kuten tikettien ja niiden kommenttien ja liitetiedostojen käsittely.

**course.service**

Käsittelee kursseihin liittyviä toiminnallisuuksia, kuten kurssienhakeminen, tikettipohjien käsittely ja kurssien tietojen tuonti ja vienti tiedostoiksi.

**user.service**


## Teema ja tyylit

Sovellus käyttää *Angular Material* -kirjaston kustomoitua teemaa, jonka määrittelyt ovat tiedostossa **src/styles/custom-theme.scss**. Globaalit tyylimäärittelyt ovat tiedostossa **src/styles.scss**. Se sisältää kaikkialla sovelluksessa käytettyjä CSS -luokkia, joiden nimet ovat **.theme-** -alkuisia. Komponenttikohtaiset tyylit ovat määritelty komponenttien
**.component.scss** -tiedostoissa. Jos tyyli koskee vain tiettyä tai tiettyjä komponenttia,
tulisi niiden määrittely tehdä näissä tiedostoissa. 

## Kieli ja käännökset

Angularissa käännökset voidaan tehdä build-aikana tai ajonaikaisesti. Tässä sovelluksessa
noudatetaan jälkimmäistä tapaa. Käännöksen vaihtaminen ajon aikana aiheuttaa aina
sovelluksen uudelleenkäynnistyksen. Kieli haetaan ja alustetaan ohjelman käynnistyessä tiedostossa **src/app/app.initializers.ts**. Englanninkieliset käännökset sijaitsevat
tiedostossa **src/assets/en-US.json**. Käännökset ovat muodossa:

  ```"Suomenkielinen käännösavain": "Englanninkielinen käännös"```

Suomenkielinen, alkuperäinen teksti on komponenttien templateissa. Käännös haetaan käännösavaimeen viittaamalla. 

## Muita tiedostoja ja hakemistoja

- **/src/assets** - Kuvat, logot ja käännökset. Favicon.icon on puolestaan juurihakemistossa.
- **index.html** - Fonttien ja faviconin osoitteet.
