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
import { NgxEditorModule } from 'ngx-editor';
import { ToBeginningButtonComponent } from './components/to-beginning-button/to-beginning-button.component';

@NgModule({
  declarations: [
    ErrorCardComponent,
    EditorComponent,
    ToBeginningButtonComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    NgxEditorModule.forRoot({
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
        text_color: $localize `:@@Tekstin väri:Tekstin väri`,

        // popups, forms, others...
        url: 'URL',
        text: $localize `:@@Teksti:Teksti`,
        openInNewTab: $localize `:@@Avaa uudessa välilehdessä:Avaa uudessa välilehdessä`,
        insert: $localize `:@@Lisää:Lisää`,
        remove: $localize `:@@Poista:Poista`,
      },
    }),
  ],
  exports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    ErrorCardComponent,
    EditorComponent,
    ToBeginningButtonComponent,
  ]
})
export class SharedModule { }
