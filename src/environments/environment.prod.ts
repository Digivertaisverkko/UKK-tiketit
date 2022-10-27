/* Nämä asetukset ovat voimassa käännettäessä production buildina.
   esim. ng build --configuration production.
*/

const baseUrl ='https://dvv-tiketti-backend.azurewebsites.net';

export const environment = {
  production: true,
  clientID: 'angularApp',
  productName: 'UKK-Tiketit',
  apiBaseUrl: baseUrl,
  ownAskLoginUrl: baseUrl + '/login',
  ownTokenUrl: baseUrl + '/authtoken',
  ownLoginUrl: baseUrl + '/omalogin',
};
