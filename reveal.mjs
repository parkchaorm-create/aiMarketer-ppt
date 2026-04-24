#!/usr/bin/env node
/**
 * 진도 공개 토글 · aimarketer-ppt/progress.json 편집 CLI.
 *
 * 사용법:
 *   node reveal.mjs 5         · revealedUpTo를 5로 설정 (1~5강 공개)
 *   node reveal.mjs +1        · 다음 회차 1개 추가 공개
 *   node reveal.mjs -1        · 마지막 1개 되돌림
 *   node reveal.mjs extra 10  · 10강만 추가 공개 (건너뛰기)
 *   node reveal.mjs status    · 현재 상태 출력
 *
 * 실행 후 자동으로 git add + commit + push (--no-push 플래그로 끌 수 있음)
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO = path.dirname(__filename);
const FILE = path.join(REPO, 'progress.json');

const args = process.argv.slice(2);
const noPush = args.includes('--no-push');
const cleanArgs = args.filter(a => a !== '--no-push');

function load() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function save(cfg) {
  cfg.lastUpdated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
}
function status(cfg) {
  console.log(`📊 현재 진도`);
  console.log(`  · revealedUpTo: ${cfg.revealedUpTo}강 (1~${cfg.revealedUpTo} 공개)`);
  console.log(`  · revealedExtras: ${cfg.revealedExtras.length ? cfg.revealedExtras.join(', ') + '강' : '없음'}`);
  console.log(`  · lastUpdated: ${cfg.lastUpdated}`);
}

const cmd = cleanArgs[0];
if (!cmd || cmd === 'status') {
  status(load());
  process.exit(0);
}

const cfg = load();
let changed = false;

if (cmd === 'extra') {
  const n = parseInt(cleanArgs[1], 10);
  if (!n) { console.error('❌ extra <N> 형식'); process.exit(1); }
  if (!cfg.revealedExtras.includes(n)) { cfg.revealedExtras.push(n); cfg.revealedExtras.sort((a,b)=>a-b); changed = true; }
  console.log(`✅ ${n}강 추가 공개`);
}
else if (/^[+\-]\d+$/.test(cmd)) {
  const delta = parseInt(cmd, 10);
  const before = cfg.revealedUpTo;
  cfg.revealedUpTo = Math.max(0, Math.min(37, cfg.revealedUpTo + delta));
  if (before !== cfg.revealedUpTo) changed = true;
  console.log(`✅ ${before}강 → ${cfg.revealedUpTo}강`);
}
else if (/^\d+$/.test(cmd)) {
  const n = parseInt(cmd, 10);
  if (n < 0 || n > 37) { console.error('❌ 0~37 범위'); process.exit(1); }
  if (cfg.revealedUpTo !== n) { cfg.revealedUpTo = n; changed = true; }
  console.log(`✅ 1~${n}강 공개`);
}
else {
  console.error(`사용법: node reveal.mjs [숫자|+N|-N|extra N|status]`);
  process.exit(1);
}

if (changed) {
  save(cfg);
  status(cfg);
  if (!noPush) {
    try {
      execSync('git add progress.json', { cwd: REPO, stdio: 'inherit' });
      execSync(`git commit -m "chore: 진도 공개 → ${cfg.revealedUpTo}강${cfg.revealedExtras.length ? ' + extras ' + cfg.revealedExtras.join(',') : ''}"`, { cwd: REPO, stdio: 'inherit' });
      execSync('git push origin main', { cwd: REPO, stdio: 'inherit' });
      console.log(`\n🚀 배포 완료 · 1~3분 후 반영`);
    } catch (e) {
      console.error('⚠️  git 자동화 실패 · 수동 실행 필요');
    }
  } else {
    console.log(`\n💾 progress.json 저장만 · --no-push 모드 · 수동 git push 필요`);
  }
}
