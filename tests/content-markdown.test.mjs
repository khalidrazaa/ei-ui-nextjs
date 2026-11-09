import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';

// Transpiles a TS/TSX source file and evaluates it. `deps` maps import specifiers
// (such as the "@/" alias) to already-loaded modules; react is always available.
async function load(relative,deps={}){
  const source=await readFile(new URL(relative,import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const context={exports:{},URL,require:n=>deps[n]??(n==='react'?React:jsx)};
  vm.runInNewContext(code,context);
  return context.exports;
}
const headings=await load('../src/lib/headings.ts');
const images=await load('../src/lib/markdownImages.ts');
const articleImage=await load('../src/components/articles/ArticleImage.tsx');
const {default:Markdown,parseFlow,safeHref}=await load('../src/components/articles/ArticleBody.tsx',{
  '@/lib/headings':headings,'@/lib/markdownImages':images,'@/components/articles/ArticleImage':articleImage,
});
const render=content=>renderToStaticMarkup(React.createElement(Markdown,{content}));

test('renders tables, numbered lists and safe citations',()=>{
  const html=renderToStaticMarkup(React.createElement(Markdown,{content:'| Choice | Cost |\n| --- | --- |\n| Warehouse | Variable |\n\n1. Gather evidence\n2. Review\n\n[Docs](https://example.com)'}));
  assert.match(html,/<table/);assert.match(html,/<ol/);assert.match(html,/href="https:\/\/example.com"/);
});
test('renders supported flow without injecting executable HTML',()=>{
  const html=renderToStaticMarkup(React.createElement(Markdown,{content:'```mermaid\nflowchart TD\nA[Sources] -->|Daily| B[Warehouse]\nB --> C[Managers]\n```'}));
  assert.match(html,/<svg/);assert.match(html,/<figcaption/);assert.match(html,/Daily/);
  assert.equal(parseFlow('flowchart TD\nclick A "javascript:alert(1)"'),null);
});
test('unsafe links and raw scripts are not executed',()=>{
  assert.equal(safeHref('javascript:alert(1)'),undefined);
  assert.equal(safeHref('//evil.example'),undefined);
  const html=renderToStaticMarkup(React.createElement(Markdown,{content:'<script>alert(1)</script>\n\n[bad](javascript:alert)'}));
  assert.doesNotMatch(html,/<script|href="javascript/);assert.match(html,/&lt;script/);
});
test('h2 and h3 get ids that match the table of contents',()=>{
  const content='## The loop\n\nText\n\n### A tiny example\n\nMore\n\n## The loop\n\nAgain';
  const html=renderToStaticMarkup(React.createElement(Markdown,{content}));
  const ids=Array.from(headings.extractHeadings(content),h=>h.id);
  assert.deepEqual(ids,['the-loop','a-tiny-example','the-loop-1']);
  for(const id of ids)assert.match(html,new RegExp(`id="${id}"`));
});
test('a leading heading equal to the title is dropped',()=>{
  const content='# My Title\n\nBody text';
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(Markdown,{content,title:'My Title'})),/<h1/);
  assert.match(renderToStaticMarkup(React.createElement(Markdown,{content})),/<h1/);
});
test('renders code fences, quotes, dividers and emphasis',()=>{
  const html=renderToStaticMarkup(React.createElement(Markdown,{content:'```python\nx = 1\n```\n\n> quoted\n\n---\n\nSome *italic* and **bold**'}));
  assert.match(html,/<pre/);assert.match(html,/<blockquote/);assert.match(html,/<hr/);assert.match(html,/<em>italic<\/em>/);assert.match(html,/<strong>bold<\/strong>/);
});

test('renders uploaded SVG and PNG diagrams as responsive images in article order',()=>{
  const html=render('Before\n\n![System architecture](https://media.example/v1/media/articles/7/one.svg "System components")\n\nBetween\n\n![Sequence](/v1/media/articles/7/two.png)\n\nAfter');
  assert.match(html,/<figure><a[^>]+><img[^>]+src="https:\/\/media.example\/v1\/media\/articles\/7\/one.svg"[^>]+alt="System architecture"/);
  assert.match(html,/loading="lazy" decoding="async" class="article-image"/);
  assert.match(html,/<figcaption>System components<\/figcaption>/);
  assert.match(html,/src="\/v1\/media\/articles\/7\/two.png"/);
  assert.ok(html.indexOf('Before')<html.indexOf('one.svg')&&html.indexOf('one.svg')<html.indexOf('Between')&&html.indexOf('Between')<html.indexOf('two.png'));
  assert.doesNotMatch(html,/<p>\s*<figure|<svg|<object|<iframe/);
});

test('inline and table images keep legal inline markup and ordinary links stay links',()=>{
  const html=render('Read ![A](https://media.example/a.png) then [the docs](https://example.com).\n\n- See ![B](/b.svg)\n\n| Diagram |\n| --- |\n| ![C](/c.png) |');
  assert.equal((html.match(/<img /g)||[]).length,3);
  assert.match(html,/<p>Read <img[^>]+\/> then <a[^>]+href="https:\/\/example.com"/);
  assert.match(html,/<li>See <img/);
  assert.match(html,/<td><img/);
  assert.doesNotMatch(html,/<figure/);
});

test('supports reference images, angle destinations, nested parentheses and titles',()=>{
  const html=render('![Overview][System Map]\n\n![system map][]\n\n![system map]\n\n[system map]: <https://media.example/diagram one.svg> "Overview caption"\n\n![Details](https://media.example/chart(one).png \'Detail caption\')');
  assert.equal((html.match(/<img /g)||[]).length,4);
  assert.equal((html.match(/src="https:\/\/media.example\/diagram%20one.svg"/g)||[]).length,3);
  assert.match(html,/src="https:\/\/media.example\/chart\(one\).png"/);
  assert.match(html,/<figcaption>Detail caption<\/figcaption>/);
  assert.doesNotMatch(html,/\[system map\]:/);
});

test('does not render images inside escaped syntax or inline and fenced code',()=>{
  const html=render('\\![Escaped](/escaped.png)\n\n`![Inline](/inline.png)` and ``![Two ticks](/ticks.png)``\n\n~~~markdown\n![Fence](/fence.png)\n[chart]: /hidden.svg\n~~~\n\n```markdown\n![Other fence](/other.png)\n```');
  assert.doesNotMatch(html,/<img /);
  assert.match(html,/<code>!\[Inline\]/);
  assert.match(html,/\[chart\]: \/hidden.svg/);
});

test('image sources allow HTTP(S) and root paths while rejecting executable and ambiguous URLs',()=>{
  const {safeImageSrc}=articleImage;
  assert.equal(safeImageSrc('https://media.example/diagram.svg'),'https://media.example/diagram.svg');
  assert.equal(safeImageSrc('http://localhost:8000/v1/media/a.png'),'http://localhost:8000/v1/media/a.png');
  assert.equal(safeImageSrc('/v1/media/a.png'),'/v1/media/a.png');
  for(const src of ['javascript:alert(1)','data:image/svg+xml,<svg/>','blob:https://example/id','file:///tmp/a.png','//evil.example/a.svg','/\\evil.example/a.svg','https://good.example/\nattack','https://']) {
    assert.equal(safeImageSrc(src),undefined,src);
    assert.doesNotMatch(render(`![Unsafe](<${src}>)`),/<img /,src);
  }
  const html=render('<svg onload="alert(1)"><script>alert(1)</script></svg>\n\n![<unsafe>](/safe.svg "<script>caption</script>")');
  assert.doesNotMatch(html,/<svg|<script|<object/);
  assert.match(html,/&lt;script&gt;caption/);
});

test('image scanning resolves repeated reference definitions and excludes Markdown code',()=>{
  const source='![First](images/chart(one).svg "Caption")\n\n![Ref][diagram]\n\n[diagram]: <images/reference chart.png> \'Reference\'\n\n`![Example](skip.png)`\n\n~~~md\n![Example](skip-too.png)\n~~~\n\n\\![Escaped](skip-three.png)';
  const found=images.findMarkdownImages(source);
  assert.deepEqual(Array.from(found,image=>image.destination),['images/chart(one).svg','images/reference chart.png']);
  assert.equal(found[0].alt,'First');
  assert.equal(found[1].title,'Reference');
  for(const image of found) assert.equal(source.slice(image.destinationStart,image.destinationEnd),image.destination);
  assert.equal(source.slice(found[1].start,found[1].end),'![Ref][diagram]');
});

test('reference definitions respect multiline code spans and continuation titles',()=>{
  const source='`example\n[hidden]: /not-an-upload.svg\nend`\n\n![hidden]\n\n![Actual][diagram]\n\n[diagram]: /actual.svg\n  "An explanatory caption"';
  const found=images.findMarkdownImages(source);
  assert.equal(found.length,1);
  assert.equal(found[0].destination,'/actual.svg');
  assert.equal(found[0].title,'An explanatory caption');
  const html=render(source);
  assert.equal((html.match(/<img /g)||[]).length,1);
  assert.match(html,/<figcaption>An explanatory caption<\/figcaption>/);
  assert.match(html,/\[hidden\]: \/not-an-upload.svg/);
});

test('bounds image label parsing for malformed large imports',()=>{
  assert.equal(images.parseMarkdownImageAt(`![${'['.repeat(32)}label${']'.repeat(32)}](/image.svg)`,0),null);
  assert.equal(images.parseMarkdownImageAt(`![${'a'.repeat(4097)}](/image.svg)`,0),null);
  const malformed='!['.repeat(64*1024);
  assert.equal(images.findMarkdownImages(malformed).length,0);
});

test('table image alt text and titles keep escaped pipes inside one image cell',()=>{
  const html=render(String.raw`| Diagram \| illustration |
| --- |
| ![left\|right](https://media.example/diagram.svg "Caption \| details") |`);
  assert.equal((html.match(/<th>/g)||[]).length,1);
  assert.equal((html.match(/<td>/g)||[]).length,1);
  assert.equal((html.match(/<img /g)||[]).length,1);
  assert.match(html,/<th>Diagram \| illustration<\/th>/);
  assert.match(html,/alt="left\|right" title="Caption \| details"/);
});

test('table cell splitting respects even and odd backslashes and optional edge pipes',()=>{
  const cells=row=>Array.from(images.markdownTableCells(row));
  assert.deepEqual(cells(String.raw`| a\|b | c |`),['a|b','c']);
  assert.deepEqual(cells(String.raw`a \\| b`),[String.raw`a \\`,'b']);
  assert.deepEqual(cells(String.raw`a \\\| b`),[String.raw`a \\| b`]);
  assert.deepEqual(cells(String.raw`| a\|`),['a|']);
  assert.deepEqual(cells('| a ||'),['a','']);
});
