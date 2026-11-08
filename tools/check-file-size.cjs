const { execFileSync } = require('node:child_process');
const limit = 20000;
const excluded = /^(?:qa\/|assets\/(?:map|history)\/|(?:dist|build|node_modules)\/|js\/geometry\.js$)|(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.lock|poetry\.lock|uv\.lock)$|\.(?:png|jpe?g|gif|webp|ico|woff2?|ttf|mp[34]|wav|ogg|webm|pdf|docx|xlsx|pptx|zip)$/i;

try {
  const files = execFileSync('git', ['diff','--cached','--name-only','--diff-filter=ACMR','-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const oversized = [];
  for (const file of files) {
    if (excluded.test(file)) continue;
    const bytes = Number(execFileSync('git', ['cat-file','-s',':' + file], { encoding: 'utf8' }).trim());
    if (bytes > limit) oversized.push(`${file}: ${bytes} bytes (~${Math.ceil(bytes / 4)} tokens)`);
  }
  if (oversized.length) {
    console.error('Commit rejected: files exceed 20,000 bytes (~5,000 tokens). Split by function before committing:\n' + oversized.join('\n'));
    process.exitCode = 1;
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
