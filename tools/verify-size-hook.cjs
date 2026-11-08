const { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const tempRoot = path.resolve(tmpdir());
const repo = mkdtempSync(path.join(tempRoot, 'map-hook-qa-'));
function git(...args) {
  return spawnSync('git', args, { cwd: repo, encoding: 'utf8', env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: process.platform === 'win32' ? 'NUL' : '/dev/null' } });
}
function ok(...args) { const result = git(...args); assert.equal(result.status, 0, result.stderr); return result; }
try {
  ok('init','-q');
  ok('config','user.name','Hook QA');
  ok('config','user.email','qa@example.invalid');
  ok('config','core.hooksPath','.githooks');
  mkdirSync(path.join(repo, '.githooks'));
  mkdirSync(path.join(repo, 'tools'));
  copyFileSync(path.join(root,'.githooks/pre-commit'),path.join(repo,'.githooks/pre-commit'));
  copyFileSync(path.join(root,'tools/check-file-size.cjs'),path.join(repo,'tools/check-file-size.cjs'));
  writeFileSync(path.join(repo,'demo.js'),'x'.repeat(20001));
  ok('add','.');
  const rejected = git('commit','-qm','oversized');
  assert.notEqual(rejected.status,0);
  assert.match(rejected.stderr,/demo\.js: 20001 bytes/);
  console.log('PASS: actual commit rejected a 20,001-byte source file');
  writeFileSync(path.join(repo,'demo.js'),'x'.repeat(10000));
  writeFileSync(path.join(repo,'part.js'),'x'.repeat(10001));
  mkdirSync(path.join(repo,'qa'));
  writeFileSync(path.join(repo,'qa/report.json'),'x'.repeat(22000));
  writeFileSync(path.join(repo,'package-lock.json'),'x'.repeat(22000));
  ok('add','.');
  ok('commit','-qm','split source and generated artifacts');
  console.log('PASS: split files commit successfully; generated QA and lockfiles exempt');
} finally {
  const target = path.resolve(repo);
  if (!target.startsWith(tempRoot + path.sep) || !path.basename(target).startsWith('map-hook-qa-')) throw Error('Unsafe temporary cleanup target');
  rmSync(target, { recursive: true, force: true });
}
