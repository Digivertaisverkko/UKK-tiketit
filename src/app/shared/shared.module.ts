/* This file is to declare components, directives, and pipes when those
 * items will be re-used and referenced by the components declared in other
 * feature modules. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { ErrorCardComponent } from './error-card/error-card.component';
import { EditorComponent } from './editor/editor.component';
import { EditorLegacyComponent } from './editor-legacy/editor-legacy.component';
import { NgxEditorConfig, NgxEditorModule, NGX_EDITOR_CONFIG_TOKEN } from 'ngx-editor';
import { BeginningButtonComponent } from './components/beginning-button/beginning-button.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { MenuLinkComponent } from './editor/menu-link/menu-link.component';
import { MenuSrcComponent } from './editor/menu-src/menu-src.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { HeadlineComponent } from './components/headline/headline.component';
import { SenderInfoComponent } from './components/sender-info/sender-info.component';

export function ngxEditorConfigFactory(): NgxEditorConfig {
  return {
    locals: {
      // menu
      bold: $localize `:@@Lihavoi:Lihavoi`,
      italic: $localize `:@@Kursivoi:Kursivoi`,
      code: $localize `:@@Koodi:Koodi`,
      blockquote: $localize `:@@Lohkolainaus:Lohkolainaus`,
      underline: $localize `:@@Alleviivaa:Alleviivaa`,
      strike: $localize `:@@Yliviivaa:Yliviivaa`,
      bullet_list: $localize `:@@Bullettilista:Bullettilista`,
      ordered_list: $localize `:@@Järjestetty lista:Järjestetty lista`,

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

@NgModule({
  declarations: [
    ErrorCardComponent,
    EditorComponent,
    EditorLegacyComponent,
    HeadlineComponent,
    MenuLinkComponent,
    MenuSrcComponent,
    BeginningButtonComponent,
    SafeHtmlPipe,
    SearchBarComponent,
    SenderInfoComponent
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
    FormsModule,
    MaterialModule,
    HeadlineComponent,
    ErrorCardComponent,
    EditorComponent,
    EditorLegacyComponent,
    MenuLinkComponent,
    MenuSrcComponent,
    BeginningButtonComponent,
    SafeHtmlPipe,
    ReactiveFormsModule,
    SearchBarComponent,
    SenderInfoComponent,
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
