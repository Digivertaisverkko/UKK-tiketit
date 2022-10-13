let apiBaseUrl = 'http://localhost:3000/api';

export const environment = {
  production: true,
  clientID: 'angularApp',
  ownAskLoginUrl: apiBaseUrl + '/login',
  ownTokenUrl: apiBaseUrl + '/authtoken',
  ownLoginUrl: apiBaseUrl + '/omalogin',
};
