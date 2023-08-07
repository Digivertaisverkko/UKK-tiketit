/* Nämä asetukset ovat voimassa käännettäessä production buildina.
   esim. ng build --configuration production.
*/

const baseUrl ='/api';

export const environment = {
  production: true,
  clientID: 'angularApp',
  productName: 'UKK-Tiketit',
  apiBaseUrl: baseUrl,
  testing: false
};
