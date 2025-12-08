const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    page.on('requestfailed', req => {
      const f = req.failure();
      console.log('REQUEST FAILED:', req.url(), f && f.errorText);
    });

    const target = process.env.TARGET_URL || 'http://localhost:1234';
    console.log('Navigating to', target, '...');
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 20000 }).catch(e => console.log('GOTO ERR:', e.toString()));

    const rootHTML = await page.evaluate(() => document.querySelector('#root')?.innerHTML || '');
    console.log('ROOT_HTML_LENGTH:', rootHTML.length);
    if (rootHTML.length > 0) console.log('ROOT_HTML_SNIPPET:', rootHTML.slice(0, 800));

    const screenshotPath = 'diagnostic-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to', screenshotPath);

    await browser.close();
  } catch (err) {
    console.error('DIAG ERROR:', err);
    process.exitCode = 1;
  }
})();
