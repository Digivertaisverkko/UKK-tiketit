# UKK-tiketit

Tämä on Digivertaisverkkohanketta varten toteutetun opetuskäyttöön tarkoitetun tikettijärjestelmän web-käyttöliittymä. Web-käyttöliittymä on toteutettu [Angularilla](https://angular.io/). Web-käyttöliittymä kommunikoi erikseen asennettavan tikettijärjestelmän rajapinnan [UKK-Tiketit-backend](https://github.com/Digivertaisverkko/UKK-tiketit-backend) kanssa.

## Asennus

Web-käyttöliittymä tarvitsee toimiakseen tikettijärjestelmän rajapinnan [UKK-Tiketit-backend](https://github.com/Digivertaisverkko/UKK-tiketit-backend). Katso ohjeet sen asentamiseksi projektin GitHub sivulta. Sieltä löytyy myös ohjeet tämän web-käyttöliittymän ajamiseen yhdessä rajapinnan kanssa.

## Kehitysympäristö

Alla on ohjeet miten käytät tätä projektia kehitystyössä. Ohjeet olettavat sinun asentaneen tikettijärjestelmän rajapinnan sen ohjeiden mukaan.

### Asennus kehitysympäristössä

- Asenna nodejs ja npm tietokoneellesi.
- Asenna [Angular-CLI](https://angular.io/cli) globaalisti npm:llä komennolla `npm install -g @angular/cli`
- Lataa tai kloonaa tämä repo. Aseta tikettijärjestelmän rajapinnassa ympäristömuuttuja `FRONTEND_DIRECTORY` osoittamaan kyseisessä kansiossa olevaan /dist/tikettisysteemi -hakemistoon. Esimerkiksi `FRONTEND_DIRECTORY=/home/user/UKK-tiketit/dist/tikettisysteemi/`
- Aja komento `npm ci` asentaaksesi projektin riippuvuudet
- Aja komento `npm run build` kääntääksesi projektin.

### Kääntäminen

Aja komento `npm run build` kääntääksesi projektin `production` versiona.

Aja komento `npm run watch`, jos haluat tehdä kehitystyötä. Tällöin projekti käännetään `development` versiona ja kääntäminen tapahtuu tiedostojen muuttumisen yhteydessä.

Projektin käännetty versio sijaitsee `dist/tikettisysteemi/` hakemistossa.

### Testien ajaminen

Aja komento `ng test` ajaaksesi kaikki projektin testit [Karmalla](https://karma-runner.github.io). Testit sijaitsevat *.spec.ts -tiedostoissa jokaisen komponentin, servicen ja pipen yhteydessä.

Testejä voi ajaa myös testitiedosto kerrallaan käyttäen `--include` argumenttia. Esimerkiksi SubmitTicketComponent testit voi ajaa komennolla `ng test --include **/submit-ticket.component.spec.ts`

Testit ajetaan käyttäen Google Chrome -selainta. Joissain tapauksissa testiympäristö ei havaitse automaattisesti Chromen binaaria ja tällöin joudut asettamaan ympäristömuuttujan `CHROME_BIN`. Esimerkiksi `CHROME_BIN=chromium ng test`.

# Hyödyllisiä linkkejä

* [Web-käyttöliittymän käyttöohjeet](https://github.com/Digivertaisverkko/UKK-tiketit/wiki)
* [Tikettijärjestelmän REST rajapinta](https://github.com/Digivertaisverkko/UKK-tiketit-backend/blob/main/docs/rajapinta/api.md)
* [Angular - Angular coding style guide](https://angular.io/guide/styleguide#overall-structural-guidelines)
* [Angular Material UI component library](https://material.angular.io/)
* [Angular - Testing](https://angular.io/guide/testing)
* [Testing Angular - A Guide to Robust Angular Applications](https://testing-angular.com/)
