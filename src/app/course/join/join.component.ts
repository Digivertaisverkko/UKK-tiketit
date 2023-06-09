import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subscription, takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/auth.service';
import { Constants } from '@shared/utils';
import { CourseService } from '@course/course.service';
import { InvitedInfo } from '@course/course.models'; 
import { StoreService } from '@core/store.service';
import { User } from '@core/core.models';

interface ErrorNotification {
  title: string,
  message: string,
  buttonText?: string
}

@Component({
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit, OnDestroy {

  @Input() courseid: string | null = null;
  @Input() invitation: string | null = null;
  public courseName: string = '';
  public error: ErrorNotification | null = null;
  public invitedInfo: InvitedInfo | undefined;
  public state: 'editing' | 'wrongUser' = 'editing';
  public user: User | null | undefined;
  private isLoggedIn: boolean | null | undefined;
  private loggedIn$ = new Subscription;

  constructor(
    private auth: AuthService,
    private courses: CourseService,
    private router: Router,
    private store: StoreService,
    private title: Title,
  ) {
  }

  ngOnInit(): void {
    if (this.invitation === null) {
      console.error('Virhe: Ei UUID:ä.');
    } else {
      console.log('UUID: ' + this.invitation);
    }
    this.loginIfNeeded();
    this.trackUserInfo();
    this.getInvitedInfo();
  }

  ngOnDestroy(): void {
    this.loggedIn$.unsubscribe();
  }

  public getInvitedInfo() {
    if (!this.courseid || !this.invitation) return
    this.courses.getInvitedInfo(this.courseid, this.invitation).then(res => {
      if (res === null) {
        throw Error('URL:in mukaisesta kutsusta ei löytynyt tietoja.')
      }
      if (res.id != null) {
        this.invitedInfo = res;
        console.log('this.user?.sposti ' + this.user?.sposti );
        console.log('res.sposti ' + res.sposti);
        this.getCourseName(this.invitedInfo.kurssi);
        if (this.user?.sposti && res.sposti !== this.user.sposti) {
          console.log('getInvitedInfo asettaa väärän userin.');
          this.setNotRightUser();
        }
      }
    }).catch(err => {
      this.error = {
        title: $localize `:@@Virhe:Virhe`,
        message: $localize `:@@Kutsun tietojen haku epäonnistui:Antamallasi URL-osoitteella ei löytynyt kutsun tietoja. Kutsu on voinut vanhentua.`
      }
    })
  }

  public goToHome() {
   this.router.navigateByUrl('home');
  }

  public joinCourse(): void{
    if (!this.courseid) {
      throw Error('Ei kurssi ID:ä, ei voida jatkaa.');
    }
    if (!this.invitation) {
      throw Error('Ei UUID:ä, ei voida jatkaa.');
    }
    this.courses.joinCourse(this.courseid, this.invitation).then(res => {
      this.error = null;
      if (this.isLoggedIn !== true) {
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseid);
      }
      if (res?.success === true) {
        const route = `course/${this.courseid}/list-tickets`
        this.router.navigateByUrl(route);
      } else {
      throw Error('Ei onnistunut liittyminen.');
      }
    }).catch(err => {
      this.error = {
        title: $localize `:@@Virhe:Virhe`,
         message: $localize `:@@Liittyminen epäonnistui:Kurssille liittyminen ei onnistunut` + '.'
      }
    })
  }

  private getCourseName(courseid: string) {
    this.courses.getCourseName(courseid).then(response => {
      this.courseName = response ?? '';
      this.title.setTitle(Constants.baseTitle + 'Liity kurssialueelle ' + this.courseName);
    }).catch((response) => {
    });
  }

  private loginIfNeeded(): void {
    this.loggedIn$ = this.store.onIsUserLoggedIn().subscribe(response => {
      if (response === false) {
        this.isLoggedIn = false;
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseid);
      } else if (response === true) {
        this.isLoggedIn = true;
      }
    });
  }

  public logout() {
    this.auth.logout().then(res => {
      this.auth.saveRedirectURL();
      this.auth.navigateToLogin(this.courseid);
    }).catch(err => {

    })
  }

  private setNotRightUser() {
    console.log('asetetaan väärä käyttäjä');
    this.state = 'wrongUser';
    this.error = {
      title: $localize `:@@Väärä käyttäjä:Väärä käyttäjä`,
      message: `Liittyäksesi kurssille, kirjaudu sisään käyttäjänä, joka käyttää sähköpostia ${this.invitedInfo?.sposti}.`
    }
  }

  private trackUserInfo() {
    this.store.trackUserInfo().pipe(
        takeWhile(() => this.user === undefined)
      ).subscribe(res => {
      if (res?.nimi ) this.user = res;
      console.log('this.user?.sposti ' + this.user?.sposti );
      console.log('res.sposti ' + res?.sposti);
      if (this.user?.sposti && this.invitedInfo?.sposti) {
        if (this.user.sposti !== this.invitedInfo?.sposti) {
          console.log('trackuserinfo asettaa väärän userin.');
          this.setNotRightUser();
        }
      }
    })
  }
  
}
