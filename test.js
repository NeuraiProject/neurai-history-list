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
