import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { isYesterday, isToday, getHash, getDateString } from '@shared/utils';
import { User } from '@core/core.models';
import { StoreService } from '@core/services/store.service';

const avatarColors : { [key: string]: string } = {
  '0': '#F44336',
  '1': '#E91E63',
  '2': '#9C27B0',
  '3': '#673AB7',
  '4': '#3F51B5',
  '5': '#2196F3',
  '6': '#03A9F4',
  '7': '#00BCD4',
  '8': '#009688',
  '9': '#4CAF50',
  'a': '#8BC34A',
  'b': '#CDDC39',
  'c': '#FFC107',
  'd': '#FF9800',
  'e': '#FF5722',
  'f': '#795548'
};

@Component({
  selector: 'app-sender-info',
  templateUrl: './sender-info.component.html',
  styleUrls: ['./sender-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SenderInfoComponent implements OnInit {

  // 'now' näyttää aikaleimaksi "Nyt".
  @Input() aikaleima: Date | 'now' = new Date;
  @Input() muokattu?: Date;
  @Input() user: User | null = {} as User;
  @Input() alignLeft: boolean = false;
  @Input() styles: any;
  public avatarColor: string = '';
  public userNameInitials = '';
  public isCreatedToday: boolean | undefined;
  public isCreatedYesterday: boolean | undefined;
  public isCreatedThisYear: boolean | undefined;
  public isEditedToday: boolean | undefined;
  public isEditedYesterday: boolean | undefined;
  public senderTitle: string = '';
  public createdString: string = '';
  private currentUserName: string | null;

  constructor(
      private change: ChangeDetectorRef,
      private store: StoreService) {
    this.currentUserName = this.store.getUserName();

  }

  ngOnInit() {
    this.userNameInitials = this.getInitials(this.user?.nimi);
    if (this.aikaleima !== 'now') {
      const thisYear = new Date().getFullYear();
      this.createdString = getDateString(this.aikaleima, thisYear);
    }

    if (this.muokattu instanceof Date) {
      this.isEditedToday = isToday(this.muokattu);
      if (!this.isEditedToday) {
        this.isEditedYesterday = isYesterday(this.muokattu);
      }
    }
    if (this.user != null) {
      this.senderTitle = this.getSenderTitle(this.user.nimi, this.user.asema);
    }

    getHash(this.user?.nimi ?? '').then(res => {
      // console.log(res.charAt(0));
      this.avatarColor = avatarColors[res.charAt(0)];
      // console.log('väri: ' + this.avatarColor);
      this.change.detectChanges();
    });

  }

  // Palauta nimen alkukirjaimet isolla (enintään 2 ensimmäistä).
  private getInitials(name: string | undefined): string {
    if (!name) return ''
    name = name.trim();
    const words: string[] = name.split(' ');
    if (words.length > 2) {
      (words.slice(0, 2));
    }
    return words
      .filter(element => element && element.length > 0)
      .map(element => element[0].toUpperCase())
      .join('');
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
