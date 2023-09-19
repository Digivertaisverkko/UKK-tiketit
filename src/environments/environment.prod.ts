/* Nämä asetukset ovat voimassa käännettäessä production buildina.
   esim. ng build --configuration production.
*/

/* "testing" muuttuja voidaan tarvittaessa asettaa testissä arvoksi true,
    jos halutaan ohjelmakoodissa tietää, ajetaanko testiympäristöä. */

const baseUrl ='/api';

export const environment = {
  production: true,
  productName: 'Tukki',
  apiBaseUrl: baseUrl,
  testing: false
};
