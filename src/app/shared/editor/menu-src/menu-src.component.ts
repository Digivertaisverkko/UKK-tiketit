import { Component, Input, OnInit } from '@angular/core';
import { Editor } from 'ngx-editor';
import { isNodeActive } from 'ngx-editor/helpers';
import { setBlockType } from 'prosemirror-commands';
import { NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

@Component({
  selector: 'app-menu-src',
  templateUrl: './menu-src.component.html',
  styleUrls: ['./menu-src.component.scss'],
})
export class MenuSrcComponent implements OnInit {
  @Input() editor!: Editor;
  isActive = false;
  isDisabled = false;
  nodeType!: NodeType;

  public get title(): string {
    return $localize `:@@Koodilohko:Koodilohko`;
  }

  onClick(e: MouseEvent): void {
    e.preventDefault();
    const { state, dispatch } = this.editor.view;
    this.execute(state, dispatch);
  }

  execute(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
    const { doc, schema, selection, tr } = state;
    const { empty, from, to } = selection;

    if (this.isActive) {
      return setBlockType(schema.nodes['paragraph'])(state, dispatch);
    }

    if (!empty) {
      // Napataan kaikki teksti valinnan sisällä ja asetetaan rivinvaihto blokkien väliin.
      // Luodaan tästä tekstisisällöstä uusi node.
      // TODO: korvataan rivinvaihtomerkit blokinvaihdolla, jos koodiblokista vaihdetaan tekstikappaleeksi.
      const textContent = doc.textBetween(from, to, '\n');
      const textContentNode = schema.text(textContent);

      // Luodaan koodiblokkinode.
      // Käytetään teksisisältönodea pohjana, jotta saadaan siirrettyä valinnan tekstisisältö koodiblokin sisään.
      const { code_mirror } = state.schema.nodes;
      const codeNode = code_mirror.create(null, textContentNode);

      // Korvataan valittu alue uudella koodiblokkinodella.
      tr.replaceSelectionWith(codeNode, false).scrollIntoView();

      if (tr.docChanged) {
        dispatch?.(tr);
      }

      return true;
    }

    return setBlockType(schema.nodes['code_mirror'])(state, dispatch);
  }

  update = (view: EditorView): void => {
    const { state } = view;
    const { schema } = state;
    this.isActive = isNodeActive(state, schema.nodes['code_mirror']);
    this.isDisabled = !this.execute(state, undefined); // returns true if executable
  };

  ngOnInit(): void {
    this.editor.update.subscribe((view) => this.update(view));
  }
}
