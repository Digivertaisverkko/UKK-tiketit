import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TicketService } from '../../ticket.service';
import { User } from 'src/app/core/auth.service';

interface FileInfo {
  filename: string;
  file: File;
  error?: string;
  errorToolTip?: string;
  progress?: number;
  uploadError?: string;
  done?: boolean;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent {

  @Input() public oldCommentfileInfoList: FileInfo[] = [];
  @Input() public user: User = {} as User;
  @Input() public ticketID: string = '';
  public attachFilesText: string = '';
  public editingComment: string | null = null;
  private readonly CURRENT_DATE = new Date().toDateString();
  public readonly proposedSolution = $localize `:@@Ratkaisuehdotus:Ratkaisuehdotus`;

  constructor(
    private ticketService: TicketService
    ) {}

  public cancelCommentEditing() {
    this.editingComment = null;
  }

  public editComment(commentID: string) {
    this.editingComment = commentID;
  }

  public getSenderTitle(name: string, role: string): string {
    if (name == this.user.nimi) return $localize`:@@Minä:Minä`
    switch (role) {
      case 'opiskelija':
        return $localize`:@@Opiskelija:Opiskelija`; break;
      case 'opettaja':
        return $localize`:@@Opettaja:Opettaja`; break;
      case 'admin':
        return $localize`:@@Admin:Admin`; break;
      default:
        return '';
    }
  }

    // Onko annettu aikaleima tänään.
    public isToday(timestamp: string | Date) : boolean {
      if (typeof timestamp === 'string') {
        var dateString = new Date(timestamp).toDateString();
      } else {
        var dateString = timestamp.toDateString();
      }
      // console.log(' vertaillaan: ' + dateString + ' ja ' + this.currentDate);
      return dateString == this.CURRENT_DATE ? true : false
    }

    public sendEditedComment(commentID: string, commentText: string) {
      this.ticketService.editComment(this.ticketID, commentID, commentText)
        .then(response => {

        }).catch(err => {
          console.log('Kommentin muokkaaminen epäonnistui.');
        }).finally(() => {
          this.editingComment = null;
          // this.fetchTicket(this.courseID);
        })
      console.log('sending');
    }

}
