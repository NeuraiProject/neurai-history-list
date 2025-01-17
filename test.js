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
