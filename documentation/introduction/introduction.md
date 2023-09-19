# Järjestelmän kuvaus

Tämä ohje pyrkii antamaan yleisen kuvauksen Tukki-järjestelmän web-käyttöliittymän eli frontendin arkkitehtuurista ohjelman ylläpitäjälle. 
Tämän kuvauksen ymmärtämiseksi olisi hyvä tuntea perustiedot Angularin
yleisistä käsitteistä, kuten *moduuli* (*module* tai *ngModule*), 
*komponentti* (*component*), *template* ja *service*.  Näistä voi lukea esimerkiksi [Angularin virallisesta dokumentaatiosta](https://angular.io/guide/architecture). Tiedostojen nimissä käytetään [Angularin suosituksia](https://angular.io/guide/styleguide#naming).

## Tekniikat

Tämän frontendin tekemisessä käytettyjä tekniikoita. Suurin osa näistä tulee Angularin mukana.

- [Angular Framework](https://angular.io/). Tätä kirjoittaessa major-versio on uusin 16.
- HTML - Templatien määrittely.
- [SASS/SCSS](https://sass-lang.com/) - CSS:n esikäsittelykieli, jolla tehdyt tyylitiedostot kääntyvät CSS:ksi.
- [TypeScript](https://www.typescriptlang.org/) - JavaScriptin superset tyyppimäärityksillä.
- [RxJS](https://rxjs.dev/) - Kirjasto reaktiivisen ohjelmoinnin toteuttamiseen käyttäen observableja.
- [Angular Material](https://material.angular.io/) - Komponenttikirjasto käyttöliittymäelementteille.
- [Angular Router](https://angular.io/guide/router) - Reititys ja navigointi.
- [Angular CLI](https://angular.io/cli) - Komentorivityökalu.
- [Angular Reactive Forms](https://angular.io/guide/reactive-forms) - Reaktiivisten lomakkeiden tekemiseen.
- [NgxEditor](https://www.npmjs.com/package/ngx-editor) - Rich-text editori -komponentti.
- [Npm](https://www.npmjs.com/) - Riippuvuuksien hallintaan.
- [Jasmine](https://jasmine.github.io/) - Testaus framework yksikkötesteillle.
- [Karma](https://karma-runner.github.io/latest/index.html) - Testien suoritusympäristö, joka toimii Jasminen kanssa.
- [Git](https://git-scm.com/) - versionhallinta.
- [ESLint](https://eslint.org/) - Staattinen koodinanalyysi.


## Moduulit

Sovellus koostuu eri moduuleista. App.module on juurimoduuli, joka sijaitsee hakemistossa **/src/app**. Siellä on alihakemistot muille moduuleille.
Moduulit sisältävät tyypillisesti seuraavat tiedostot:

- *.module.ts. - Moduulin määritykset lukuunottamatta reitityksen määrittelyjä.
- *.module.routing.ts - Moduulin tarjoamia reitityksen määrittelyjä.
- *.models.ts - Moduulissä käytettyjä malleja, tyypillisesti rajapintoja.
- *.service.ts - Moduulissa käytetty service.
- *.spec.ts - Automaattitestejä.
- *.dummydata.ts - Testien käyttämää dataa.
- Komponentteja, jotka ovat omissa alihakemistoissaan.

### Sovellus koostuu seuraavista moduuleista

 #### app.module
  - Sovelluksen päämoduuli, jossa myös määritellään muut moduulit.
 #### core.module
  - Sovelluksen ydintoiminnallisuus. Importoidaan vain app.modulessa, jolloin se voidaan pitää yksinkertaisempana. 
  Sisältää:
  - App.modulen käyttämiä komponentteja, kuten *header* ja *footer* ja näkymäkomponentteja, kuten *home*, *Ei oikeuksia* ja *Sivua ei löytynyt*.
  - Yleisiä servicejä, kuten auth.service ja error.service.
  - http-interceptor.ts, joka logittaa HTTP-kutsuja.

 #### Feature -moduulit
  
  Muu sovelluksen toiminnallisuus on ryhmitelty näihin moduuleihin. Jokainen shared.modulea lukuunottamatta sisältää niiden toiminnallisuudesta vastaavan servicen sekä reitityksen määrittelyt.

  - **ticket.module** - Tiketteihin eli kysymyksiin liittyviä toiminnallisuus,
  kuten tikettien listaus, tikettien ja UKK:n näyttäminen ja käsittely.

  - **user.module** - Käyttäjiin liittyviä toiminnallisuus, kuten kirjautumisnäkymä,
  käyttäprofiilien näyttäminen ja käsittely.

  - **course.module** - Kursseihin liittyviä toiminnallisuus, kuten kursseille liittyminen, sekä kurssiasetusten- ja tikettipohjien käsittely.
  #### shared.module
  
  Sisältää uudelleenkäytettäviä ominaisuuksia, joita käytetään muissa moduuleissa. Yleisten *Material* -teemaan kuuluvien moduulien tuonti on jaettu omaksi **material.module** -tiedostoksi. Sisältää monia eri näkymien käyttämiä komponentteja, kuten *editor* ja *sender-info*, sekä pipeja ja Reactive Forms -direktiivejä.

## Komponentit

Kukin komponentti vastaa tietystä käyttöliittymän osasta. App.module sisältää juurikomponentin *AppComponent*, joka toimii sovelluksen näkymän perustana ja
johon reitityksestä riippuen renderöidään sitä vastaava näkymäkomponentti.
Näiden komponenttien lisäksi on rajatummasta käyttöliittymän osasta vastaavia komponentteja, kuten header tai
tiketin kommentti. Komponentit voivat sisältää muita komponentteja. Komponentit kuuluvat tiettyyn moduuliin ja sijaitsevat niiden hakemistossa omassa alihakemistossaan.

Komponentteihin hakemistot sisältävät yleensä seuraavat tiedostot:

- *.component.ts - Komponentin määrittely sekä sen TypeScript -luokka, joka käsittelee komponentin näyttämisessä tarvittavaa logiikkaa.
- *.component.html - Komponenttiin liitetty template, jonka mukaan komponentin näkymä renderöidään. 
- *.component.scss - Templatessa käytetyt SCSS / SASS -tyylimäärittelyt.
- *.component.spec.ts - Komponentin Jasmine -testit.


## Servicet

Sisältävät toiminnallisuuksia, jotka eivät suoraan liity näytettävään käyttöliittymään. Kaikki yhteydenpito backendiin tapahtuu serviceissä. Yleiset servicet ovat hakemistossa **/src/app/core/services**, joiden lisäksi feature-moduuleilla on kullakin omansa shared.modulea lukuunottamatta. Servicet ovat *.service.ts -tiedostoissa. Samassa hakemistossa on myös vastaava
*.service.spec.ts - tiedosto, jossa on servicen testit.

### Eri servicet ja ja niiden vastuualueet

#### auth.service

Käyttäjäautentikaatioon liittyvät toiminnot, kuten kirjautuminen ja sen jälkeen
tapahtuva käyttäjätietojen hakeminen palvelimelta sekä käyttäjätilin luominen.

#### store.service

Tänne tallennetaan ja palautetaan muistissa olevia globaaleja muuttujia, kuten
tieto kirjautumisesta ja käyttäjätiedoista. Sisältää myös vakioita. Tämä tila haetaan uudestaan reitityksen muuttuessa eikä tallenneta sessioiden välilä. Sessioiden yli säilyvää tila tallennetaan local storageen. Komponenttien ja niiden lapsien tai vanhempien välinen tiedonvaihto käydään suoraan niiden välillä. Tällä servicellä voidaan välittää tieto minkä tahansa komponenttien ja serviceiden välillä.

#### error.service

Serviceissä tapahtuvat virheet ohjataan ensin tänne, jossa ne logitetaan console.log:lla. 403 eli Ei oikeuksia -virhetilanteissa reititetäänä täältä sitä vastaavaan virhenäkymään. Virheet heitetään uudelleen, jolloin komponentit voivat napata ne ja esittää ne tarvittaessa käyttäjälle tai tehdä muita toimia. Servicellä on mahdollista myös testausta varten generoida virheitä. HTTP-kutsuja logittaa *http-interceptor*.

#### utils.service

Yleishyödyllisiä funktioita, jotka eivät suoraan liity toisten serviceiden vastuualueeseen.

### Feature-moduulien servicet

#### ticket.service

Käsittelee tiketteihin eli kysymyksiin liittyviä toiminnallisuuksia, kuten tikettien ja niiden kommenttien ja liitetiedostojen käsittely.

#### course.service

Käsittelee kursseihin liittyviä toiminnallisuuksia, kuten kurssienhakeminen, tikettipohjien käsittely ja kurssien tietojen tuonti ja vienti tiedostoiksi.

#### user.service


## Teema ja tyylit

Sovellus käyttää *Angular Material* -kirjaston kustomoitua teemaa, jonka määrittelyt ovat tiedostossa **src/styles/custom-theme.scss**. Globaalit tyylimäärittelyt ovat tiedostossa **src/styles.scss**. Se sisältää kaikkialla sovelluksessa käytettyjä CSS -luokkia, joiden nimet ovat *.theme-* -alkuisia. Komponenttikohtaiset tyylit ovat määritelty komponenttien
**.component.scss** -tiedostoissa.

## Kieli ja käännökset

Angularissa käännökset voidaan natiivisti tehdä kahdella eri tavalla: yleisemmin build-aikana tai ajonaikaisesti. Tässä sovelluksessa
noudatetaan jälkimmäistä tapaa. Kieli haetaan ja alustetaan ohjelman käynnistyessä tiedostossa **src/app/app.initializers.ts**. Käännöksen vaihtaminen ajon aikana aiheuttaa aina sovelluksen uudelleenkäynnistyksen.
Tämä on normaalia. Englanninkieliset käännökset sijaitsevat
tiedostossa **src/assets/en-US.json**. Käännökset ovat muodossa:

  ```"Suomenkielinen käännösavain": "Englanninkielinen käännös"```

Suomenkielinen, alkuperäinen teksti on komponenttien templateissa tai komponentin koodissa. Käännös haetaan käännösavaimeen viittaamalla. Komponentin koodissa tämä tapahtuu [$localize](https://angular.io/api/localize) -funktiolla.


## Projektin hakemistorakenne

- **angular.json** - Angularin asetuksia. Mm. eri tiedostojen sijaintien määrittely.
- **package.json** - Node.js -asetukset, kuten npm skriptien määrittelyt ja pakettiriippuvuudet.
- **/src/** - Sovelluksen lähdekoodi.
  - **/app/** - App.modulen hakemisto. Sisältää muiden moduulien alihakemistot.
  - **/styles/** - Custom teeman tyylimäärittelyt.
  - **assets/** - Logot, ikonit ja käännökset.
  - **main.ts** - Täällä asetettu, että production buildissa ei näytetä logeja.
  - **index.html** - Sovelluksen title, fonttien, faviconin osoitteet, sekä mitä
  näytetään, jos ei selaimessa JavaScript -käytössä.
  - **environments/** - Environment -variablet. Sisältää sovelluksen nimen ja base URL:n. Tiedostot:
    - **environments.ts** - Development build:lle.
    - **environments.prod.ts** - Production build:lle.

## Vianmääritys

Tarkkaile virheilmoituksia selainkonsolissa / browser console. Developer buildissa myös tavalliset console.log -logitukset ovat käytössä, joista voi olla hyötyä.
