import { MatPaginatorIntl } from '@angular/material/paginator';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();
  // FIXME: Miksi $localize ei toimi tässä funktiossa?
  if (localStorage.getItem('language')?.substring(0,2) == 'fi') {
    customPaginatorIntl.itemsPerPageLabel = "Kysymyksiä sivulla";
    customPaginatorIntl.firstPageLabel = "Ensimmäinen sivu";
    customPaginatorIntl.lastPageLabel  = "Viimeinen sivu";
    customPaginatorIntl.nextPageLabel = "Seuraava sivu";
    customPaginatorIntl.previousPageLabel = "Edellinen sivu";
    customPaginatorIntl.getRangeLabel = (page, pageSize, length) =>
      "Kysymykset " + String(page) + "–" + String(pageSize) + " / " + String(length);
  }
  return customPaginatorIntl;
}
