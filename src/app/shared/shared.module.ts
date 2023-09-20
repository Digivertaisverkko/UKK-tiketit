import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilesizeModule } from './pipes/filesize.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';

import { ErrorComponent } from './error/error.component';
import { EditorComponent } from './editor/editor.component';
import { NgxEditorConfig, NgxEditorModule, NGX_EDITOR_CONFIG_TOKEN } from 'ngx-editor';
import { BeginningButtonComponent } from './components/beginning-button/beginning-button.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { MenuLinkComponent } from './editor/menu-link/menu-link.component';
import { MenuSrcComponent } from './editor/menu-src/menu-src.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { HeadlineComponent } from './components/headline/headline.component';
import { SenderInfoComponent } from './components/sender-info/sender-info.component';
import { SuccessComponent } from './components/success/success.component';
import { RefreshDialogComponent } from './components/refresh-dialog/refresh-dialog.component';

export function ngxEditorConfigFactory(): NgxEditorConfig {
  return {
    locals: {
      // menu
      bold: $localize `:@@Lihavoi:Lihavoi`,
      italic: $localize `:@@Kursivoi:Kursivoi`,
      blockquote: $localize `:@@Lohkolainaus:Lohkolainaus`,
      underline: $localize `:@@Alleviivaa:Alleviivaa`,
      strike: $localize `:@@Yliviivaa:Yliviivaa`,
      bullet_list: $localize `:@@Bullettilista:Bullettilista`,
      ordered_list: $localize `:@@Järjestetty lista:Järjestetty lista`,
      insertImage: $localize `:@@Lisää kuva:Lisää kuva`,

      // popups, forms, others...
      url: 'URL',
      text: $localize `:@@Teksti:Teksti`,
      title: $localize `:@@Otsikko:Otsikko`,
      altText: $localize `:@@Vaihtoehtoinen teksti:Vaihtoehtoinen teksti`,
      insert: $localize `:@@Lisää:Lisää`,
      remove: $localize `:@@Poista:Poista`,
    },
  };
}

/** Sisältää ominaisuuksia, joita käytetään muissa moduuleissa. Yleisten Material -
 * -teemaan kuuluvien moduulien tuonti on jaettu omaksi material.module -tiedostoksi.
 * Tänne ei tule laittaa servicejä, vaan ne ovat joko core tai feature-moduuleissa.
 * Sisällytä declarations -kohdassa ilmoitetut kohdat myös exports -taulukkoon.
 *
 * @export
 * @class SharedModule
 */
@NgModule({
  declarations: [
    ErrorComponent,
    EditorComponent,
    HeadlineComponent,
    MenuLinkComponent,
    MenuSrcComponent,
    BeginningButtonComponent,
    RefreshDialogComponent,
    SafeHtmlPipe,
    SearchBarComponent,
    SenderInfoComponent,
    SuccessComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxEditorModule.forRoot(),
  ],
  exports: [
    CommonModule,
    BrowserAnimationsModule,
    FilesizeModule,
    FormsModule,
    MaterialModule,
    HeadlineComponent,
    ErrorComponent,
    EditorComponent,
    MenuLinkComponent,
    MenuSrcComponent,
    BeginningButtonComponent,
    SafeHtmlPipe,
    ReactiveFormsModule,
    RefreshDialogComponent,
    SearchBarComponent,
    SenderInfoComponent,
    SuccessComponent
  ],
  providers: [
    {
      useFactory: ngxEditorConfigFactory,
      provide: NGX_EDITOR_CONFIG_TOKEN,
      deps: [],
    }
  ]
})
export class SharedModule { }
