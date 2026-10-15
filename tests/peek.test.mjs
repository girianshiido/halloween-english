import test from 'node:test';
import assert from 'node:assert/strict';
import { picturePeek } from '../docs/app/peek.js';
test('Le trou mémo recherche un détail dessiné plutôt qu’une plage blanche',()=>{
  const size=64;const data=new Uint8ClampedArray(size*size*4).fill(255);
  for(let y=18;y<28;y++)for(let x=22;x<40;x++){let i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=0;}
  let seed=2;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  assert.equal(picturePeek(0,{width:size,height:size,data},random),null);
  for(let i=0;i<100;i++){
    const peek=picturePeek(2,{width:size,height:size,data},random);
    assert.equal(peek.radius,18);assert.ok(peek.y<56);assert.ok(peek.x>=35&&peek.x<=65);
  }
});
test('Une image sans contraste ne provoque ni blocage ni boucle infinie',()=>{
  const data=new Uint8ClampedArray(64*64*4).fill(255);let calls=0;
  const peek=picturePeek(1,{width:64,height:64,data},()=>{calls++;return 0.5;});
  assert.equal(peek.radius,30);assert.ok(calls<=120);
});
