# Tukki web-käyttöliittymän kuvaus

Tämä ohje pyrkii antamaan yleisen kuvauksen Tukki-järjestelmän web-käyttöliittymän
eli frontendin arkkitehtuurista ohjelman ylläpitäjälle.  Tämä tiedosto kannattaa
pitää ajan tasalla. Dokumentin ymmärtämiseksi olisi hyvä tuntea perustiedot
Angularin yleisistä käsitteistä, kuten *moduuli* (*module* tai tarkemmin *ngModule*), 
*komponentti* (*component*), *template* ja *service*. Näistä voi lukea esimerkiksi
[Angularin virallisesta dokumentaatiosta](https://angular.io/guide/architecture). Tiedostojen nimissä käytetään
[Angularin suosituksia](https://angular.io/guide/styleguide#naming), samoin [sovelluksen yleisessä rakenteessa](https://angular.io/guide/styleguide#overall-structural-guidelines).

## Sisällysluettelo

- [Tekniikat](#tekniikat)
- [Moduulit](#moduulit)
- [Komponentit](#komponentit)
- [Servicet](#servicet)
- [Teema ja tyylit](#teema-ja-tyylit)
- [Kieli ja käännökset](#kieli-ja-käännökset)
- [Projektin hakemistorakenne](#projektin-hakemistorakenne)
- [Sessioiden yli tallentuva tieto](#sessioiden-yli-tallentuva-tieto)
- [Vianmääritys](#vianmääritys)

## Tekniikat

Tämän frontendin tekemisessä käytettyjä tekniikoita. Suurin osa näistä tulee Angularin mukana.

- [Angular Framework 16.2](https://angular.io/) - Käytetty ohjelmistokehys. 
- HTML - Templatien määrittely.
- [SASS / SCSS](https://sass-lang.com/) - CSS:n esikäsittelykieli, jolla tehdyt tyylitiedostot kääntyvät CSS:ksi.
- [TypeScript 5.1](https://www.typescriptlang.org/) - JavaScriptin superset tyyppimäärityksillä.
- [RxJS](https://rxjs.dev/) - Kirjasto reaktiivisen ohjelmoinnin toteuttamiseen käyttäen observableja.
- [Angular Material](https://material.angular.io/) - Komponenttikirjasto käyttöliittymäelementteille.
- [Angular Router](https://angular.io/guide/router) - Reititys ja navigointi.
- [Angular CLI](https://angular.io/cli) - Komentorivityökalu.
- [Angular Reactive Forms](https://angular.io/guide/reactive-forms) - Käytetty sovelluksen lomakkeissa.
- [NgxEditor](https://www.npmjs.com/package/ngx-editor) - Rich-text editori -komponentti.
- [Npm 9.8](https://www.npmjs.com/) - Pakettien hallintaan.
- [Node.js 20.5](https://nodejs.org/en) - Mm. Kehityspalvelimen ajamiseen.
- [Jasmine 4.3](https://jasmine.github.io/) - Testaus framework yksikkötesteillle.
- [Karma 6.4](https://karma-runner.github.io/latest/index.html) - Testien suoritusympäristö, joka toimii Jasminen kanssa.
- [Compodoc](https://compodoc.app/) - Dokumentaation generointi.
- [Git](https://git-scm.com/) - Versionhallinta.
- [ESLint](https://eslint.org/) - Staattinen koodinanalyysi.

## Sovelluksen arkkitehtuuri

![Sovelluksen arkkitehtuurin kaavakuva](Tukki-web-UI-arkkitehtuuri.svg)

Kuvassa on esitetty sovelluksen arkkitehtuuria. Kuva on nähtävillä tiedostossa documentation/introduction/Tukki-web-UI-arkkitehtuuri.svg. Seuraavissa kappaleissa on kuvattu
kuvassa näkyviä sovelluksen yksikköjä. Yksikköjen kuvaukset on dokumenetoitu myös
niiden lähdekooditiedostoihin. Niitä voi lukea automaattisesti generoidusta Compodoc
-dokumentaatiosta avaamalla verkkoselaimella tiedoston documentation/index.html. 

## Moduulit

Sovellus koostuu eri päämoduuleista, jotka ovat kukin omassa hakemistoissaan. Esim.
core.module hakemistossa **src/app/core**. Näiden moduulien lisäksi eri paketit
sisältävät monia omia moduuleitaan.

Päämoduulit sisältävät tyypillisesti seuraavat tiedostot:

- **\*.module.ts** - Moduulin määritykset lukuunottamatta reitityksen määrittelyjä.
- **\*.module.routing.ts** - Moduulin tarjoamia reitityksen määrittelyjä.
- **\*.models.ts** - Moduulissä käytettyjä malleja, tyypillisesti rajapintoja.
- **\*.service.ts** - Moduulissa käytetty service.
- **\*.spec.ts** - Automaattitestejä.
- **\*.dummydata.ts** - Testien käyttämää dataa.
- Komponentteja, jotka ovat omissa alihakemistoissaan.

### Sovellus koostuu seuraavista päämoduuleista

 #### app.module
Sovelluksen juurimoduuli, joka ladataan ensin ja jossa määritellään muut moduulit.
Sijaitsee hakemistossa **/src/app**. Sisältää alihakemistot muille moduuleille.
Vain app.modulen käyttämät komponentit tulisi sijoittaa core.moduleen, samoin
kaikki yleiset servicet.

 #### core.module
Sovelluksen ydintoiminnallisuus. Importoidaan ainoastaan app.modulessa, jolloin
se voidaan pitää yksinkertaisempana. Sisältää App.modulen käyttämiä komponentteja,
kuten *header* ja *footer* ja yleisiä näkymäkomponentteja, kuten *home* ja
*Sivua ei löytynyt*, yleisiä servicejä, kuten auth.service ja error.service.
Sisältää myös http-interceptor.ts, joka logittaa HTTP-kutsuja.

 #### Feature -moduulit
  
Muu sovelluksen toiminnallisuus on ryhmitelty vastuualueittain näihin moduuleihin. 
okainen shared.modulea lukuunottamatta sisältää niiden toiminnallisuudesta
vastaavan servicen sekä reitityksen määrittelyt.

  - **ticket.module** - Tiketteihin eli kysymyksiin liittyviä toiminnallisuus,
  kuten tikettien listaus, tikettien ja UKK:n näyttäminen ja käsittely. Alihakemistossa
  *components* on moduulissa käytettyjä, muita kuin reitteihin sidottuja komponentteja,
  kuten tiketin kommentista vastaava *comment*.

  - **user.module** - Käyttäjiin liittyviä toiminnallisuus, kuten kirjautumisnäkymä,
  käyttäprofiilien näyttäminen ja käsittely.

  - **course.module** - Kursseihin liittyviä toiminnallisuus, kuten kursseille
  liittyminen, sekä kurssiasetusten- ja tikettipohjien käsittely.

  #### shared.module
  
  Sisältää ominaisuuksia, joita käytetään useissa muissa moduuleissa. Yleisten
  *Material* -teemaan kuuluvien moduulien tuonti on jaettu omaksi **material.module**
  -tiedostoksi. **components** -alihakemisto sisältää monia eri näkymien käyttämiä
  komponentteja. Moduuli sisältää myös pipeja ja direktiivejä.


## Komponentit

Kukin komponentti vastaa tietystä käyttöliittymän osasta. App.module sisältää
juurikomponentin *AppComponent*, joka toimii sovelluksen näkymän perustana ja
johon reitityksestä riippuen renderöidään sitä vastaava näkymäkomponentti.
Näiden komponenttien lisäksi on rajatummasta käyttöliittymän osasta vastaavia
komponentteja, kuten header tai
tiketin kommentti. Komponentit voivat sisältää muita komponentteja. Komponentit
kuuluvat tiettyyn moduuliin ja sijaitsevat niiden hakemistossa omassa alihakemistossaan.

Komponentteihin hakemistot sisältävät yleensä seuraavat tiedostot:

- **\*.component.ts** - Komponentin määrittely sekä sen TypeScript -luokka, joka käsittelee komponentin näyttämisessä tarvittavaa logiikkaa.
- **\*.component.html** - Komponenttiin liitetty template, jonka mukaan komponentin näkymä renderöidään. 
- **\*.component.scss** - Templatessa käytetyt SCSS / SASS -tyylimäärittelyt.
- **\*.component.spec.ts** - Komponentin Jasmine -testit.


## Servicet

Sisältävät toiminnallisuuksia, jotka eivät suoraan liity näytettävään käyttöliittymään.
Kaikki yhteydenpito backendiin tapahtuu serviceissä. Yleiset servicet ovat hakemistossa
**/src/app/core/services**, joiden lisäksi feature-moduuleilla on kullakin omansa
shared.modulea lukuunottamatta. Servicet ovat *.service.ts -tiedostoissa. Samassa
hakemistossa on myös vastaava *.service.spec.ts - tiedosto, jossa on servicen testit.

### Eri servicet ja ja niiden vastuualueet

#### auth.service

Käyttäjäautentikaatioon liittyvät toiminnot, kuten kirjautuminen sekä siihen
liittyvien tietojen käsittely. Näitä ovat esimerkiksi kirjautumisen tila ja kirjautuneen
käyttäjän tiedot. Nämä tiedot haetaan palvelimelta ja päivitetään store.serviceen
aina reitityksen muuttuessa.

#### store.service

Tänne tallennetaan globaali tieto, jonka halutaan olevan käytettävissä kaikkialla
sovelluksessa. Näitä ovat esimerkiksi tieto kirjautumisen tilasta ja kirjautuneen
käyttäjän tiedoista. Tiedot eivät säily sessioiden yli (kts. [Sessioiden yli tallentuva tieto](#sessioiden-yli-tallentuva-tieto)).
Tiedot välitetään pääosin RxJS:n behavior subjecteilla.

#### error.service

Serviceissä tapahtuvat virheet ohjataan ensin tänne, jossa ne logitetaan console.log:lla.
403 eli Ei oikeuksia -virhetilanteissa reititetäänä täältä sitä vastaavaan virhenäkymään.
Virheet heitetään uudelleen, jolloin komponentit voivat napata ne ja esittää ne
tarvittaessa käyttäjälle tai tehdä muita toimia. Servicellä on mahdollista myös
testausta varten generoida virheitä. HTTP-kutsuja logittaa *http-interceptor*.

#### utils.service

Yleishyödyllisiä funktioita, jotka eivät suoraan liity toisten serviceiden vastuualueeseen.

### Feature-moduulien servicet

#### ticket.service

Käsittelee tiketteihin eli kysymyksiin liittyviä toiminnallisuuksia, kuten
tikettien ja niiden kommenttien ja liitetiedostojen käsittely.

#### course.service

Käsittelee kursseihin liittyviä toiminnallisuuksia, kuten kurssien hakeminen,
tikettipohjien käsittely ja kurssin tietojen tuonti ja vienti tiedostoiksi.

#### user.service

## Osien välinen kommunikaatio

Parent- ja child komponenttien välillä tiedonvaihto tapahtuu pääosin
suoraan Angularin @Input ja @Output -dekoraattoreiden avulla. Komponentit voivat
kutsua niihin injektoitujen serviceiden metodeja ja saada paluuarvoja. Kun
jonkin osan tarvitsee välittää muuttujien tieto globaalisti sovelluksen muihin
osiin, ne lähettävän sen metodikutsuilla [Store servicen](#storeservice) RxJS (behavior)
subjekteihin. Komponentit voivat kuunnella niiden arvoja observableilla. [Sessioiden yli tallentuva tieto](#sessioiden-yli-tallentuva-tieto) tallennetaan local storageen, mutta tätä ei käytetä paljon.

## Teema ja tyylit

Yleiset tyylimäärittelyt ovat hakemistossa **src/styles/**. Sovellus käyttää
*Angular Material* -kirjaston kustomoitua teemaa, jonka määrittelyt ovat tiedostossa
**custom-theme.scss**. [Tietoa teeman muokkaamisesta](https://material.angular.io/guide/theming).

Kaikkiin templateihin vaikuttavat määrittelyt ovat tiedostossa **styles.scss**.
Se sisältää kaikkialla sovelluksessa käytettyjä CSS -luokkia, joiden nimet ovat
*.theme-* -alkuisia. **variables.scss** sisältää joitain globaaleja variableja,
jotka voi importoida tarvittaessa komponenttien tyylitiedostoissa. Niissä
sijaitsevat komponenttikohtaiset tyylit.

## Kieli ja käännökset

Angularissa käännökset voidaan natiivisti tehdä kahdella eri tavalla: yleisemmin
build-aikana tai ajonaikaisesti. Tässä sovelluksessa noudatetaan jälkimmäistä tapaa.
Kieli haetaan ja alustetaan ohjelman käynnistyessä tiedostossa **src/app/app.initializers.ts**.
Käännöksen vaihtaminen ajon aikana aiheuttaa aina sovelluksen uudelleenkäynnistyksen.
Tämä on normaalia. Kielen valinnan logiikka, joka tarkistetaan tässä järjestyksessä
sovelluksen alustuksessa:
1. Käyttäjän valitsema.
2. URL-parametrina asetettu. Yleensä LTI-kautta upotuksessa.
3. Oletus, joka upotuksessa on englanti ja muulloin suomi.

Englanninkieliset käännökset sijaitsevat
tiedostossa **src/assets/en-US.json**. Käännökset ovat muodossa:

  ```"Suomenkielinen käännösavain": "Englanninkielinen käännös"```

Suomenkielinen, alkuperäinen teksti on komponenttien templateissa tai komponentin
koodissa. Käännös haetaan käännösavaimeen viittaamalla. Komponentin koodissa tämä
tapahtuu [$localize](https://angular.io/api/localize) -funktiolla.


## Projektin hakemistorakenne

- **angular.json** - Angularin asetuksia. Mm. eri tiedostojen sijaintien määrittely.
- **package.json** - Node.js -asetukset, kuten npm -skriptien määrittelyt ja pakettiriippuvuudet.
- **src/** - Sovelluksen lähdekoodi.
  - **app/** - App.modulen hakemisto. Sisältää myös muiden moduulien alihakemistot.
  - **assets/** - Logot, ikonit ja käännökset.
  - **styles/** - Teeman ja yleiset tyylimäärittelyt.
  - **main.ts** - Täällä asetettu, että production buildissa ei näytetä logeja.
  - **index.html** - Sovelluksen title, fonttien, faviconin osoitteet, sekä mitä
  näytetään, jos selaimessa ei ole JavaScript -käytössä.
  - **environments/** - Environment -variablet. Sisältää sovelluksen nimen ja base URL:n. Tiedostot:
    - **environments.ts** - Development build:lle.
    - **environments.prod.ts** - Production build:lle.

## Sessioiden yli tallentuva tieto

Session yli tallentuva tieto tallennetaan local storageen. Tämän käyttö on sovelluksessa
vähäistä. Session globaali tila on tallennettu [store serviceen](#storeservice).
Local storageen on tallennetut muuttujat:

- **language**
Voi olla 'fi-FI' tai 'en-US'. Täytyy tallentaa local storageen,
koska kielen vaihtaminen vaatii aina sovelluksen uudelleenkäynnistyksen.

- **noDataConsent**
Array käyttäjät tunnistavia token id:tä, jotka eivät ole antaneet suostumuksia
tietojen luovutukseen. Heille ei tehdä tiliä, mutta voivat katsella UKK:a.
Tallennetaan, jotta heiltä ei aina ohjelman alussa kysyttäisi sitä uudelleen,
vaan uudelleen kieltäytyminen voidaan tehdä automaattisesti.

- **lastTokenId**
Edelliseen liittyen viimeisin tunnettukäyttäjän token id.

- **redirectUrl**
Tallentaa URL:n, johon ohjataan kirjautumisen jälkeen. Käytetään, kun käyttäjä
käyttäjä kirjautuu sisälle, jolloin hänet voidaan sen jälkeen ohjata samaan
näkymään.

## Vianmääritys

### Virhetilanteissa
- Tarkista, ilmeneekö virheitä automaattitesteissä.
- Tarkkaile virheilmoituksia selainkonsolissa / browser console:ssa. Developer
buildissa myös tavalliset console.log -logitukset ovat käytössä toisin kuin
production buildissa. Tällöin mm. kaikki HTTP-kutsut logitetaan.

### Jokin elementti näyttää päivityksen jälkeen väärältä

Jos kyseessä on Angular Materialin -elementti, voi tämä johtua muutoksesta
Angularin generoimassa CSS-luokkien nimissä. Tyylitiedostot sisältävät joitain
muokkauksia, joissa käytetään näitä luokkia. Esimerkkinä alla *listing* -komponentin
tyylitiedosto muuttaa taulukon sarakkeen otsikon väriä, jonka mukaan lajittelu tehdään.

```
:host ::ng-deep .mat-sort-header-content {
  color: #595959;
}
```
*.mat-sort-header-content* on Angularin generoima luokka, jota ei ole templatessa.
Pelkästään templatessa oleviin elementteihin viittaamalla ei näissä tapauksissa
saataisi haluttua vaikutusta. Niihin viittaaminen voi vaatia toimiakseen
**::ng-deep** -yhdistäjän. Jos tämä määritys lakkaisi toimimasta, kannattaa
ensimmäisenä tarkastaa selaimen kehittäjätyökalulla, onko nimeämisessä tai
elementin rakenteessa tapahtunut muutoksia. 


[Takaisin alkuun](#web-käyttöliittymän-kuvaus)
