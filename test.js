const History = require("../ravencoin-history-list"); //Yes we are importing our self
const aliceDeltas = require("./example/alice_deltas_after_sending.json");

test("Check sent RVN", () => {
  const history = History.getHistory(aliceDeltas);

  //The first history item should contain Alice sending one Lemonade token to Bob
  const historyItem = history[0];
  const lemonade = historyItem.assets.find((a) => a.assetName === "LEMONADE");

  expect(lemonade).toBeTruthy();

  expect(lemonade.value).toBe(-1);
  return;
});
