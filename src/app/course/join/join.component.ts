import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subscription, takeWhile } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { AuthService } from '@core/services/auth.service';
import { CourseService } from '@course/course.service';
import { InvitedInfo } from '@course/course.models';
import { StoreService } from '@core/services/store.service';
import { User } from '@core/core.models';

interface ErrorNotification {
  title: string,
  message: string,
  buttonText?: string
}

/**
 * Näkymä, jossa käyttäjä, jolla on jo käyttäjätili, pystyy liittymään kurssille.
 * Osoite tähän näkymään on lähetetty käyttäjälle sähköpostilla.
 * 
 * Uuden käyttäjätilin luominen tapahtuu puolestaan register -komponentilla.
 *
 * @export
 * @class JoinComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit, OnDestroy {

  @Input() courseid!: string;
  @Input() invitation: string | null = null;
  public courseName: string = '';
  public error: ErrorNotification | null = null;
  public invitedInfo: InvitedInfo | undefined;
  public state: 'editing' | 'wrongUser' | 'error' = 'editing';
  public user: User | null | undefined;
  // private isLoggedIn: boolean | null | undefined;
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
    }
    /* Ohjataan loginiin, jos käyttäjä ei ole kirjautunut. Näytetään virhe,
    *  jos on kirjautunut vääränä käyttäjänä.
    */
    this.trackUserInfo();
    this.getInvitedInfo();
  }

  ngOnDestroy(): void {
    this.loggedIn$.unsubscribe();
  }

  public getInvitedInfo() {
    if (!this.invitation) return
    this.courses.getInvitedInfo(this.courseid, this.invitation).then(res => {
      if (res === null) {
        throw Error('URL:in mukaisesta kutsusta ei löytynyt tietoja.')
      }
      if (res.id != null) {
        this.invitedInfo = res;
        this.getCourseName(this.invitedInfo.kurssi);
        if (this.user?.sposti && res.sposti !== this.user.sposti) {
          this.setNotRightUser();
        }
      }
    }).catch(err => {
      this.state = 'error';
      this.error = {
        title: $localize `:@@Virhe:Virhe`,
        message: $localize `:@@Kutsun tietojen haku epäonnistui:Antamallasi URL-osoitteella ei löytynyt kutsun tietoja. Kutsu on voinut vanhentua.`
      }
    })
  }

  public goToHome() {
    const route = `course/${this.courseid}/home`
   this.router.navigateByUrl(route);
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
      if (this.user === null) {
        this.auth.saveRedirectURL();
        this.auth.navigateToLogin(this.courseid);
      }
      if (res?.success === true) {
        const route = `course/${this.courseid}/list-tickets`;
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
      this.title.setTitle(this.store.getBaseTitle() + $localize `:@@Liity kurssille:
          Liity kurssille` + this.courseName);
    }).catch(() => {
    });
  }


  public logout() {
    this.auth.logout().then(() => {
      this.auth.saveRedirectURL();
      this.auth.navigateToLogin(this.courseid);
    }).catch(() => {

    })
  }

  private setNotRightUser() {
    this.state = 'wrongUser';
    this.error = {
      title: $localize `:@@Väärä käyttäjä:Väärä käyttäjä`,
      message: $localize `:@@Liittyäksesi kurssille:Liittyäksesi kurssille, kirjaudu sisään käyttäjänä, jolle kutsu on lähetetty` + '.'
    }
  }

  private trackUserInfo() {
    this.store.trackUserInfo().pipe(
        takeWhile(() => this.user === undefined)
      ).subscribe(userinfo => {
        if (userinfo === undefined) return
        this.user = userinfo;
        if (userinfo === null) {
          console.log('join: Ei ole kirjautunut, ohjataan kirjautumiseen.');
          this.auth.saveRedirectURL();
          this.auth.navigateToLogin(this.courseid);
        }
      if (this.user?.sposti && this.invitedInfo?.sposti) {
        if (this.user.sposti !== this.invitedInfo?.sposti) {
          this.setNotRightUser();
        }
      }
    })
  }

}
