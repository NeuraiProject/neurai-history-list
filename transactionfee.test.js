const History = require("../ravencoin-history-list"); //Yes we are importing our self
const aliceDeltas = require("./example/alice_sends_rvn.json");

test("RVN transaction fee should be removed", () => {
  const history = History.getHistory(aliceDeltas);

  //The first history item should contain Alice sending one Lemonade token to Bob
  const historyItem = history[1];

  const rvn = historyItem.assets.find((a) => a.assetName === "RVN");
  expect(rvn.value).toBe(5);

  return;
});
