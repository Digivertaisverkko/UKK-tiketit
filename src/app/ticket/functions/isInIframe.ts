// Onko näkymä Iframe -upotuksessa.
export function getIsInIframe(): boolean {
    // Tämä arvo on asetettu app.component.ts
    const isInIframe = window.sessionStorage.getItem('IN-IFRAME');
    return (isInIframe == 'true') ? true : false;
}