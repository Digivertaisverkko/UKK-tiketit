import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { StoreService } from '@core/services/store.service';
import { TicketService } from '../ticket.service';
import { Tiketti } from '../ticket.models';
import { User, Error } from '@core/core.models';

@Component({
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss'],
})

export class FaqViewComponent implements OnInit {
  @Input() courseid!: string;
  @Input() id!: string;

  public errorMessage: string = '';
  public isArchivePressed: boolean = false;
  public isCopyToClipboardPressed: boolean = false;
  public isLoaded: boolean = false;
  public ticket: Tiketti = {} as Tiketti;
  public user$: Observable<User | null>;
  private faqID!: string;

  constructor(
    public router: Router,  // Jotta voidaan testata.
    private store: StoreService,
    private ticketService: TicketService,
    private titleServ: Title
  ) {
    this.user$ = this.store.trackUserInfo();
  }

  ngOnInit(): void {
    this.faqID = this.id;
    this.ticketService.getTicket(this.faqID, this.courseid)
      .then((response) => {

        if (response === null) {
          this.errorMessage = $localize`:@@UKK ei löydy:
          Hakemaasi usein kysyttä kysymystä ei ole olemassa. Sen tekijä on voinut poistaa sen tai sinulla on virheellinen URL-osoite` + '.';
          return
        }

        this.ticket = response;
        this.titleServ.setTitle(this.store.getBaseTitle() + response.otsikko);
      })
      .catch(error => {
        this.errorMessage =
          $localize`:@@UKK näyttäminen epäonnistui:
              Usein kysytyn kysymyksen näyttäminen epäonnistui` + '.';
      })
      .finally(() => this.isLoaded = true );
  }

  editFaq() {
    let url = `/course/${this.courseid}/submit-faq/${this.faqID}`;
    this.router.navigate([url], { state: { editFaq: 'true' } });
  }

  changeArchiveButton() {
    setTimeout(() => this.isArchivePressed = true, 300);
  }

  archiveFaq() {
    this.isArchivePressed = false;
    this.ticketService.archiveFAQ(this.faqID, this.courseid).then(response => {
      this.router.navigateByUrl('course/' + this.courseid +  '/list-tickets');
    }).catch((error: Error) => {
      if (error.tunnus == 1003) {
        this.errorMessage = $localize `:@@:Ei oikeuksia:Sinulla ei ole riittäviä käyttäjäoikeuksia` + '.';
      } else {
        this.errorMessage = $localize `:@@UKK poisto epäonnistui:Usein kysytyn kysymyksen poistaminen ei onnistunut.`
      }
    })
  }

}
