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
  @Input() muokattu?: Date;
  @Input() user: User | null = {} as User;
  @Input() alignLeft: boolean = false;
  @Input() styles: any;
  public isCreatedToday: boolean | undefined;
  public isEditedToday: boolean | undefined;
  public senderTitle: string = '';
  private currentUserName: string | null;

  constructor(private store: StoreService) {
    console.log('aikaleima: ' + this.aikaleima);
    this.currentUserName = this.store.getUserName();

  }

  ngOnInit() {
    this.isCreatedToday = isToday(this.aikaleima);
    if (this.muokattu) {
      this.isEditedToday = isToday(this.muokattu);
    }
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