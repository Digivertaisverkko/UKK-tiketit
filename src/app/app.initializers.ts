import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import { ActivatedRoute } from '@angular/router';

export const initializeLanguage = (): Promise<void> | void => {

  const language = getLanguage();

  document.documentElement.lang = language;
  // registerLocaleData(localeFi, 'fi-FI');
  if (language && language !== 'fi-FI') {
    // Pitää olla juuri tässä hakemistossa.
    return fetch(`/assets/i18n/${language}.json`)
      .then(response => response.json())
      .then(response => {
        console.log('ladataan kieli');
        loadTranslations(response.translations);
      })
      .catch(() => {
        console.log(`Kieltä ${language} ei löytynyt.`);
      });
  }
};

function getLanguage(): string {

  const url = new URL(window.location.href);
  const urlLang = url.searchParams.get('lang');
  var language: string | null;

  console.log('urlLang: ' + urlLang);

  if (urlLang !== null) {
    if (urlLang == 'en') {
      language = 'en-US';
      console.log('enkku valittu url:sta');
    } else if (urlLang == 'fi') {
      language = 'fi-FI';
      console.log('suomi valittu url:sta');
    } else {
      language = 'en-US';
      console.log('Tuntematon kieli: "' + urlLang  + '", käytetään englantia.');
    }
  } else {
    // Jos käyttäjä on aiemmin valinnut kielen.
    language = localStorage.getItem('language');

    // Oletuskieli
    if (language == null || language == undefined) {
      language = 'fi-FI';
    }
  }

    // Jos haluaa käyttää selaimen kieltä.
    // language = navigator.language;
    // console.log('navigator.language -kieli: ' + language);

  // if (language === undefined || language === null ) {
  //   const browserLanguages: string[] | undefined = getBrowserLocales();
  //   console.log('Saatiin kielet: ' + browserLanguages);

  // if (language !== 'fi-FI') {
    // language = 'en-US';
  // }
  return language;
}

export function changeToLang(newLang: 'en' | 'fi') {
  var language: string;
    if (newLang == 'en') {
      language = 'en-US';
    } else {
      language = 'fi-FI';
    }
    const oldLang = localStorage.getItem('language');
    if (language !== oldLang) {
      localStorage.setItem('language', language);
      window.location.reload();
    }
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
