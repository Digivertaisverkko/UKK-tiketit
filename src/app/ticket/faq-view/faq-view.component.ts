import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TicketService } from '../ticket.service';
import { Constants } from '@shared/utils';
import { Tiketti } from '../ticket.models';
import { Title } from '@angular/platform-browser';
import { User, Error } from '@core/core.models';
import { StoreService } from '@core/store.service';

@Component({
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss'],
})

export class FaqViewComponent implements OnInit {
  public errorMessage: string = '';
  public isArchivePressed: boolean = false;
  public isCopyToClipboardPressed: boolean = false;
  public isLoaded: boolean = false;
  public ticket: Tiketti = {} as Tiketti;
  public user$: Observable<User | null>;
  private courseID: string | null;
  private faqID: string | null = this.route.snapshot.paramMap.get('id');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreService,
    private ticketService: TicketService,
    private titleServ: Title
  ) {
    this.courseID = this.route.snapshot.paramMap.get('courseid');
    this.user$ = this.store.trackUserInfo();
  }

  ngOnInit(): void {
    if (this.courseID === null) {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    if (this.faqID !== null) {
      this.ticketService.getTicket(this.faqID, this.courseID)
        .then((response) => {
          console.dir(response);
          this.ticket = response;
          this.titleServ.setTitle(Constants.baseTitle + response.otsikko);
        })
        .catch(error => {
          this.errorMessage =
            $localize`:@@UKK näyttäminen epäonnistui:
                Usein kysytyn kysymyksen näyttäminen epäonnistui` + '.';
        })
        .finally(() => this.isLoaded = true );
    }
  }

  editFaq() {
    let url = `/course/${this.courseID}/submit-faq/${this.faqID}`;
    this.router.navigate([url], { state: { editFaq: 'true' } });
  }

  changeArchiveButton() {
    setTimeout(() => this.isArchivePressed = true, 300);
  }

  archiveFaq() {
    this.isArchivePressed = false;
    if (!this.faqID || !this.courseID) return
    this.ticketService.archiveFAQ(this.faqID, this.courseID).then(response => {
      this.router.navigateByUrl('course/' + this.courseID +  '/list-tickets');
    }).catch((error: Error) => {
      if (error.tunnus == 1003) {
        this.errorMessage = $localize `:@@:Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@UKK poisto epäonnistui:Usein kysytyn kysymyksen poistaminen ei onnistunut.`
      }
    })
  }

}
