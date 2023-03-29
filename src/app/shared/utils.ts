// Vakiot, joita on käytössä useammassa kuin yhdessä komponentissa.
export const Constants = {
  baseTitle: 'UKK Tiketit - ',
  MILLISECONDS_IN_MIN: 60000,
} as const;

// Onko näkymä Iframe -upotuksessa.
export function getIsInIframe(): boolean {
  // Tämä arvo on asetettu app.component.ts
  const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
  return (isInIframe == 'true') ? true : false;
}
