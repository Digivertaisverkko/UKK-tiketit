import { StreamParser } from '@codemirror/language';
import { simpleMode } from '@codemirror/legacy-modes/mode/simple-mode';

const langGeneric: StreamParser<unknown> = simpleMode({
  // The start state contains the rules that are initially used
  start: [
    // The regex matches the token, the token property contains the type
    {
      regex: /["'](?:[^\\]|\\.)*?(?:["']|$)/,
      token: "string"
    },
    // Rules are matched in the order in which they appear, so there is
    // no ambiguity between this one and the one above
    // Currently added: C, C++, C#, Javascript, Python
    {
      regex: /(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|abstract|add|alias|alignas|alignof|and|and_eq|as|ascending|asm|assert|async|auto|await|base|bitand|bitor|bool|boolean|break|by|byte|case|catch|char|char16_t|char32_t|char8_t|checked|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|debugger|decimal|decltype|def|default|del|delegate|delete|descending|do|double|dynamic|dynamic_cast|elif|else|enum|equals|event|except|explicit|export|extends|extern|final|finally|fixed|float|for|foreach|friend|from|function|get|global|goto|group|if|implements|implicit|import|in|inline|instanceof|int|interface|internal|into|is|join|lambda|let|lock|long|match|mutable|nameof|namespace|native|new|noexcept|nonlocal|not|not_eq|notnull|nullptr|object|on|operator|or|or_eq|orderby|out|override|package|params|partial|pass|private|protected|public|raise|readonly|ref|register|reinterpret_cast|remove|requires|restrict|return|sbyte|sealed|select|set|short|signed|sizeof|stackalloc|static|static_assert|static_cast|strictfp|string|struct|super|switch|synchronized|template|this|thread_local|throw|throws|transient|try|typedef|typeid|typename|typeof|uint|ulong|unchecked|union|unmanaged|unsafe|unsigned|ushort|using|value|var|virtual|void|volatile|wchar_t|when|where|while|with|xor|xor_eq|yield)\b/,
      token: "keyword"
    },
    {
      regex: /true|True|TRUE|false|False|FALSE|none|None|NONE|null|undefined/,
      token: "atom"
    },
    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
      token: "number"
    },
    {
      regex: /\/\/.*/,
      token: "comment"
    },
    // A next property will cause the mode to move to a different state
    {
      regex: /\/\*/,
      token: "comment", next: "comment"
    },
    {
      regex: /[-+\/*=<>!]+/,
      token: "operator"
    },
    // indent and dedent properties guide autoindentation
    {
      regex: /[\{\[\(]/,
      indent: true
    },
    {
      regex: /[\}\]\)]/,
      dedent: true
    }
  ],
  // The multi-line comment state.
  comment: [
    {
      regex: /.*?\*\//,
      token: "comment",
      indent: false,
      dedent: false,
      next: "start"
    },
    {
      regex: /.*/,
      indent: false,
      dedent: false,
      token: "comment"
    }
  ],
  // The languageData property contains global information about the mode.
  languageData: {
    name: "generic",
    commentTokens: {line: "//", block: {open: "/*", close: "*/"}}
  }
});

export default langGeneric;
