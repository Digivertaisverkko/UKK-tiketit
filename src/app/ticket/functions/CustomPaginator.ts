import { MatPaginatorIntl } from '@angular/material/paginator';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();

  customPaginatorIntl.itemsPerPageLabel = $localize`:@@Kysymyksiä sivulla:Kysymyksiä sivulla`;

  return customPaginatorIntl;
}
