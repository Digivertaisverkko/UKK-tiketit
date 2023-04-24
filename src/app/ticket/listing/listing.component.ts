import { ActivatedRoute, Router, ParamMap} from '@angular/router';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild }
    from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subject, Subscription, takeUntil, tap, timer }
    from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService, User } from 'src/app/core/auth.service';
import { Constants, getIsInIframe } from '../../shared/utils';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/core/store.service';
import { TicketService, Kurssini, UKK } from '../ticket.service';
import { TicketListComponent } from './ticket-list/ticket-list.component';

export interface ColumnDefinition {
  def: string;
  showMobile: boolean;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})

export class ListingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(TicketListComponent) ticketList!: TicketListComponent;
  public columnDefinitions: ColumnDefinition[];
  public courseID: string = '';
  public dataSource = new MatTableDataSource<UKK>();
  public error;
  public isInIframe: boolean;
  public isLoaded: boolean = false;
  public isParticipant: boolean = false;
  public isPhonePortrait: boolean = false;
  public maxItemTitleLength = 100;  // Älä aseta tätä vakioksi.
  public numberOfFAQ: number = 0;

  private fetchFAQsSub$: Subscription | null = null;
  private isPolling: boolean = false;
  private isTicketsLoaded: boolean = false;
  private loggedIn$ = new Subscription;
  private position: number = 0;
  private readonly POLLING_RATE_MIN = (environment.production == true ) ? 5 : 15;
  private unsubscribe$ = new Subject<void>();
  private url: string = '';

  // Merkkijonot
  public courseName: string = '';
  public errorMessage: string = '';
  public ticketViewLink = '';
  public user: User = {} as User;

  @ViewChild('sortFaq', { static: false }) sort = new MatSort();
  // @ViewChild('paginatorQuestions') paginator: MatPaginator | null = null;
  // @ViewChild('paginatorFaq') paginatorFaq: MatPaginator | null = null;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private responsive: BreakpointObserver,
    private route : ActivatedRoute,
    private router: Router,
    private store : StoreService,
    private ticket: TicketService,
    private title : Title
  ) {
    this.title.setTitle(Constants.baseTitle + $localize `:@@Otsikko-Kysymykset:
        Kysymykset`);
    this.isInIframe = getIsInIframe();

    this.columnDefinitions = [
      { def: 'otsikko', showMobile: true },
      { def: 'aikaleima', showMobile: false }
    ];

    this.error = { title: '', message: '', buttonText: '' }

  }

  ngOnInit() {
    this.url = window.location.pathname;
    this.trackCourseID();

    this.authService.trackUserInfo().subscribe(response => {
      this.user = response;
    });
    this.trackLoggedStatus();
    this.trackScreenSize();
  }

  ngAfterViewInit(): void {
    this.trackMessages();
  }

  ngOnDestroy(): void {
    console.warn('listaus: ngOnDestroy ajettu.');
    window.removeEventListener('scroll', this.onScroll);
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

  // refresh = Jos on saatu refresh-pyyntö muualta.
  private fetchFAQ(courseID: string, refresh?: boolean) {
    this.ticket.getFAQ(courseID).then(response => {
        if (response.length > 0) {
          this.numberOfFAQ = response.length;
          this.dataSource = new MatTableDataSource(response);
          this.dataSource.sort = this.sort;
          // this.dataSourceFAQ.paginator = this.paginatorFaq;
        }
        return
      })
      .catch(error => {
        this.handleError(error)
      })
      .finally(() => {
        this.isLoaded = true;
        if (this.isPolling === false) {
          this.isPolling = true;
          if (this.isTicketsLoaded === true || this.isParticipant === false) {
            this.restorePosition();
          }
        }
        // if (refresh !== true) this.isLoaded = true;
      });
  }

  public getDisplayedColumnFAQ(): string[] {
    return this.columnDefinitions
      .filter(cd => !this.isPhonePortrait || cd.showMobile)
      .map(cd => cd.def);
  }

  // TODO: lisää virheilmoitusten käsittelyjä.
  private handleError(error: any) {
    if (error?.tunnus == 1000 ) {
    }
    this.isLoaded = true;
  }

  public newTicketMessage(event: any) {
    if (event === 'loaded') {
      this.isTicketsLoaded = true;
      if (this.isPolling === true) {
        this.isLoaded = true;
        this.restorePosition();
      }
    }
  }

  private onScroll = () => {
    this.position = window.scrollY;
    this.store.setPosition(this.url, this.position);
  }

  public openInNewTab(): void {
    window.open(window.location.href, '_blank');
  }

  public stopPolling(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.fetchFAQsSub$) this.fetchFAQsSub$.unsubscribe();
  }

  // Kun esim. headerin logoa klikataan ja saadaan refresh-pyyntö.
  private trackMessages(): void {
    this.store.trackMessages().subscribe(response => {
      if (response === 'refresh') {
        console.log('trackMessages: saatiin refresh pyyntö.');
        this.isLoaded = false;
        setTimeout(() => this.isLoaded = true, 800);
        // this.fetchTickets(this.courseID);
        this.fetchFAQ(this.courseID, true);
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

  private showCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      this.courseName = response ?? '';
    }).catch( () => this.courseName = '');
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

  // Seurataan kurssi ID:ä URL:sta.
  private trackCourseID(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      var courseID: string | null = paramMap.get('courseid');
      if (courseID === null) {
        this.errorMessage = $localize `:@@puuttuu kurssiID:
            Kurssin tunnistetietoa  ei löytynyt. Tarkista URL-osoitteen oikeinkirjoitus.`;
        this.isLoaded = true;
        throw new Error('Virhe: ei kurssi ID:ä.');
      }
      this.courseID = courseID;
      this.showCourseName(courseID);
      this.startPollingFAQ();
    })
  }

  private trackLoggedStatus(): void {
    this.loggedIn$ = this.authService.onIsUserLoggedIn().subscribe(response => {
      if (response !== true) return
      this.ticket.getMyCourses().then(response => {
        if (response[0].kurssi !== undefined) {
          const myCourses: Kurssini[] = response;
          // Onko käyttäjä osallistujana URL parametrilla saadulla kurssilla.
          if (!myCourses.some(course => course.kurssi == Number(this.courseID))) {
            console.log('ei olla kurssilla');
            console.log('kurssi id: ' + this.courseID);
            this.isParticipant = false;
            this.authService.setIsParticipant(false);
          } else {
            console.log('kurssi id: ' + this.courseID);
            console.log('ollaan kurssilla');
            this.isParticipant = true;
            this.authService.setIsParticipant(true);
          }
        }
      })
    });
  }

  private startPollingFAQ(): void {
    this.fetchFAQsSub$?.unsubscribe();
    console.warn('Aloitetaan UKK pollaus.');
    const pollRate = this.POLLING_RATE_MIN * Constants.MILLISECONDS_IN_MIN;
    this.fetchFAQsSub$ = timer(0, pollRate)
        .pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(() => this.fetchFAQ(this.courseID));
  }

  private restorePosition(): void {
    this.position = this.store.getPosition(this.url);
    if (this.position && this.position !== 0) {
      console.log('skrollataan positioon: ' + this.position);
      setTimeout(() => window.scrollTo(0, this.position), 100);
    }
    window.addEventListener('scroll', this.onScroll);
  }

}
