/* Nämä asetukset ovat voimassa käännettäessä production buildina.
   esim. ng build --configuration production.
*/

let apiBaseUrl = 'https://dvv-tiketti-backend.azurewebsites.net';

export const environment = {
  production: true,
  clientID: 'angularApp',
  ownAskLoginUrl: apiBaseUrl + '/login',
  ownTokenUrl: apiBaseUrl + '/authtoken',
  ownLoginUrl: apiBaseUrl + '/omalogin',
};
