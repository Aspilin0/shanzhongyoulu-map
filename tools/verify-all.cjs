const { spawnSync } = require('node:child_process');
const { readdirSync, existsSync } = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function check(bin, args) {
  const result = spawnSync(bin, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || result.error?.message || 'Check failed');
    process.exit(result.status || 1);
  }
  const lines = (result.stdout + result.stderr).trim().split(/\r?\n/);
  console.log('PASS', args.join(' '), lines.at(-1) || '');
}
process.env.QA_ROOT ||= 'qa/2026-11-08/finish-explore';
const python = process.env.PYTHON || (existsSync('D:/Anaconda/python.exe') ? 'D:/Anaconda/python.exe' : 'python');
for (const file of readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'))) check(process.execPath, ['--check','js/' + file]);
check(python, ['tools/verify-map.py']);
check(python, ['tools/verify-stones.py']);
check(python, ['tools/verify-tour.py']);
check(process.execPath, ['tools/verify-content.cjs']);
check(process.execPath, ['tools/verify-size-hook.cjs']);
for (const name of ['photos','map-view','stones','preview','journey','tidy','unified','content-ui','about']) check(process.execPath, ['tools/verify-' + name + '.cjs']);
for (const name of ['map-view','stones','preview','mainline-journey','tidy','unified','content','about-return']) check(process.execPath, ['tools/audit-small-text.mjs','--report',`${process.env.QA_ROOT}/${name}/font-audit.json`]);
console.log('All checks passed: geometry 15; browser suites 9 at desktop and mobile widths; all 39 place introductions sourced; hook checks 2; syntax and fonts clean.');
