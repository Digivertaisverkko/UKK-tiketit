import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import localeEn from '@angular/common/locales/en';

// Alusta valittu kieli.
export const initializeLanguage = (): Promise<void> | void => {

  registerLocaleData(localeFi);  // Aina oletuslocale.
  registerLocaleData(localeEn);
  const language = getLanguage();
  localStorage.setItem('language', language);
  document.documentElement.lang = language;
  if (language == 'en-US') {
    // Huom. tiedoston pitää olla juuri tässä hakemistossa.
    return fetch(`/assets/i18n/${language}.json`)
      .then(response => response.json())
      .then(response => loadTranslations(response.translations))
      .catch(() => console.error(`Käännöstä "${language}" ei löytynyt.`));
  }
};

// Aseta kieleksi fi-FI. Käytetään testeissä.
export const initializeLanguageFI = (): Promise<void> | void => {
  registerLocaleData(localeFi);  // Aina oletuslocale.
  registerLocaleData(localeEn);
  const language = 'fi-FI'
  document.documentElement.lang = language;
};


/* Mikä kieli on käytössä. Valitaan tässä järjestyksessä jos on määritelty.
  1. Käyttäjän valitsema (tallennettu localStorageen)
  2. URL-parametrina
  3. Oletus: fi-FI
*/
function getLanguage(): 'en-US' | 'fi-FI' {
  const url = new URL(window.location.href);
  var language: 'en-US' | 'fi-FI';
  // console.log('urlLang: ' + urlLang);
  // Upotuksessa kieli tulee URL-parametrina.

  var savedlanguage: string | null = localStorage.getItem('language');
  if (savedlanguage !== null) {
    if (savedlanguage === 'en-US' || savedlanguage === "fi-FI") {
      language = savedlanguage;
    } else {
      console.error('app.initializers.ts: Tuntematon tallennettu kieli: ' +
          savedlanguage);
      console.log('Käytetään oletuskieltä');
      // Oletus on upotuksessa englanti, koska käyttäjä ei voi vaihtaa kieltä
      // toisin kuin normaalinäkymässä.
      language = isInIframe() ? 'en-US' : 'fi-FI';
    }
  } else {
    const urlLang = url.searchParams.get('lang');
    if (urlLang !== null) {
     language = getLangFormat(urlLang);
    } else {
      console.log('Ei kieltä tallennettuna tai URL:ssa, käytetään oletusta: fi-FI');
      language = isInIframe() ? 'en-US' : 'fi-FI';
    }
  }

    // Jos haluaa käyttää selaimen kieltä.
    // language = navigator.language;
    // console.log('navigator.language -kieli: ' + language);

    // if (language === undefined || language === null ) {
    //   const browserLanguages: string[] | undefined = getBrowserLocales();
    //   console.log('Saatiin kielet: ' + browserLanguages);
  return language;
}

// Muunna URL:ssa oleva kielen muoto asetuksissa vaadituksi.
function getLangFormat(langInUrl: string): 'en-US' | 'fi-FI' {
  let lang: 'en-US' | 'fi-FI';
  if (langInUrl == 'en') {
    lang = 'en-US';
    console.log('enkku valittu url:sta');
  } else if (langInUrl == 'fi') {
    lang = 'fi-FI';
    console.log('suomi valittu url:sta');
  } else {
    lang = 'en-US';
    console.log('Tuntematon kieli: "' + langInUrl  + '", käytetään englantia.');
  }
  return lang
}

// Alusta oletus fi-FI -locale. Ei toiminut.
export const initializeLocale = () => {
  registerLocaleData(localeFi, 'fi-FI');
  return 'fi-FI';
};

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

// Jos haluaa selaimen kielen mukaan valita lokalen.
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
