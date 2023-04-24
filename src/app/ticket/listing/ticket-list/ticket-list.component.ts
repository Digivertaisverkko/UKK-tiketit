import { ActivatedRoute, Router, ParamMap} from '@angular/router';
import { AfterViewInit, Component, EventEmitter, Input, Output, OnDestroy, OnInit, ViewChild }
    from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, Subscription, takeUntil, timer }
  from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';

import { AuthService, User } from 'src/app/core/auth.service';
import { Constants, getIsInIframe } from '../../../shared/utils';
import { RefreshDialogComponent } from '../../../core/refresh-dialog/refresh-dialog.component';
import { StoreService } from 'src/app/core/store.service';
import { TicketService, Kurssini, } from '../../ticket.service';

export interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

enum IconFile {
  'Lahetetty' = 1, 'Kasittelyssa', 'Kysymys', "Kommentti", "Ratkaisu_64",
  "Arkistoitu"
}

export interface SortableTicket {
  id: number;
  otsikko: string;
  aikaleima: string;
  aloittajanNimi: string
  tilaID: number;
  tila: string;
}

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: [ '../listing.component.scss' , './ticket-list.component.scss']
})

export class TicketListComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() public courseID: string = '';
  @Input() public user: User = {} as User;
  @Output() ticketMessage = new EventEmitter<string>();
  public archivedCount: number = 0;
  public columnDefinitions: ColumnDefinition[];
  public dataSource = new MatTableDataSource<SortableTicket>();
  public dataSourceArchived = new MatTableDataSource<SortableTicket>();
  public errorMessage: string = '';
  public headline: string = '';
  public iconFile: typeof IconFile = IconFile;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isPolling: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public noDataConsent: boolean = false;
  public numberOfQuestions: number = 0;
  public ticketsError;

  private fetchTicketsSub$: Subscription | null  = null;
  private readonly POLLING_RATE_MIN = ( environment.production == true ) ? 1 : 15;
  private unsubscribe$ = new Subject<void>();

  @ViewChild('sortQuestions', { static: false }) sortQuestions = new MatSort();
  @ViewChild('sortArchived',  { static: false }) sortArchived  = new MatSort();

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private responsive: BreakpointObserver,
    private route : ActivatedRoute,
    private store : StoreService,
    private ticket: TicketService,
  ) {
    this.isInIframe = getIsInIframe();

    this.columnDefinitions = [
      { def: 'tila', showMobile: true },
      { def: 'otsikko', showMobile: true },
      { def: 'aloittajanNimi', showMobile: false },
      { def: 'aikaleima', showMobile: true }
    ];

    this.ticketsError = { title: '', message: '', buttonText: '' }

  }

  ngOnInit() {
    this.noDataConsent = this.getDataConsent();
    if (this.noDataConsent) console.log('Kieltäydytty tietojen annosta.');
    // this.trackLoggedStatus();
    this.headline = this.setTicketListHeadline();
    this.trackScreenSize();
    this.startPollingTickets();
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
      this.isLoaded = true;
      if (this.isPolling === false) {
        this.isPolling = true;
        this.ticketMessage.emit('loaded');
      }
    })
  }

  private getDataConsent(): boolean {
    return (localStorage.getItem('NO_DATA_CONSENT') === "true") ? true : false
  }

  public getDisplayedColumn(): string[] {
    return this.columnDefinitions
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  public giveConsent() {
    localStorage.removeItem('NO_DATA_CONSENT');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '30rem';
    const refreshDialog = this.dialog.open(RefreshDialogComponent, dialogConfig);
    refreshDialog.afterClosed().subscribe(res => {
      if (res === 'cancel') {
        localStorage.setItem('NO_DATA_CONSENT', 'true');
      }
    })
  }

  // TODO: lisää virheilmoitusten käsittelyjä.
  private handleError(error: any) {
    if (error?.tunnus == 1000 ) {

    }
  }

  public hideArchived() {
    this.dataSourceArchived = new MatTableDataSource();
    this.archivedCount = 0;
  }

    // Tallentaa URL:n kirjautumisen jälkeen tapahtuvaa uudelleenohjausta varten.
  public saveRedirectUrl(linkEnding?: string): void {
    this.stopPolling();
    const link = '/course/' + this.courseID + '/submit' + (linkEnding ?? '');
    if (this.authService.getIsUserLoggedIn() === false) {
      console.log('tallennettu URL: ' + link);
      window.localStorage.setItem('REDIRECT_URL', link);
    }
  }

  private setEmptyTicketError(): void {
    this.ticketsError = { title: '', message: '', buttonText: ''}
  }

  public setTicketListHeadline(): string {
    switch (this.user.asema) {
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

  private startPollingTickets() {
    this.fetchTicketsSub$?.unsubscribe();
    console.warn('Aloitetaan tikettien pollaus.');
    const pollRate = this.POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;
    // throttleTime(pollTime),
    this.fetchTicketsSub$ = timer(0, pollRate)
        .pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => this.fetchTickets(this.courseID));
  }


  public stopPolling(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.fetchTicketsSub$) this.fetchTicketsSub$.unsubscribe();
  }

  public ticketErrorClickEvent(button: string) {
    this.giveConsent();
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages(): void {
    this.store.trackMessages().subscribe(response => {
      if (response === 'refresh') {
        console.log('trackMessages: saatiin refresh pyyntö.');
        this.isLoaded = false;
        setTimeout(() => this.isLoaded = true, 800);
        this.fetchTickets(this.courseID);
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
