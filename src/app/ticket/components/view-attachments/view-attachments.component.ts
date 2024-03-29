import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter }
    from '@angular/core';
import { Liite } from '@ticket/ticket.models';
import { TicketService } from '@ticket/ticket.service';

/**
 * Näyttää listan liitetiedostoista. Tiedostoja pystyy lataamaan klikkaamalla.
 * Liitteiden lisääminen tapahtuu edit-attachments -komponentilla.
 *
 * @export
 * @class ViewAttachmentsComponent
 */
@Component({
  selector: 'app-view-attachments',
  template: `
    <div class="attachments-wrapper">
      <button aria-label="Lataa liitetiedosto"
              class="attachment"
              (click)="downloadFile(ticketID, file.kommentti, file.tiedosto, file.nimi)"
              [attr.data-testid]="'download-button-' + i"
              i18n-aria-label="@@Lataa liitetiedosto"
              matTooltip="{{file.nimi}}"
              [matTooltipShowDelay]="600"
              *ngFor="let file of files; let i = index"
              >
          <span class="filename" [attr.data-testid]="'filename-' + i">
            {{file.nimi}}
          </span>
          &nbsp;
          <div class="filesize">
            ({{ file.koko | filesize : { locale: 'fi', round: 1,
                separator: ",", pad: true } }})
          </div>
          <mat-icon aria-hidden="true">download</mat-icon>
      </button>
    </div>`,

  styleUrls: ['./view-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewAttachmentsComponent {

  @Input() courseid: string = '';
  @Input() files: Liite[] = [];
  @Input() ticketID: string = '';
  @Output() errorMessage = new EventEmitter<string>();

  constructor(private tickets: TicketService) {}

  public downloadFile(ticketID: string, commentID: string, fileID: string,
      filename: string) {
    if (!this.courseid) {
      console.error('Ei kurssi ID:ä.')
      return
    }
    this.tickets.getFile(ticketID, commentID, fileID, this.courseid).then(response => {
      if (response instanceof Blob) {
        this.savefile(response, filename);
      }
    }).catch(error => {
      const errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:
          Tiedoston lataaminen epäonnistui` + '.';
      this.errorMessage.emit(errorMessage);
    })
  }

  private savefile(file: Blob, filename: string) {
    const blob = new Blob([file], { type: 'application/octet-stream' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
