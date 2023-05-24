import { marks, nodes as basicNodes } from 'ngx-editor';
import { node as codeMirrorNode } from 'prosemirror-codemirror-6';
import { Schema } from 'prosemirror-model';

const nodes = {
  ...basicNodes,
  code_mirror: codeMirrorNode,
}

const schema = new Schema({
  nodes,
  marks,
});

export default schema;
