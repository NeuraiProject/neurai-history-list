// ESM consumer (.mts is ESM whatever package.json#type says), compiled by
// `npm run test:types` against the package (dist/types.d.mts) the way an ESM
// application imports it, with skipLibCheck: false.
import History, { getHistory, type IDelta, type IHistoryItem } from "@neuraiproject/neurai-history-list";

const deltas: IDelta[] = [];
export const items: IHistoryItem[] = getHistory(deltas, "XNA");
// The ESM default export is `{ getHistory }`.
export const fromDefault: typeof getHistory = History.getHistory;
