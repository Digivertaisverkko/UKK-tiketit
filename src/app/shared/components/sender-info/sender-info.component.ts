import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { isYesterday, isToday, getHash, getDateString } from '@shared/utils';
import { User } from '@core/core.models';
import { StoreService } from '@core/services/store.service';

const AvatarColors: { [key: string]: { background: string; text: string } } = {
  '0': { background: '#F44336', text: '#FFFFFF' },
  '1': { background: '#E91E63', text: '#FFFFFF' },
  '2': { background: '#9C27B0', text: '#FFFFFF' },
  '3': { background: '#673AB7', text: '#FFFFFF' },
  '4': { background: '#3F51B5', text: '#FFFFFF' },
  '5': { background: '#2196F3', text: '#000000' },
  '6': { background: '#03A9F4', text: '#000000' },
  '7': { background: '#00BCD4', text: '#000000' },
  '8': { background: '#009688', text: '#000000' },
  '9': { background: '#4CAF50', text: '#000000' },
  'A': { background: '#8BC34A', text: '#000000' },
  'B': { background: '#CDDC39', text: '#000000' },
  'C': { background: '#FFC107', text: '#000000' },
  'D': { background: '#FF9800', text: '#000000' },
  'E': { background: '#FF5722', text: '#FFFFFF' },
  'F': { background: '#795548', text: '#FFFFFF' }
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
  public avatarColor: { background: string; text: string };
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
      this.avatarColor = { background: 'white', text: 'black' };
      this.currentUserName = this.store.getUserName();
  }

  ngOnInit() {
    console.log(this.avatarColor);
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

    getHash(this.user?.nimi ?? '').then(hash => {
      // console.log(res.charAt(0));
      console.log('res: ' + hash);
      const firstChar = hash.charAt(0).toUpperCase();
      console.log(firstChar);
      this.avatarColor = AvatarColors[firstChar];
      console.log('väri: ' + this.avatarColor);
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
