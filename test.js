const History = require("../neurai-history-list"); //Yes we are importing our self
const aliceDeltas = require("./example/alice_deltas_after_sending.json");
const evrDeltas = require("./example/evr_deltas.json");
test("Check sent one LEMONADE", () => {
  const history = History.getHistory(aliceDeltas);
 

  //The first history item should contain Alice sending one Lemonade token to Bob
  const historyItem = history[0];
  console.log("First history fee", historyItem.fee / 1e8);
  const lemonade = historyItem.assets.find((a) => a.assetName === "LEMONADE");
  expect(lemonade).toBeTruthy();
  expect(lemonade.value).toBe(-1);

  const xna = historyItem.assets.find((a) => a.assetName === "XNA");
  expect(xna).toBeFalsy();
  return;
});



test("CheckEVR", () => {
  const history = History.getHistory(evrDeltas, "EVR");
  console.log(JSON.stringify(history, null, 4));
 

  //The first history item should contain Alice sending one Lemonade token to Bob
  const historyItem = history[0];
  console.log("First history fee", historyItem.fee / 1e8);
  const evr = historyItem.assets.find((a) => a.assetName === "EVR");
  expect(evr).toBeTruthy();
  expect(evr.value).toBe(-1.01);

  const xna = historyItem.assets.find((a) => a.assetName === "XNA");
  expect(xna).toBeFalsy();
  return;
});

const delta = satoshis => ({assetName:'XNA',satoshis,txid:'large',height:1,index:0,blockindex:0,address:'fixture'});
test('large received and sent values preserve every unit and remain JSON serializable',()=>{
 for(const raw of ['10000000000000001','-10000000000000001']) {
  const item=History.getHistory([delta(raw)])[0];
  expect(item.assets[0].satoshis).toBe(raw);
  expect(item.assets[0].value).toBe(raw[0]==='-'?'-100000000.00000001':'100000000.00000001');
  expect(()=>JSON.stringify(item)).not.toThrow();
 }
});
test('large opposing deltas cancel exactly to one unit',()=>{
 const item=History.getHistory([delta('-10000000000000000'),delta('10000000000000001')])[0];
 expect(item.assets[0].satoshis).toBe(1);
 expect(item.isSent).toBe(false);
});
test('rejects amounts already damaged by number conversion',()=>{
 expect(()=>History.getHistory([delta(9007199254740992)])).toThrow(/safe integer/);
});
test('does not hide a large negative XNA delta as an asset fee',()=>{
 const token={...delta(-100000000),assetName:'TOKEN'};
 const item=History.getHistory([delta('-10000000000000001'),token])[0];
 expect(item.assets.find(a=>a.assetName==='XNA').satoshis).toBe('-10000000000000001');
});


test('unimplemented fees remain numeric zero in single and grouped JSON histories', () => {
  for (const values of [['10000000000000001'], ['10000000000000002', '-1']]) {
    const result = History.getHistory(values.map(delta));
    expect(result[0].fee).toBe(0);
    expect(result[0].assets[0].satoshis).toBe('10000000000000001');
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  }
});

// neurai-key 5 address types: Legacy P2PKH, AuthScript v1, PQ v2, ECDSA v3.
// The history is computed from txid, assetName and satoshis only; the address
// is never parsed, so mixing types inside one transaction changes nothing.
const MIXED_ADDRESSES = [
  'tNc1F3aqhmGhKipLWa9U4tuoLh9yyP1ZXP',
  'tnc1p83wfxfypfr3tqpwakdgmk5r0pwpsemq5ngdsx7gef8yc84pndfmqqd6m25',
  'tpq1z4xrgwmgmhr3ezrkk5aa0ez3xdztvm9jzrmgu4uxz6vm8l9lgv4zs3xdctv',
  'tnq1r0c9zl485wv7wcfutxfyv8k2ltpfk5hdyp3s7g4chlphx8d2m6npqwxvjya',
];
const [LEGACY, AUTHSCRIPT_V1, PQ_V2, ECDSA_V3] = MIXED_ADDRESSES;
const mixedDelta = (address, assetName, satoshis, txid, index, height) =>
  ({ assetName, satoshis, txid, index, blockindex: 1, height, address });
