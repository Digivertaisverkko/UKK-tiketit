import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Editor } from 'ngx-editor';
import { removeLink } from 'ngx-editor/commands';
import { isMarkActive } from 'ngx-editor/helpers';
import { LinkAttrs } from 'ngx-editor/lib/commands/Link';
import { toggleMark } from 'prosemirror-commands';
import { MarkType } from 'prosemirror-model';
import { Command, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import type { Dispatch } from 'ngx-editor/lib/commands/types';

@Component({
  selector: 'app-menu-link',
  templateUrl: './menu-link.component.html',
  styleUrls: ['./menu-link.component.scss']
})
export class MenuLinkComponent implements OnInit {
  @Input() editor!: Editor;

  public form: FormGroup;
  public isActive = false;
  public isDisabled = false;
  public showPopup = false;

  public get title(): string {
    return this.isActive
      ? $localize `:@@Poista linkki:Poista linkki`
      : $localize `:@@Lisää linkki:Lisää linkki`;
  }

  public get href(): AbstractControl {
    return this.form.get('href') as FormGroup;
  }

  public get text(): AbstractControl {
    return this.form.get('text') as FormGroup;
  }

  constructor(private el: ElementRef) {
    this.form = new FormGroup({
      href: new FormControl('', [Validators.required]),
      text: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.editor.update.subscribe((view) => this.update(view));
  }

  // Piilottaa avoinna olevan popupin, jos käyttäjä klikkaa hiirellä sen ulkopuolelta.
  @HostListener('document:mousedown', ['$event']) onDocumentClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target) && this.showPopup) {
      this.hideForm();
    }
  }

  private hideForm(): void {
    this.showPopup = false;
    this.form.reset({
      href: '',
      text: '',
    });
    this.text.enable();
  }

  public insertLink(e: MouseEvent): void {
    e.preventDefault();
    const { text, href } = this.form.getRawValue();
    const { dispatch, state } = this.editor.view;
    const { selection } = state;

    const attrs: LinkAttrs = {
      title: href,
      href,
      target: '_blank',
    };

    if (selection.empty) {
      this.insertLinkNew(text, attrs)(state, dispatch);
      this.editor.view.focus();
    } else {
      this.insertLinkUpdate(attrs)(state, dispatch);
    }
    this.hideForm();
  }

  private insertLinkNew(text: string, attrs: LinkAttrs): Command {
    return (state: EditorState, dispatch?: Dispatch): boolean => {
      const { schema, tr } = state;

      const type: MarkType = schema.marks['link'];
      if (!type) {
        return false;
      }

      const linkAttrs: LinkAttrs = {
        href: attrs.href,
        title: attrs.title ?? text,
        target: attrs.target,
      };

      const node = schema.text(text, [schema.marks['link'].create(linkAttrs)]);

      tr.replaceSelectionWith(node, false)
        .scrollIntoView();

      if (tr.docChanged) {
        dispatch?.(tr);
        return true;
      }

      return false;
    };
  }

  private insertLinkUpdate(attrs: LinkAttrs): Command {
    return (state: EditorState, dispatch?: Dispatch): boolean => {
      const { schema, selection } = state;

      const type: MarkType = schema.marks['link'];
      if (!type) {
        return false;
      }

      if (selection.empty) {
        return false;
      }

      return toggleMark(type, attrs)(state, dispatch);
    };
  }

  public onClick(e: MouseEvent): void {
    if (e.button !== 0) {
      return;
    }

    const { state, dispatch } = this.editor.view;

    if (this.isActive) {
      removeLink()(state, dispatch);
      return;
    }

    this.showPopup = !this.showPopup;
    if (this.showPopup) {
      this.setText();
    }
  }

  private setText = () => {
    const { state: { selection, doc } } = this.editor.view;
    const { empty, from, to } = selection;
    const selectedText = !empty ? doc.textBetween(from, to) : '';

    if (selectedText) {
      this.text.patchValue(selectedText);
      this.text.disable();
    }
  };

  private update = (view: EditorView) => {
    const { state } = view;
    const { schema } = state;
    this.isActive = isMarkActive(state, schema.marks['link']);
    this.isDisabled = !toggleMark(schema.marks['link'], {})(state, undefined);
  };

}
