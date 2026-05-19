import fs from 'node:fs';
import path from 'node:path';

const APP_JS_PATH = path.join(process.cwd(), 'app.js');

async function verifyLinks() {
  console.log('🚀 Starting Link Verification...');
  const content = fs.readFileSync(APP_JS_PATH, 'utf8');
  
  // Regex to find href: '...' or href: "..." within the app.js context
  // This is a bit fragile but works for this specific project structure.
  const hrefRegex = /href:\s*['"]([^'"]+)['"]/g;
  const links = [];
  let match;

  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1];
    // We only care about web links, not internal identifiers or relative paths that aren't web URLs
    if (url.startsWith('http')) {
      links.push(url);
    }
  }

  console.log(`Found ${links.length} potential links to verify.`);
  
  let brokenLinks = 0;
  const verifiedLinks = [];

  for (const url of links) {
    try {
      const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
      if (response.ok) {
        console.log(`✅ ${url} [${response.status}]`);
        verifiedLinks.push(url);
      } else {
        console.error(`❌ ${url} [${response.status}]`);
        brokenLinks++;
      }
    } catch (err) {
      console.error(`❌ ${url} [Error: ${err.message}]`);
      brokenLinks++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total links checked: ${links.length}`);
  console.log(`Passed: ${links.length - brokenLinks}`);
  console.log(`Failed: ${brokenLinks}`);
  
  if (brokenLinks > 0) {
    process.exit(1);
  } else {
    console.log('All links are healthy!');
    process.exit(0);
  }
}

verifyLinks();
