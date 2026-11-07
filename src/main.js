import plugin from '../plugin.json';

const alert = acode.require('alert');
const prompt = acode.require('prompt');
const editorThemes = acode.require('editorThemes');

const THEME_ID = 'acode-the-box';

const C = {
  fg: '#eef3ff',
  bg: '#17181A',
  gutterFg: '#d6e0f5',
  gutterBg: '#1f2022',
  activeGutterFg: '#9FEF00',
  glow: '#7cffd6',
  cursor: '#7cffd6',
  selection: '#4d5360',
  selectedWord: 'rgba(118, 134, 184, 0.19)',
  activeLineBorder: '#4a525a',
  keyword: '#C77AFB',
  red: '#FF6565',
  green: '#9FEF00',
  orange: '#FFAF00',
  teal: '#7cffd6',
  yellow: '#ffdd7c',
  soft: '#d6e0f5',
  comment: '#646B78',
  commentBg: '#2B2D33',
};

function buildTheme() {
  const { cm, createTheme, createHighlightStyle } = editorThemes;
  const t = cm.tags;

  const highlight = createHighlightStyle([
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword], color: C.keyword },
    { tag: [t.definitionKeyword, t.modifier], color: C.red },
    { tag: [t.operator, t.operatorKeyword], color: C.red },
    { tag: [t.bool, t.null, t.atom], color: C.red },
    { tag: t.number, color: C.green },
    { tag: [t.string, t.special(t.string), t.regexp], color: C.green },
    { tag: t.escape, color: C.teal },
    {
      tag: [t.comment, t.lineComment, t.blockComment],
      color: C.comment,
      backgroundColor: C.commentBg,
      fontStyle: 'italic',
    },
    { tag: [t.variableName, t.propertyName], color: C.teal },
    { tag: t.special(t.variableName), color: C.yellow },
    { tag: t.constant(t.variableName), color: C.teal },
    {
      tag: [t.function(t.variableName), t.function(t.propertyName)],
      color: C.soft,
    },
    { tag: [t.typeName, t.className, t.namespace], color: C.orange },
    { tag: t.tagName, color: C.red },
    { tag: t.angleBracket, color: C.fg },
    { tag: t.attributeName, color: C.yellow, fontStyle: 'italic' },
    { tag: [t.paren, t.squareBracket, t.brace], color: C.soft },
    { tag: t.invalid, color: C.soft, backgroundColor: C.red },
  ]);

  return createTheme({
    dark: true,
    styles: {
      '&': { color: C.fg, backgroundColor: C.bg },
      '.cm-content': { caretColor: C.cursor },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: C.cursor },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: C.selection,
      },
      '.cm-selectionMatch': { backgroundColor: C.selectedWord },
      '.cm-gutters': {
        backgroundColor: C.gutterBg,
        color: C.gutterFg,
        border: 'none',
      },
      '.cm-activeLine': {
        backgroundColor: 'transparent',
        boxShadow: `inset 0 0 0 1px ${C.activeLineBorder}`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: C.activeGutterFg,
        textShadow: `0 0 2px ${C.glow}`,
      },
      '&.cm-focused .cm-matchingBracket, .cm-matchingBracket': {
        backgroundColor: 'transparent',
        outline: `1px solid ${C.fg}`,
      },
    },
    highlightStyle: highlight,
  });
}

class AcodePlugin {
  constructor() {
    this.isInitialized = false;
    this.localStorageKey = 'acode-the-box-installed';
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    editorThemes.register({
      id: THEME_ID,
      caption: 'Acode The Box',
      dark: true,
      getExtension: () => buildTheme(),
      config: {
        name: THEME_ID,
        dark: true,
        background: C.bg,
        foreground: C.fg,
        keyword: C.keyword,
        string: C.green,
        number: C.green,
        comment: C.comment,
        function: C.soft,
        variable: C.teal,
        type: C.orange,
        class: C.orange,
        constant: C.teal,
        operator: C.red,
        invalid: C.red,
      },
    });

    if (!localStorage.getItem(this.localStorageKey)) {
      await this.showSuccessAlert();
      await this.showCommentPrompt();
      localStorage.setItem(this.localStorageKey, 'true');
    }
  }

  destroy() {
    if (!this.isInitialized) return;
    this.isInitialized = false;
    editorThemes.unregister(THEME_ID);
  }

  showSuccessAlert() {
    return new Promise(resolve => {
      alert(
        'Acode The Box - SUCCESS INSTALLED',
        'This theme puts the focus on your code, no distractions or overly saturated colors that might look good in a preview, but in reality, burns your eyes after a day of coding.',
        () => resolve(),
      );
    });
  }

  async showCommentPrompt() {
    const userComment = await prompt('Leave a comment:', '', 'text', {
      required: true,
      placeholder: 'Enter your comment here',
    });

    if (userComment) {
      window.open(
        `https://acode.app/plugin/${plugin.id}/comments?comment=${encodeURIComponent(userComment)}`,
        '_blank',
      );
    }
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();

  acode.setPluginInit(plugin.id, () => {
    acodePlugin.init();
  });

  acode.setPluginUnmount(plugin.id, () => {
    localStorage.removeItem('acode-the-box-installed');
    acodePlugin.destroy();
  });
}
