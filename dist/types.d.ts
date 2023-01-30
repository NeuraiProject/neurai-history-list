export function getHistory(deltas: IDelta[]): IHistoryItem[];
export interface IDelta {
    assetName: string;
    satoshis: number;
    txid: string;
    index: number;
    blockindex: number;
    height: number;
    address: string;
}
interface INeedABetterName {
    assetName: string;
    value: number;
    satoshis: number;
}
export interface IHistoryItem {
    isSent: boolean;
    assets: INeedABetterName[];
    blockHeight: number;
    transactionId: string;
    fee: number;
}
declare const _default: {
    getHistory: typeof getHistory;
};
export default _default;

//# sourceMappingURL=types.d.ts.map
