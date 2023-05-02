import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { minimalSetup } from 'codemirror';
import { javascript } from "@codemirror/lang-javascript"
import { Editor, marks, nodes as basicNodes, Toolbar } from 'ngx-editor';
import { node as codeMirrorNode, CodeMirrorView } from 'prosemirror-codemirror-6';
import { gapCursor } from 'prosemirror-gapcursor';
import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

const nodes = {
  ...basicNodes,
  code_mirror: codeMirrorNode,
}

const schema = new Schema({
  nodes,
  marks,
});

const nodeViews = {
  code_mirror: (node: ProseMirrorNode,
                view: EditorView,
                getPos: () => number): CodeMirrorView => {
    return new CodeMirrorView({
      node,
      view,
      getPos,
      cmOptions: {
        extensions: [
          minimalSetup,
          javascript(),
        ],
      },
    });
  },
};

@Component({
  selector: 'app-editor-legacy',
  templateUrl: './editor-legacy.component.html',
  styleUrls: ['./editor-legacy.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorLegacyComponent implements OnInit, OnDestroy {
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['image']
  ];

  @Input() disabled: boolean = false;
  @Input() editorContent: string = '';
  @Output() editorContentChange = new EventEmitter<string>();

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