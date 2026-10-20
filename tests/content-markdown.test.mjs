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
  const context={exports:{},require:n=>deps[n]??(n==='react'?React:jsx)};
  vm.runInNewContext(code,context);
  return context.exports;
}
const headings=await load('../src/lib/headings.ts');
const {default:Markdown,parseFlow,safeHref}=await load('../src/components/articles/ArticleBody.tsx',{'@/lib/headings':headings});

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
