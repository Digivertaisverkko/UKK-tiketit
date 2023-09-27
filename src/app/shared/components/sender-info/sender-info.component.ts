import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }
    from '@angular/core';

import AvatarColor32 from './sender-info.constants';
import { StoreService } from '@core/services/store.service';
import { User } from '@core/core.models';
import { UtilsService } from '@core/services/utils.service';

/**
 * Näyttää tiketin lähettäjän tiedot. Näihin kuuluu lähettäjän nimi, asema,
 * milloin tiketti on tehty ja muokattu sekä nimen ja roolin mukaan generoitu
 * avatar-ikoni.
 *
 * @export
 * @class SenderInfoComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-sender-info',
  templateUrl: './sender-info.component.html',
  styleUrls: ['./sender-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SenderInfoComponent implements OnInit {
  /**
   * Milloin tiketti on tehnty. 'now' näytää aikaleimaksi "Nyt" tai "Now".
   * @type {(Date | 'now')}
   * @memberof SenderInfoComponent
   */
  @Input() aikaleima: Date | 'now' = new Date;

  /**
   * Milloin tikettiä on muookattu
   * @type {(Date | null)}
   * @memberof SenderInfoComponent
   */
  @Input() muokattu?: Date | null;

  /**
   * Tiketin tehnyt käyttäjä.
   * @type {(User | null | undefined)}
   * @memberof SenderInfoComponent
   */
  @Input() user: User | null | undefined = {} as User;

  /**
   * Asemoidaanko käyttäjätiedot vasemmalle puolelle.
   * @type {boolean}
   * @memberof SenderInfoComponent
   */
  @Input() alignLeft: boolean = false;

  /**
   * Vapaavalintaisia SCSS-tyylejä.
   * @type {*}
   * @memberof SenderInfoComponent
   */
  @Input() styles?: any;

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
      private store: StoreService,
      private utils: UtilsService
      ) {
      this.avatarColor = { background: 'white', text: 'black' };
      this.currentUserName = this.store.getUserName();
  }

  ngOnInit() {
    this.userNameInitials = this.getInitials(this.user?.nimi);
    if (this.aikaleima !== 'now') {
      const thisYear = new Date().getFullYear();
      this.createdString = this.utils.getDateString(this.aikaleima, thisYear);
    }
    if (this.muokattu instanceof Date) {
      this.isEditedToday = this.utils.isToday(this.muokattu);
      if (!this.isEditedToday) {
        this.isEditedYesterday = this.utils.isYesterday(this.muokattu);
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
      this.utils.getColorIndex(this.user?.nimi, 32).then(index => {
        this.avatarColor = AvatarColor32[index];
        this.change.detectChanges();
      });
    }
  }

  /* Palauta nimen alkukirjaimet isolla. Jos koostuu yli kahdesta sanasta,
     palauta ensimmäinen ja viimeinen. */
  private getInitials(name: string | undefined): string {
    if (!name) return ''
    let words: string[] = name.trim().split(' ');
    if (words.length > 2) {
      const newWords: string[] = [];
      newWords.push(words[0]);
      newWords.push(words[words.length - 1]);
      words = newWords;
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
