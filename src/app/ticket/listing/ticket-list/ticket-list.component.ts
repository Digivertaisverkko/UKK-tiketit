import {  AfterViewInit, Component, EventEmitter, Input, Output, OnInit,
    ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StoreService } from '@core/services/store.service';
import { TicketService } from '../../ticket.service';
import { User } from '@core/core.models';
import { SortableTicket } from '../../ticket.models';

interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

enum IconFile {
  'Lahetetty' = 1, 'Kasittelyssa', 'Kysymys', "Kommentti", "Ehdotus", "Ratkaisu"
}

interface ErrorNotification {
  title: string,
  message: string,
  buttonText?: string
}

/* Tämä tarvitaan mat-tablen oletuksen sijaan, jotta voi etsiä myös lisäkenttien
tiedoilla. */
const customFilterPredicate = (data: SortableTicket, filter: string) => {
  const filterValue = filter.toLowerCase();

  const kentatMatch = data.kentat.some((item) => {
    const tiketti = item.tiketti ? item.tiketti : '';
    const arvo = item.arvo ? item.arvo.toLowerCase() : '';
    const otsikko = item.otsikko ? item.otsikko.toLowerCase() : '';

    return (
      tiketti === filterValue ||
      arvo.includes(filterValue) ||
      otsikko.includes(filterValue)
    );
  });
  const datePipe = new DatePipe('fi-FI');
  const mainDataMatch = (
    data.id.toString() === filterValue ||
    data.otsikko.toLowerCase().includes(filterValue) ||
    datePipe.transform(data.aikaleima, 'shortDate')?.includes(filterValue) ||
    datePipe.transform(data.viimeisin, 'shortDate')?.includes(filterValue) ||
    data.viimeisinStr.toLowerCase().includes(filterValue) ||
    data.aloittajanNimi.toLowerCase().includes(filterValue) ||
    data.tila.toLowerCase().includes(filterValue)
  );
  return kentatMatch || mainDataMatch;
};

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: [ '../listing.component.scss' , './ticket-list.component.scss']
})

export class TicketListComponent implements OnInit, AfterViewInit {

  // UKK:sta kopioitaessa @Input:na courseid oli undefined.
  @Input() public courseid: string = '';
  @Input() public user: User | null = null;
  @Output() ticketMessage = new EventEmitter<string>();
  public archivedCount: number = 0;
  public columnDefinitions!: ColumnDefinition[];
  public dataSource = new MatTableDataSource<SortableTicket>();
  public dataSourceArchived = new MatTableDataSource<SortableTicket>();
  public error: ErrorNotification | null = null;
  public headline: string = '';
  public iconFile: typeof IconFile = IconFile;
  public isLoaded: boolean = false;
  public isPolling: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public numberOfQuestions: number = 0;
  public isArchivedShown: boolean;

  private fetchTicketsTimer$: Observable<number>;
  private readonly POLLING_RATE_MIN = ( environment.production == true ) ? 1 : 1;
  private trackMessages$: Observable<string>;

  @ViewChild('sortQuestions', { static: false }) sortQuestions = new MatSort();
  @ViewChild('sortArchived',  { static: false }) sortArchived  = new MatSort();

  constructor(
    private responsive: BreakpointObserver,
    private store : StoreService,
    private ticket: TicketService,
  ) {
    const POLLING_RATE_MS = this.POLLING_RATE_MIN * this.store.getMsInMin();
    this.fetchTicketsTimer$ = timer(0, POLLING_RATE_MS).pipe(takeUntilDestroyed());
    this.trackMessages$ = this.store.trackMessages().pipe(takeUntilDestroyed());
    this.setBaseColumnDefinitions();
    this.isArchivedShown = window.sessionStorage.getItem('SHOW_ARCHIVED') === 'true' ?
        true : false;
  }

  ngOnInit() {
    this.headline = this.getHeadline();
    this.trackScreenSize();
    this.startPollingTickets(this.POLLING_RATE_MIN);
    if (this.isArchivedShown && (this.user?.asema === 'opettaja'
      || this.user?.asema === 'admin')) {
      this.fetchArchivedTickets();
    }
  }

  ngAfterViewInit(): void {
    this.trackMessages();
  }

  public applyFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value;
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  private static customFilterPredicate(data: SortableTicket, filter: string): boolean {
    return customFilterPredicate(data, filter);
  }

  // Hae arkistoidut tiketit.
  public fetchArchivedTickets() {
    if (this.courseid === null) return
    this.ticket.getTicketList(this.courseid, { option: 'archived' })
      .then(response => {
        if (response === null) response = [];
        if (response.length > 0) {
          this.dataSourceArchived = new MatTableDataSource(response);
          this.archivedCount = response.length;
          this.dataSourceArchived.sort = this.sortArchived;
        }
    }).catch(error => {
    });
  }

