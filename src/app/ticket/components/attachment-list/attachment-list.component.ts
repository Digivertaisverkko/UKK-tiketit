import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TicketService, Liite } from '../../ticket.service';

@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachmentListComponent {

  @Input() files: Liite[] = [];
  @Input() ticketID: string = '';

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
      // this.errorMessage = "Tiedoston lataaminen epäonnistui";
    })
  }

}
