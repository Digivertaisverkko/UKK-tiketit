import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';

import AvatarColor32 from './sender-info.constants';
import { isYesterday, isToday, getDateString } from '@shared/utils';
import { getColorIndex } from '@shared/utils';
import { StoreService } from '@core/services/store.service';
import { User } from '@core/core.models';

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
      /*
      this.senderTitle = this.user.nimi === this.currentUserName ? $localize`:@@Minä:Minä` :
      this.user.asemaStr ?? '';
      console.warn(this.user.asemaStr ); */
    }
    if (this.user?.nimi) {
      getColorIndex(this.user?.nimi, 32).then(index => {
        this.avatarColor = AvatarColor32[index];
        this.change.detectChanges();
      });
    }
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

  /* Palauta satunnainen hash-merkki, jota voi käyttää avatar-taustavärien
     testaamiseen. */
  private getRandomHashCharacter(): string {
    const characters = '0123456789ABCDEF';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
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
