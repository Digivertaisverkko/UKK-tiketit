import { Component, Input, OnDestroy, OnInit, Optional, Self, ViewEncapsulation
    } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormGroupDirective, NgControl
    } from '@angular/forms';
import { minimalSetup } from 'codemirror';
import { StreamLanguage } from "@codemirror/language";
import { Editor, Toolbar } from 'ngx-editor';
import { CodeMirrorView } from 'prosemirror-codemirror-6';
import { gapCursor } from 'prosemirror-gapcursor';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

import schema from './schema';
import langGeneric from './lang-generic/lang-generic';

export const NOOP_VALUE_ACCESSOR: ControlValueAccessor = {
  writeValue(): void {},
  registerOnChange(): void {},
  registerOnTouched(): void {}
};

const nodeViews = {
  code_mirror: (node: ProseMirrorNode,
                view: EditorView,
                getPos: () => number | undefined): CodeMirrorView => {
    return new CodeMirrorView({
      node,
      view,
      getPos,
      cmOptions: {
        extensions: [
          minimalSetup,
          StreamLanguage.define(langGeneric),
        ],
      },
    });
  },
};

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [{
    provide: ControlContainer,
    useExisting: FormGroupDirective
  }]
})
export class EditorComponent implements OnInit, OnDestroy {
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote'],
    ['ordered_list', 'bullet_list'],
    ['image']
  ];

  @Input() formControlName: string = '';

  constructor(@Self() @Optional() public ngControl: NgControl) {
    if (this.ngControl) this.ngControl.valueAccessor = NOOP_VALUE_ACCESSOR;
  }

  ngOnInit(): void {
    this.editor = new Editor({
      schema,
      nodeViews,
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
      attributes: { enterkeyhint: 'enter' },
      features: {
        linkOnPaste: true,
        resizeImage: true,
      },
      plugins: [
        gapCursor(),
      ],
    });
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
