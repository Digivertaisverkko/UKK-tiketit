import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { isToday } from '@shared/utils';
import { User } from '@core/core.models';
import { StoreService } from '@core/services/store.service';

@Component({
  selector: 'app-sender-info',
  templateUrl: './sender-info.component.html',
  styleUrls: ['./sender-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SenderInfoComponent implements OnInit {

  @Input() aikaleima: string | Date | 'now' = '';
  @Input() user: User | null = {} as User;
  @Input() alignLeft: boolean = false;
  @Input() styles: any;
  public isItToday: boolean;
  public nyt = $localize `:@@Nyt:Nyt`;
  public senderTitle: string = '';
  private currentUserName: string | null;

  constructor(private store: StoreService) {
    this.currentUserName = this.store.getUserName();
    this.isItToday = isToday(this.aikaleima);
  }

  ngOnInit() {
    if (this.user != null) {
      this.senderTitle = this.getSenderTitle(this.user.nimi, this.user.asema);
    }
  }

  private getSenderTitle(name: string, role: string | null): string {
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
