import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';

export const initializeLanguage = (): Promise<void> | void => {

  const language = getLanguage();
  localStorage.setItem('language', language);
  document.documentElement.lang = language;
  if (language == 'en-US') {
    // Pitää olla juuri tässä hakemistossa.
    return fetch(`/assets/i18n/${language}.json`)
      .then(response => response.json())
      .then(response => loadTranslations(response.translations))
      .catch(() => console.log(`Käännöstä "${language}" ei löytynyt.`));
  }
};

function getLanguage(): string {
  const url = new URL(window.location.href);
  var language: string;
  // console.log('urlLang: ' + urlLang);
  // Upotuksessa kieli tulee URL-parametrina.
  const urlLang = url.searchParams.get('lang');
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
    var savedlanguage: string | null = localStorage.getItem('language');
    if (savedlanguage !== null) {
      if (savedlanguage === 'en-US' || savedlanguage === "fi-FI") {
        language = savedlanguage;
      } else {
        console.error('app.initializers.ts: Tuntematon tallennettu kieli: ' + savedlanguage);
        console.log('Käytetään oletuskieltä');
        // Oletus on upotuksessa englanti, koska käyttäjä ei voi vaihtaa kieltä toisin kuin normaalinäkymässä.
        language = isInIframe() ? 'en-US' : 'fi-FI'; 
      }
    } else {
      console.log('Ei kieltä tallennettuna tai URL:ssa, käytetään oletusta.');
      language = isInIframe() ? 'en-US' : 'fi-FI'; 
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

function isInIframe () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function changeToLang(newLang: 'en' | 'fi') {
  const LANG = (newLang == 'en') ? 'en-US' : 'fi-FI';
  const OLD_LANG = localStorage.getItem('language');
    if (LANG !== OLD_LANG) {
      localStorage.setItem('language', LANG);
      window.location.reload();
    }
}

// Jos haluaa kielen mukaan vaihtuvat lokaalit käyttöön.
// Pitää laittaa app.module.ts: { provide: LOCALE_ID, useFactory: initializeSupportedLocales }
// ja import { initializeSupportedLocales } from './app.initializers';
export const initializeSupportedLocales = () => {
  registerLocaleData(localeFi, 'fi-FI');
  const LANG = getLanguage();
  return LANG;
};

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
