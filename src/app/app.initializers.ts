import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';

export const initializeLanguage = (): Promise<void> | void => {
  const language = getLanguage();
  document.documentElement.lang = language;
  // registerLocaleData(localeFi, 'fi-FI');
  if (language && language !== 'fi-FI') {
    // Pitää olla juuri tässä hakemistossa.
    return fetch(`/assets/i18n/${language}.json`)
      .then((response) => response.json())
      .then((response) => {
        loadTranslations(response.translations);
      })
      .catch(() => {
        console.log(`language ${language} not found, fallback to english`);
      });
  }
};

function getLanguage(): string {
  // Jos on käyttäjä tässä sovelluksessa valinnut kielen.
  let language: string | null = localStorage.getItem('language');
  console.log(' localStoragen kieli: ' + language);

  if (language == null || language == undefined) {
    language = 'fi-FI';
    // Jos haluaa käyttää selaimen kieltä.
    // language = navigator.language;
    // console.log('navigator.language -kieli: ' + language);
  }

  // if (language === undefined || language === null ) {
  //   const browserLanguages: string[] | undefined = getBrowserLocales();
  //   console.log('Saatiin kielet: ' + browserLanguages);

  // if (language !== 'fi-FI') {
    // language = 'en-US';
  // }
  console.log('valittiin kieli: ' + language);
  return language;
}

// export const initializeSupportedLocales = () => {
  // registerLocaleData(localeFi, 'fi-FI');
  // const language = getLanguage();
  // return language;
// };

function getBrowserLocales(options = {}): string[] | undefined {
  const defaultOptions = {
    languageCodeOnly: false,
  };
  const opt = {
    ...defaultOptions,
    ...options,
  };
  const browserLocales =
    navigator.languages === undefined
      ? [navigator.language]
      : navigator.languages;
  if (!browserLocales) {
    return undefined;
  }
  return browserLocales.map((locale) => {
    const trimmedLocale = locale.trim();
    return opt.languageCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale;
  });
}
