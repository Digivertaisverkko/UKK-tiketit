import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Kurssilainen } from 'src/app/ticket/ticket.service';
import { isToday } from 'src/app/shared/utils';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-sender-info',
  templateUrl: './sender-info.component.html',
  styleUrls: ['./sender-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SenderInfoComponent {

  @Input() aikaleima: string = '';
  @Input() user: Kurssilainen = {} as Kurssilainen;

  public isItToday: boolean;
  public senderName: string;
  private currentUserName: string | null;

  constructor(private auth: AuthService) {
    this.currentUserName = this.auth.getUserName();
    this.isItToday = isToday(this.aikaleima);
    this.senderName = this.getSenderTitle(this.user.nimi, this.user.asema);
  }

  public getSenderTitle(name: string, role: string): string {
    if (name == this.currentUserName) return $localize`:@@Minä:Minä`
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

}
