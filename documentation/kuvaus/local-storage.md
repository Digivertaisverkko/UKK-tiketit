## Sessioiden yli tallentuva tieto

Session yli tallentuva tieto tallennetaan local storageen. Tämän käyttö on sovelluksessa
vähäistä. Session globaali tila on tallennettu [store serviceen](#storeservice).
Local storageen on tallennetut muuttujat:

- **language**
Voi olla 'fi-FI' tai 'en-US'. Tallennetaan local storageen, koska kielen
vaihtaminen vaatii aina sovelluksen uudelleenkäynnistyksen.

- **noDataConsent**
Taulukko käyttäjät tunnistavia token id:tä käyttäjistä, jotka eivät ole antaneet suostumuksia heidän tietojensa luovutukseen, jolloin heille ei voi tehdä
käyttäjätiliä. Tallennetaan, jotta sitä ei tarvitse kysyä käyttäjältä uudestaan.

- **lastTokenId**
Edelliseen liittyen viimeisin tunnettu käyttäjän token id.

- **redirectUrl**
- URL, johon ohjataan kirjautumisen jälkeen.