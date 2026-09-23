// CommonJS consumer: resolves the `require` condition (dist/types.d.ts).
// Every value export of dist/index.cjs is used.
import history = require("@neuraiproject/neurai-history-list");

export const values = [history.default, history.getHistory];
export const fromDefault: typeof history.getHistory = history.default.getHistory;
export const item = (deltas: history.IDelta[]): history.IHistoryItem[] => history.getHistory(deltas);
