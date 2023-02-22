import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { TicketService, Liite } from '../../ticket.service';

@Component({
  selector: 'app-view-attachments',
  template: `
    <div class="attachments-wrapper">
      <button class="attachment" *ngFor="let file of files; let i = index"
        (click)="downloadFile(ticketID, file.kommentti, file.tiedosto, file.nimi)"
          matTooltip="{{file.nimi}}" [matTooltipShowDelay]="600">
          <div class="filename">{{file.nimi}}</div><mat-icon>download</mat-icon>
      </button>
    </div>`,

  styleUrls: ['./view-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewAttachmentsComponent {

  @Input() files: Liite[] = [];
  @Input() ticketID: string = '';
  @Output() errorMessage = new EventEmitter<string>();

  constructor(private ticketService: TicketService) {}

  public downloadFile(ticketID: string, commentID: string, fileID: string, filename: string)
  {
    // console.log(' tiketin ID: ' + ticketID);
    // console.log(' kommentti ID: ' + commentID);
    // console.log(' tiedoston ID: ' + fileID);
    // console.log(' tiedoston nimi: ' + filename);
    this.ticketService.getFile(ticketID, commentID, fileID).then(response => {
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(error => {
      const errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:Tiedoston lataaminen epäonnistui` + '.';
      this.errorMessage.emit(errorMessage);
    })
  }

}
