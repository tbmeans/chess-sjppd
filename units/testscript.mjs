'use strict';

console.log()
const tellColor = (await import('./color.mjs')).default
for (const fn in tellColor) { console.log(fn); tellColor[fn]() };

console.log()
const listFile = (await import('./chessfile.mjs')).default
for (const fn in listFile) { console.log(fn); listFile[fn](); }

console.log()
const listRank = (await import('./chessrank.mjs')).default
for (const fn in listRank) { console.log(fn); listRank[fn](); }

console.log()
const showNext = (await import('./diagStep.mjs')).default
for (const fn in showNext) { console.log(fn); showNext[fn](); }

console.log()
const listAng = (await import('./diagSeq.mjs')).default;
for (const fn in listAng) { console.log(fn); listAng[fn](); }

console.log()
const listJumps = (await import('./jumpCirc.mjs')).default;
for (const fn in listJumps) { console.log(fn); listJumps[fn](); }

console.log()
const listPP = (await import('./ppdsub.mjs')).default;
for (const fn in listPP) { console.log(fn); listPP[fn](); }

console.log()
const listRayEv = (await import('./trimRay.mjs')).default;
for (const fn in listRayEv) { console.log(fn); listRayEv[fn](); }

console.log()
const listJumpEv = (await import('./trimJump.mjs')).default;
for (const fn in listJumpEv) { console.log(fn); listJumpEv[fn](); }

console.log()
const listAttacks = (await import('./attacks.mjs')).default;
for (const fn in listAttacks) { console.log(fn); listAttacks[fn](); }

console.log()
const listTargets = (await import('./targets.mjs')).default;
for (const fn in listTargets) { console.log(fn); listTargets[fn](); }

console.log()
const listMoves = (await import('./legalmove.mjs')).default;
for (const fn in listMoves) { console.log(fn); listMoves[fn](); }

console.log()
const listAll = (await import('./allmove.mjs')).default;
for (const fn in listAll) { console.log(fn); listAll[fn](); }

console.log()
