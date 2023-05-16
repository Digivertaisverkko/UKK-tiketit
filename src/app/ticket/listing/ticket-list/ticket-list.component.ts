import { ActivatedRoute } from '@angular/router';
import {  AfterViewInit, Component, EventEmitter, Input, Output, OnDestroy, OnInit,
          ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, Subscription, takeUntil, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { Constants } from '@shared/utils';
import { StoreService } from '@core/store.service';
import { TicketService } from '../../ticket.service';
import { User } from '@core/core.models';
import { SortableTicket } from '../../ticket.models';

interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

enum IconFile {
  'Lahetetty' = 1, 'Kasittelyssa', 'Kysymys', "Kommentti", "Ratkaisu_64",
  "Arkistoitu"
}

interface ErrorNotification {
  title: string,
  message: string,
  buttonText?: string
}

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: [ '../listing.component.scss' , './ticket-list.component.scss']
})

export class TicketListComponent implements OnInit, AfterViewInit, OnDestroy {

  // @Input() public courseID: string = '';
  public readonly courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  @Input() public user: User | null = null;
  @Output() ticketMessage = new EventEmitter<string>();
  public archivedCount: number = 0;
  public columnDefinitions: ColumnDefinition[];
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

  private fetchTicketsSub$: Subscription | null  = null;
  private readonly POLLING_RATE_MIN = ( environment.production == true ) ? 1 : 15;
  private unsubscribe$ = new Subject<void>();

  @ViewChild('sortQuestions', { static: false }) sortQuestions = new MatSort();
  @ViewChild('sortArchived',  { static: false }) sortArchived  = new MatSort();

  constructor(
    private responsive: BreakpointObserver,
    private route: ActivatedRoute,
    private store : StoreService,
    private ticket: TicketService,
  ) {
    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false },
      { def: 'aikaleima', showMobile: true }
    ];
    if (window.sessionStorage.getItem('SHOW_ARCHIVED') === 'true') {
      this.isArchivedShown = true;
    } else {
      this.isArchivedShown = false;
    };

  }

  ngOnInit() {
    this.headline = this.getHeadline();
    this.trackScreenSize();
    this.startPollingTickets();
    if (this.isArchivedShown) this.fetchArchivedTickets();
  }

  ngAfterViewInit(): void {
    this.trackMessages();
  }

  ngOnDestroy(): void {
    console.warn('tikettilista: ngOnDestroy ajettu.');
    this.stopPolling();
  }

  //hakutoiminto, jossa paginointi kommentoitu pois
  public applyFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value;
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
      /*if (this.dataSourceFAQ.paginator) {
        this.dataSourceFAQ.paginator.firstPage();
      }*/
  }

  // Hae arkistoidut tiketit.
  public fetchArchivedTickets() {
    if (this.courseID === null) return
    this.ticket.getTicketList(this.courseID, { option: 'archived' })
      .then(response => {
        if (!response) return
        if (response.length > 0) {
          this.dataSourceArchived = new MatTableDataSource(response);
          this.archivedCount = response.length;
          this.dataSourceArchived.sort = this.sortArchived;
        }
    }).catch(error => this.handleError(error));
  }

  // Hae tiketit kerran.
  private fetchTickets(courseID: string) {
    this.ticket.getTicketList(courseID).then(response => {
      if (!response) return
      if (response.length > 0) {
        this.error = null;
        this.dataSource = new MatTableDataSource(response);
        this.numberOfQuestions = response.length;
        // Taulukko pitää olla tässä vaiheessa templatessa näkyvillä,
        // jotta sorting toimii.
        this.dataSource.sort = this.sortQuestions;
      }
      return
      // this.dataSource.paginator = this.paginator;
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

  // TODO: lisää virheilmoitusten käsittelyjä.
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
    this.stopPolling();
    const link = '/course/' + this.courseID + '/submit' + (linkEnding ?? '');
    console.log('tallennettu URL: ' + link);
    window.localStorage.setItem('REDIRECT_URL', link);
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

  private startPollingTickets() {
    this.fetchTicketsSub$?.unsubscribe();
    console.warn('Aloitetaan tikettien pollaus.');
    const pollRate = this.POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;
    // throttleTime(pollTime),
    this.fetchTicketsSub$ = timer(0, pollRate)
        .pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
          if (this.courseID) this.fetchTickets(this.courseID)
        });
  }

  public stopPolling(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.fetchTicketsSub$) this.fetchTicketsSub$.unsubscribe();
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages(): void {
    this.store.trackMessages()
      .pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(response => {
      if (response === 'refresh') {
        console.log('trackMessages: saatiin refresh pyyntö.');
        this.startLoading();
        setTimeout(() => this.stopLoading(), 800);
        if (this.courseID)  this.fetchTickets(this.courseID);
      }
    });
  }

  private trackScreenSize(): void {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.maxItemTitleLength = 35;
        this.isPhonePortrait = true;
      } else {
        this.isPhonePortrait = false;
        this.maxItemTitleLength = 100;
      }
    });
  }

}
