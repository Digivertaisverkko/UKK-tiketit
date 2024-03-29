/* eslint-disable no-unused-vars */
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject,
        OnInit, ViewChild  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Sisältää sovelluksen tietosuojaselosteen. Tähän on linkki mm. footerista ja
 * register -komponentissa. Tämä on footer-komponentin lapsikomponentti.
 *
 * @export
 * @class PrivacyModalComponent
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.component.html',
  styleUrls: ['./privacy-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyModalComponent implements AfterViewInit, OnInit {

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild('dataRemoval') dataRemovalElement!: ElementRef;

  public _language!: string;

  constructor (
    public modalRef: MatDialogRef<PrivacyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this._language = localStorage.getItem('language') ?? 'fi-FI';
  }

  ngAfterViewInit(): void {
    if (!this.data) {
      this.dialogContent.nativeElement.scrollTop = 0;
    } else if (this.data.scrollToDataRemoval) {
      this.dataRemovalElement.nativeElement.scrollIntoView(
        { behavior: 'smooth', block: 'start', inline: 'nearest' }
      );
    }
  }

  public closeModal() {
    this.modalRef.close();
  }

}
