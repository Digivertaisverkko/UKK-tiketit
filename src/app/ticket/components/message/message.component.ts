import { Component, Input, OnInit } from '@angular/core';
import { highlightTree } from '@lezer/highlight';
import { defaultHighlightStyle, Language, StreamLanguage } from '@codemirror/language';
import { StyleModule } from 'style-mod';

import langGeneric from '@shared/editor/lang-generic/lang-generic';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() messageHtml: string = '';
  public html: string = '';

  // Tämä funktio lisää syntaksin korostamisen halutulle lähdekoodin pätkälle halutulla kielellä.
  // highlightTree käy läpi lähdekoodin ja lisää siihen halutut teeman mukaiset <span> tagit luokkineen.
  // Vaatii lisäksi toimiakseen luokkien teeman CSS:t, jotka ovat tällä hetkellä styles.scss -tiedostossa.
  // Ref: https://discuss.codemirror.net/t/static-highlighting-using-cm-v6/3420/2
  private highlightCode(textContent: string, language: Language): string {
    const tree = language.parser.parse(textContent);
    let pos = 0;
    let hilightedCode = '';
    highlightTree(tree, defaultHighlightStyle, (from, to, classes) => {
      if (from > pos) {
        hilightedCode += textContent.slice(pos, from);
        console.log(hilightedCode);
      }
      hilightedCode += `<span class="${classes}">${textContent.slice(from, to)}</span>`;
      pos = to;
    });
    if (pos !== tree.length) {
      hilightedCode += textContent.slice(pos, tree.length);
    }
    return hilightedCode;
  }

  // Lisää syntaksin korostuksen kaikkiin viestissä oleviin <code> tageihin.
  // TODO: toimii tällä hetkellä ainoastaan javascriptillä
  private highlightCodeTags(textContent: string): string {
    let parser = new DOMParser();
    const doc = parser.parseFromString(textContent, 'text/html');
    let elements = doc.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].tagName === 'CODE') {
        let newElement = doc.createElement('CODE');
        newElement.innerHTML = this.highlightCode(elements[i].innerHTML, StreamLanguage.define(langGeneric));
        elements[i].replaceWith(newElement);
      }
    }
    return doc.documentElement.innerHTML;
  }

  ngOnInit(): void {
    StyleModule.mount(document, defaultHighlightStyle.module!);
    this.html = this.highlightCodeTags(this.messageHtml);
  }

}
