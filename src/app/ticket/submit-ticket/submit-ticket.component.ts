import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Event, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { UusiTiketti, TicketService } from '../ticket.service';
import { getIsInIframe } from '../functions/isInIframe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})

export class SubmitTicketComponent implements OnInit {
  // max pituus: 255.
  titleText: string = '';
  assignmentText: string = '';
  public courseName: string = '';
  public errorMessage: string = '';
  // public user: User;
  public isInIframe: boolean;
  problemText: string = '';
  newTicket: UusiTiketti = {} as UusiTiketti;
  public userName: string | null = '';
  userRole: string = '';
  answer: string = '';
  sendingIsAllowed: boolean = false;
  public currentDate = new Date();
  // public user$ = this.auth.trackUserInfo();
  public message: string = '';
  private courseID: string | null;

  // Liitetiedostot

  public fileList: File[] = [];
  public fileNameList: string[] = [];
  // public fileNameList: any = ['Kommentti.svg', 'Kasittelyssa.svg', 'Ratkaisu_64.svg'];
  public noAttachmentsMessage = $localize `:@@Ei liitetiedostoa:Ei liitetiedostoa` + '.';
  // @ViewChild('attachments') attachment: any;
  
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private _snackBar: MatSnackBar
    ) {
      this.courseID = this.route.snapshot.paramMap.get('courseid');
      this.isInIframe = getIsInIframe();
    }

  ngOnInit(): void {
    if (this.courseID === null) { throw new Error('Ei kurssi ID:ä.')}
    this.auth.fetchUserInfo(this.courseID);
    this.auth.trackUserInfo().subscribe(response => {
      this.userName = response?.nimi ?? '';
      this.userRole = response?.asema ?? '';
    })
    this.ticketService.getCourseName(this.courseID).then(response => {
      this.courseName = response;
    }).catch(() => {});
  }

  public onFileChanged(event: any) {
    for (let file of event.target.files) {
      if (this.fileNameList.includes(file.name)) continue;
      this.fileList.push(file);
      console.log(this.fileList);
      this.fileNameList.push(file.name);
    }
    // this.attachment.nativeElement.value = '';
    // console.log('Tiedostolista:');
    // console.dir(this.fileList);
  }

  public removeSelectedFile(index: number) {
    this.fileList.splice(index, 1);
    this.fileNameList.splice(index, 1);
  }

  // public onSingleFileSelected(event: any) {
  //   const file: File = event.target?.files[0];
  //   if (file) {
  //     this.fileName = file.name;
  //     const formData = new FormData();
  //     formData.append("attachment", file);
  //   }
  // }

  public sendTicket(): void {
    this.newTicket.otsikko = this.titleText;
    this.newTicket.viesti = this.message;
    this.newTicket.kentat = [{ id: 1, arvo: this.assignmentText }, { id: 2, arvo: this.problemText }];
    if (this.courseID == null) { throw new Error('Ei kurssi ID:ä.')}
    var formData: FormData | null = null;
    if (this.fileList.length > 0) {
      formData = new FormData();
      console.log('Liitetään tiedosto formDataan (alla): ');
      console.dir(this.fileList[0]);
      formData.append('tiedosto', this.fileList[0]);
      // TODO: lisää useamman tiedoston lähetys.
    }
    // console.log(JSON.stringify(formData));
    // if (formData != null) {
    //   console.log('formDatan iterointi:');
    //   for (const [key, value] of formData.entries()) {
    //     console.log(`${key}: ${value}`);
    //   }
    // } else {
    //   console.error('formData on null');
    // }
    this.ticketService.addTicket(this.courseID, this.newTicket, formData)
      .then(() => this.goBack()
      ).catch( error => {
        // TODO: lisää eri virhekoodeja?
        this.errorMessage = $localize`:@@Kysymyksen lähettäminen epäonnistui:Kysymyksen lähettäminen epäonnistui` + '.'
      });
  }

  private goBack() {
    this.router.navigateByUrl('course/' + this.courseID + '/list-tickets');
  }

}
