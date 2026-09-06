const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const MarkdownIt = require('markdown-it');

const SRC = path.resolve(__dirname, '..', '..', 'docs', 'architecture', 'arc42.md');
const OUT = path.resolve(__dirname, '..', '..', 'docs', 'architecture', 'arc42.pdf');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const md = new MarkdownIt({ html: true, linkify: true });

// Render ```mermaid fences as <div class="mermaid"> blocks instead of <pre><code>.
// Done via a fence-renderer override (not string preprocessing) so that blank
// lines inside a diagram don't get misinterpreted as the end of an HTML block.
const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim() === 'mermaid') {
    return `<div class="mermaid">\n${md.utils.escapeHtml(token.content)}\n</div>\n`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

const raw = fs.readFileSync(SRC, 'utf-8');
let diagramCount = 0;
{
  const re = /```mermaid\n[\s\S]*?```/g;
  while (re.exec(raw)) diagramCount++;
}

const bodyHtml = md.render(raw);

const title = 'Personal- & Warenwirtschaftssystem';
const subtitle = 'arc42-Architekturdokumentation';
const dateStr = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>${title} - ${subtitle}</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
  @page {
    size: A4;
    margin: 22mm 18mm 20mm 18mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
    color: #1a1a1a;
    line-height: 1.5;
    font-size: 10.5pt;
  }
  .cover {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    page-break-after: always;
    border-top: 10px solid #2c3e50;
  }
  .cover .eyebrow {
    color: #2c3e50;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 11pt;
    margin-bottom: 12px;
  }
  .cover h1 {
    font-size: 30pt;
    margin: 0 0 8px 0;
    color: #111;
  }
  .cover h2 {
    font-size: 15pt;
    font-weight: 400;
    color: #444;
    margin: 0 0 40px 0;
  }
  .cover .meta {
    font-size: 10pt;
    color: #555;
    border-top: 1px solid #ccc;
    padding-top: 12px;
    margin-top: 40px;
    width: 60%;
  }
  h1 {
    font-size: 18pt;
    color: #2c3e50;
    border-bottom: 2px solid #2c3e50;
    padding-bottom: 4px;
    margin-top: 30px;
    page-break-before: always;
  }
  body > h1:first-of-type { page-break-before: avoid; }
  h2 {
    font-size: 13.5pt;
    color: #2c3e50;
    margin-top: 22px;
  }
  h3 {
    font-size: 11.5pt;
    color: #34495e;
    margin-top: 16px;
  }
  p { margin: 6px 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0 16px 0;
    font-size: 9pt;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 5px 7px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #2c3e50;
    color: white;
  }
  tr:nth-child(even) td { background: #f7f8f9; }
  code {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 9pt;
  }
  blockquote {
    border-left: 3px solid #2c3e50;
    margin: 10px 0;
    padding: 4px 12px;
    color: #555;
    background: #f7f8f9;
  }
  .mermaid {
    text-align: center;
    margin: 14px 0;
    page-break-inside: avoid;
  }
  .mermaid svg {
    max-width: 100%;
    height: auto !important;
  }
  hr { border: none; border-top: 1px solid #ccc; margin: 24px 0; }
</style>
</head>
<body>
<div class="cover">
  <div class="eyebrow">arc42 &middot; Softwarearchitektur-Dokumentation</div>
  <h1>${title}</h1>
  <h2>${subtitle}</h2>
  <div class="meta">
    Version 1.0 &middot; ${dateStr}<br>
    Basierend auf der arc42-Vorlage (Version 8, deutsch) &middot; arc42.de, Lizenz CC BY-SA
  </div>
</div>
${bodyHtml}
<script>
  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: { curve: 'linear' },
  });
</script>
</body>
</html>`;

const htmlPath = path.resolve(__dirname, 'arc42_render.html');
fs.writeFileSync(htmlPath, html, 'utf-8');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  // Wait until mermaid has rendered all diagrams into <svg>
  await page.waitForFunction(
    (expected) => document.querySelectorAll('.mermaid svg').length >= expected,
    { timeout: 30000 },
    diagramCount
  );
  // small settle delay for layout
  await new Promise((r) => setTimeout(r, 300));

  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px; width:100%; text-align:right; padding:0 18mm; color:#888;">${title}</div>`,
    footerTemplate: `<div style="font-size:8px; width:100%; text-align:center; color:#888;">Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>`,
    margin: { top: '22mm', bottom: '20mm', left: '18mm', right: '18mm' },
  });

  await browser.close();
  fs.unlinkSync(htmlPath);
  console.log('PDF geschrieben nach: ' + OUT);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