  // Hae tiketit kerran.
  public fetchTickets(courseID: string) {
    this.ticket.getTicketList(courseID).then((response: SortableTicket[] | null) => {
      if (!response) return
      if (response.length > 0) {
        this.error = null;
        const hasAttachment = response.some(ticket => ticket.liite === true);
        this.setBaseColumnDefinitions();
        if (hasAttachment) {
          this.columnDefinitions.push({ def: 'liite', showMobile: false })
        }
        this.dataSource = new MatTableDataSource(response);
        this.numberOfQuestions = response.length;
        // Taulukko pitää olla tässä vaiheessa templatessa näkyvillä,
        // jotta sorting toimii.
        this.dataSource.sort = this.sortQuestions;
        this.dataSource.filterPredicate = TicketListComponent.customFilterPredicate;
      }
      return
    }).catch(error => {
      this.handleError(error)
    }).finally(() => {
      if (this.isPolling === false) {
        this.isPolling = true;
        this.ticketMessage.emit('loaded');
        this.stopLoading();
      }
    })
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  public getHeadline(): string {
    switch (this.user?.asema) {
      case 'opettaja':
        return $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
        break;
      case 'admin':
        return $localize`:@@Kurssilla esitetyt kysymykset:Kurssilla esitetyt kysymykset`;
        break;
      case 'opiskelija':
        return $localize`:@@Omat kysymykset:Omat kysymykset`;
        break;
      default:
        return $localize`:@@Esitetyt kysymykset:Esitetyt kysymykset`
    }
  }

  private handleError(error: any) {
    this.error = {
      title: $localize`:@@Virhe:Virhe`,
      message: $localize`:@@Kysymysten hakeminen ei onnistunut:
        Kysymysten hakeminen ei onnistunut.`
    }
  }

  public hideArchived() {
    this.isArchivedShown = false;
    window.sessionStorage.setItem('SHOW_ARCHIVED', 'false');
    this.dataSourceArchived = new MatTableDataSource();
    this.archivedCount = 0;
  }

  // Tallentaa URL:n kirjautumisen jälkeen tapahtuvaa uudelleenohjausta varten.
  public saveRedirectUrl(linkEnding?: string): void {
    const link = '/course/' + this.courseid + '/submit' + (linkEnding ?? '');
    console.log('tallennettu URL: ' + link);
    window.localStorage.setItem('REDIRECT_URL', link);
  }

  private setBaseColumnDefinitions() {
    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false },
      { def: 'viimeisin', showMobile: false }
    ];
  }

  public showArchived() {
    window.sessionStorage.setItem('SHOW_ARCHIVED', 'true');
    this.isArchivedShown = true;
    this.fetchArchivedTickets()
  }

  private startLoading() {
    this.isLoaded = false;
    this.store.startLoading();
  }

  private stopLoading() {
    this.isLoaded = true;
    this.store.stopLoading();
  }

  // Hae tiketit tietyn ajan välein.
  private startPollingTickets(POLLING_RATE_MIN: number) {
    console.log(`Aloitetaan tikettien pollaus joka ${POLLING_RATE_MIN} minuutti.`);
    let fetchStartTime: number | undefined;
    let elapsedTime: number | undefined;
    const POLLING_RATE_SEC = POLLING_RATE_MIN * 60;
    this.fetchTicketsTimer$.subscribe(() => {
      this.fetchTickets(this.courseid!);
      if (fetchStartTime) {
        elapsedTime = Math.round((Date.now() - fetchStartTime) / 1000);
        console.log('Tikettien pollauksen viime kutsusta kulunut aikaa ' +
          `${elapsedTime} sekuntia.`);
        if (elapsedTime !== POLLING_RATE_SEC) {
          console.error(`Olisi pitänyt kulua ${POLLING_RATE_SEC} sekuntia.`);
        }
      }
      fetchStartTime = Date.now();
    });
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages(): void {
    this.trackMessages$.subscribe(response => {
        if (response === 'refresh') {
          console.log('trackMessages: saatiin refresh pyyntö.');
          this.startLoading();
          setTimeout(() => this.stopLoading(), 800);
          this.fetchTickets(this.courseid!);
        }
    });
  }

  private trackScreenSize(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.maxItemTitleLength = 75;
        this.isPhonePortrait = true;
      } else {
        this.isPhonePortrait = false;
        this.maxItemTitleLength = 100;
      }
    });
  }

}
