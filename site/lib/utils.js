import MarkdownIt from 'markdown-it';
import MarkdownItDecorate from 'markdown-it-decorate';
import highlight from 'highlight.js/lib/highlight';
import lJavascript from 'highlight.js/lib/languages/javascript';
import lCss from 'highlight.js/lib/languages/css';
import lXml from 'highlight.js/lib/languages/xml';
import lBash from 'highlight.js/lib/languages/bash';

highlight.registerLanguage('bash', lBash);
highlight.registerLanguage('css', lCss);
highlight.registerLanguage('javascript', lJavascript);
highlight.registerLanguage('xml', lXml);

window.highlight = highlight;

const marked = MarkdownIt({
    html: true,
    breaks: false 
}).use(MarkdownItDecorate);
// 去掉段落softbreak
marked.renderer.rules.softbreak = () => '';

export {highlight, marked};
