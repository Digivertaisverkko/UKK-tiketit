import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TicketService, Ticket } from '../ticket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth.service';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit, OnDestroy  {
  public errorMessage: string = '';
  ticket: Ticket;
  tila: string;
  public newCommentState: 3 | 4 | 5 = 4;
  // tila: typeof Tila | typeof State;
  commentText: string;
  isLoaded: boolean;
  public proposedSolution = $localize `:@@Ratkaisuehdotus:Ratkaisuehdotus`;
  ticketID: string;
  private timeInterval: Subscription = new Subscription();

  // messageSubscription: Subscription;
  message: string = '';
  public userRole: 'opettaja' | 'opiskelija' | 'admin' | '' = '';

  constructor(
    private auth: AuthService,
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar
    ) {
      this.ticket = {} as Ticket;
      this.tila = '';
      this.commentText = '';
      this.isLoaded = false;
      this.ticketID = String(this.route.snapshot.paramMap.get('id'));
      // this.messageSubscription = this.ticketService.onMessages().subscribe(
      //   (message) => { this._snackBar.open(message, 'OK') });
  }

  ngOnInit(): void {
    this.trackUserRole();
    this.timeInterval = interval(60000)
      .pipe(
        startWith(0),
        switchMap(() => this.ticketService.getTicketInfo(this.ticketID))
      ).subscribe({
        next: response => {
          this.ticket = response;
          this.tila = this.ticketService.getTicketState(this.ticket.tila);
          this.isLoaded = true;
        },
        error: error => {
          this.errorMessage = $localize`:@@Ei oikeutta kysymykseen:Sinulla ei ole lukuoikeutta tähän kysymykseen.`;
          this.isLoaded = true;
        }
      })
  }

  public ngOnDestroy(): void {
    this.timeInterval.unsubscribe();
  }

  private trackUserRole() {
    this.auth.onGetUserRole().subscribe(response => {
      // console.log('saatiin rooli: ' + response);
      this.userRole = response;
    })
  }

  public getCommentState(tila: number) {
    return this.ticketService.getTicketState(tila);
  }

  public sendComment(): void {
    this.ticketService.addComment(this.ticketID, this.commentText, this.newCommentState)
      .then((response) => { 
        if (response?.success == true) {
          this.errorMessage = '';
          this.ticketService.getTicketInfo(this.ticketID).then(response => { this.ticket = response });
          // this._snackBar.open($localize `:@@Kommentin lisääminen:Kommentin lisääminen tikettiin onnistui.`, 'OK');
        } else {
          this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`;
          console.log(response);
        }
      })
      .then( () => { this.commentText = '' } )
      .catch(error => {
        //console.dir(error);
        this.errorMessage = $localize `:@@Kommentin lisääminen epäonistui:Kommentin lisääminen tikettiin epäonnistui.`;
        console.log(JSON.stringify(error));
      });
  }


}
