import { ActivatedRoute, Router, ActivationEnd  } from '@angular/router';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit }
    from '@angular/core';
import { Observable } from 'rxjs';
import { StoreService } from '../store.service';
import { User } from '@core/core.models';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent implements OnInit {
  // Async pipeä varten.
  // public isUserLoggedIn$: Observable<boolean>;
  public courseID: string | null = this.route.snapshot.paramMap.get('courseid');
  public disableLangSelect: boolean = false;
  public readonly maxUserLength = 40;
  public user: User | null = null;
  public userRole: string = '';
  public handsetPB$: Observable<BreakpointState>;

  private _language!: string;

  constructor (
    private route : ActivatedRoute,
    private change: ChangeDetectorRef,
    private responsive: BreakpointObserver,
    private router: Router,
    private store : StoreService
    ) {
    this.handsetPB$ = this.responsive.observe(Breakpoints.HandsetPortrait);
    this._language = localStorage.getItem('language') ?? 'fi-FI';
  }

  ngOnInit(): void {
    this.trackCourseID();
    this.trackUserInfo();
  }

  public logoClicked() {
    this.store.sendMessage('go begin');
  }

  private trackCourseID() {
    this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        let courseID = event.snapshot.paramMap.get('courseid');
        if (courseID !== this.courseID) {
          this.courseID = courseID;
        }
      }
    });
  }

  trackUserInfo() {
    this.store.trackUserInfo().subscribe(response => {
        this.user = response;
        this.change.detectChanges();
    })
  }

}
