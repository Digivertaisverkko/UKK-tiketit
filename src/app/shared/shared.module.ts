/* This file is to declare components, directives, and pipes when those
 * items will be re-used and referenced by the components declared in other
 * feature modules. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { ErrorCardComponent } from './error-card/error-card.component';
import { EditorComponent } from './editor/editor.component';
import { NgxEditorConfig, NgxEditorModule, NGX_EDITOR_CONFIG_TOKEN } from 'ngx-editor';
import { ToBeginningButtonComponent } from './components/to-beginning-button/to-beginning-button.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { CustomMenuComponent } from './editor/custom-menu/custom-menu.component';

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
      insertLink: $localize `:@@Lisää linkki:Lisää linkki`,
      removeLink: $localize `:@@Poista linkki:Poista linkki`,

      // popups, forms, others...
      url: 'URL',
      text: $localize `:@@Teksti:Teksti`,
      openInNewTab: $localize `:@@Avaa uudessa välilehdessä:Avaa uudessa välilehdessä`,
      insert: $localize `:@@Lisää:Lisää`,
      remove: $localize `:@@Poista:Poista`,
    },
  };
}

@NgModule({
  declarations: [
    ErrorCardComponent,
    EditorComponent,
    CustomMenuComponent,
    ToBeginningButtonComponent,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    NgxEditorModule.forRoot(),
  ],
  exports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    ErrorCardComponent,
    EditorComponent,
    CustomMenuComponent,
    ToBeginningButtonComponent,
    SafeHtmlPipe,
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
