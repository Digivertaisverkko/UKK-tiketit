import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { AuthService, User } from 'src/app/core/auth.service';
import { isToday } from 'src/app/shared/utils';

@Component({
  selector: 'app-sender-info',
  templateUrl: './sender-info.component.html',
  styleUrls: ['./sender-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SenderInfoComponent implements OnInit {

  @Input() aikaleima: string | Date = '';
  @Input() user: User | null = {} as User;

  public isItToday: boolean;
  public senderTitle: string = '';
  private currentUserName: string | null;

  constructor(private auth: AuthService) {
    this.currentUserName = this.auth.getUserName();
    this.isItToday = isToday(this.aikaleima);
  }

  ngOnInit() {
    if (this.user != null) {
      this.senderTitle = this.getSenderTitle(this.user.nimi, this.user.asema);
    }
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
