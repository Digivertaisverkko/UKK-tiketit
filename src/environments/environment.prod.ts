/* Nämä asetukset ovat voimassa käännettäessä production buildina.
   esim. ng build --configuration production.
*/

const baseUrl ='/api';

export const environment = {
  production: true,
  clientID: 'angularApp',
  productName: 'Tukki',
  apiBaseUrl: baseUrl,
  testing: false
};