const mixedDeltas = [
  // XNA sent from inputs on three address types, change on a fourth.
  mixedDelta(LEGACY, 'XNA', -150000000, 'mixed-xna', 0, 20),
  mixedDelta(AUTHSCRIPT_V1, 'XNA', -250000000, 'mixed-xna', 1, 20),
  mixedDelta(PQ_V2, 'XNA', -100000000, 'mixed-xna', 2, 20),
  mixedDelta(ECDSA_V3, 'XNA', 399990000, 'mixed-xna', 0, 20),
  // Asset transfer: token spent from v2, token change to v3, small XNA fee
  // paid from v1 with XNA change back to the legacy address.
  mixedDelta(PQ_V2, 'TOKEN', -300000000, 'mixed-asset', 0, 21),
  mixedDelta(ECDSA_V3, 'TOKEN', 200000000, 'mixed-asset', 1, 21),
  mixedDelta(AUTHSCRIPT_V1, 'XNA', -100000000, 'mixed-asset', 2, 21),
  mixedDelta(LEGACY, 'XNA', 99000000, 'mixed-asset', 3, 21),
  // Received on each witness type in one transaction.
  mixedDelta(AUTHSCRIPT_V1, 'XNA', 100000000, 'mixed-received', 0, 22),
  mixedDelta(PQ_V2, 'XNA', 200000000, 'mixed-received', 1, 22),
  mixedDelta(ECDSA_V3, 'XNA', 300000000, 'mixed-received', 2, 22),
];

test('mixed address types in one txid give the same history as a single address', () => {
  const history = History.getHistory(mixedDeltas);
  const sameAddress = History.getHistory(mixedDeltas.map((d) => ({ ...d, address: LEGACY })));
  expect(history).toEqual(sameAddress);

  // Rotating which address type holds which delta changes nothing either.
  const rotated = History.getHistory(mixedDeltas.map((d) => ({
    ...d,
    address: MIXED_ADDRESSES[(MIXED_ADDRESSES.indexOf(d.address) + 1) % MIXED_ADDRESSES.length],
  })));
  expect(rotated).toEqual(history);
});

test('mixed address types: one item per txid with the summed amounts', () => {
  const history = History.getHistory(mixedDeltas);
  expect(history.map((h) => h.transactionId)).toEqual(['mixed-received', 'mixed-asset', 'mixed-xna']);

  const [received, asset, xna] = history;
  expect(received.isSent).toBe(false);
  expect(received.assets).toEqual([{ assetName: 'XNA', satoshis: 600000000, value: 6 }]);

  // XNA movement under 5 XNA next to a sent asset is treated as the fee.
  expect(asset.isSent).toBe(true);
  expect(asset.assets).toEqual([{ assetName: 'TOKEN', satoshis: -100000000, value: -1 }]);

  expect(xna.isSent).toBe(true);
  expect(xna.assets).toEqual([{ assetName: 'XNA', satoshis: -100010000, value: -1.0001 }]);
  expect(JSON.parse(JSON.stringify(history))).toEqual(history);
});

test('history is sorted by block height as a number, newest first', () => {
  const at = (height, txid) => ({ assetName: 'XNA', satoshis: 100000000, txid, height, index: 0, blockindex: 0, address: 'fixture' });
  const history = History.getHistory([at(99, 'b'), at(100, 'a'), at(1000, 'c'), at(100, 'd')]);
  expect(history.map((h) => [h.blockHeight, h.transactionId])).toEqual([[1000, 'c'], [100, 'd'], [100, 'a'], [99, 'b']]);
});
