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
const listMoves = (await import('./piecelegal.mjs')).default;
for (const fn in listMoves) { console.log(fn); listMoves[fn](); }

console.log()
const listAll = (await import('./allmove.mjs')).default;
for (const fn in listAll) { console.log(fn); listAll[fn](); }

console.log()
const getNext = (await import('./nextpos.mjs')).default;
for (const fn in getNext) { console.log(fn); getNext[fn](); }

console.log()
const listTbl = (await import('./disamtbl.mjs')).default;
for (const fn in listTbl) { console.log(fn); listTbl[fn](); }

console.log()
const convert = (await import('./pcn2san.mjs')).default;
for (const fn in convert) { console.log(fn); convert[fn](); }

console.log()
const report3 = (await import('./threefold.mjs')).default;
for (const fn in report3) { console.log(fn); report3[fn](); }

console.log()
const listSeq = (await import('./seqpos.mjs')).default;
for (const fn in listSeq) { console.log(fn); listSeq[fn](); }

console.log()
const listCaps = (await import('./seqcap.mjs')).default;
for (const fn in listCaps) { console.log(fn); listCaps[fn](); }

console.log()
const listStat = (await import('./gstat.mjs')).default;
for (const fn in listStat) { console.log(fn); listStat[fn](); }

console.log()
