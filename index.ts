/** RPC integer amounts must arrive before any lossy Number conversion. */
function rawInteger(value: number | string | bigint): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === 'string' && value.length <= 100 && /^-?\d+$/.test(value)) return BigInt(value);
  throw new Error('satoshis must be a safe integer, integer string or bigint');
}
function jsonInteger(raw: bigint): number | string {
  return raw >= -9007199254740991n && raw <= 9007199254740991n ? Number(raw) : String(raw);
}
function displayAmount(raw: bigint): number | string {
  const abs = raw < 0n ? -raw : raw;
  const frac = (abs % 100000000n).toString().padStart(8, '0').replace(/0+$/, '');
  const text = (raw < 0n ? '-' : '') + (abs / 100000000n) + (frac ? '.' + frac : '');
  const num = Number(text);
  return (abs <= 9007199254740991n || abs % 100000000n === 0n) && String(num) === text ? num : text;
}
export function getHistory(
  deltas: IDelta[],
  baseCurrency = "XNA"
): IHistoryItem[] {
  const deltasByTransactionId = getDeltasMappedToTransactionId(deltas);
  const history = Array.from(deltasByTransactionId.values()).map((obj) =>
    getListItem(obj, baseCurrency)
  );
  history.sort((h1, h2) => {
    //Sort on blockheight AND transaction, you can send multiple transaction in the same block
    const value1 = h1.blockHeight + "_" + h1.transactionId;
    const value2 = h2.blockHeight + "_" + h2.transactionId;

    if (value1 > value2) {
      return -1;
    }
    if (value2 < value1) {
      return 1;
    }
    return 0;
  });
  return history;
}

/**
 *
 * @param deltas Address deltas from the same transaction
 */
function getListItem(deltas: IDelta[], baseCurrency = "XNA"): IHistoryItem {
  //Very simple if only one delta, like you received two LEMONADE tokens
  if (deltas.length === 1) {
    const delta = deltas[0];
    const item: IHistoryItem = {
      isSent: rawInteger(delta.satoshis) < 0n,
      fee: 0,
      assets: [
        {
          assetName: delta.assetName,
          satoshis: jsonInteger(rawInteger(delta.satoshis)),
          value: displayAmount(rawInteger(delta.satoshis)),
        },
      ],
      blockHeight: delta.height,
      transactionId: delta.txid,
    };
    return item;
  } else {
    const balanceByAsset: Record<string, bigint> = Object.create(null);
    deltas.map((delta) => {
      balanceByAsset[delta.assetName] = balanceByAsset[delta.assetName] || 0n;
      balanceByAsset[delta.assetName] += rawInteger(delta.satoshis);
    });

    const fee = getBaseCurrencyFee(deltas, baseCurrency);
    if (fee > 0n) {
      balanceByAsset[baseCurrency] -= fee;
    }
    let isSent = false;

    let assets: INeedABetterName[] = Object.keys(balanceByAsset).map((name) => {
      //If any of the values are negative, it means we have sent
      if (balanceByAsset[name] < 0) {
        isSent = true;
      }

      const obj = {
        assetName: name,
        satoshis: jsonInteger(balanceByAsset[name]),
        value: displayAmount(balanceByAsset[name]),
      };

      return obj;
    });

    //Did we transfer asset (not XNA)
    const containsAssets = !!assets.find(
      (asset) => asset.assetName !== baseCurrency
    );

    const hasSentAssets = isSent && containsAssets === true;

    //OK we have transfered assets
    //If we find XNA transferes less than 5 XNA, assume it is the miners fee
    //Sure, technically you can send 4 XNA and 1 LEMONADE in the same transaction but that is exceptional

    //@ts-ignore
    if (hasSentAssets === true) {
      assets = assets.filter((asset) => {
        if (asset.assetName === baseCurrency && rawInteger(asset.satoshis) > -500000000n && rawInteger(asset.satoshis) < 500000000n) {
          return false;
        }
        return true;
      });
    }
    const listItem: IHistoryItem = {
      assets,
      blockHeight: deltas[0].height,
      transactionId: deltas[0].txid,
      isSent,
      // Fee calculation is not implemented. Preserve the public JSON contract.
      // A future implementation must define exact output units and representation.
      fee: 0,
    };
    return listItem;
  }
}
function getDeltasMappedToTransactionId(deltas: IDelta[]) {
  if (!deltas) {
    throw Error("Argument deltas is mandatory and cannot be nullish");
  }
  const map: Map<string, IDelta[]> = new Map();
  deltas.map((delta) => {
    const arr: IDelta[] = map.get(delta.txid) || [];
    arr.push(delta);
    map.set(delta.txid, arr);
  });
  return map;
}
export interface IDelta {
  assetName: string;
  satoshis: number | string | bigint;
  txid: string;
  index: number;
  blockindex: number;
  height: number;
  address: string;
}

interface INeedABetterName {
  assetName: string;
  value: number | string;
  satoshis: number | string;
}
export interface IHistoryItem {
  isSent: boolean;
  assets: INeedABetterName[];
  blockHeight: number;
  transactionId: string;
  fee: number;
}
export default {
  getHistory,
};

function getBaseCurrencyFee(deltas: IDelta[], baseCurrency = "XNA"): bigint {
  //We currently do not support calculation of fee.
  //Why? because we need to get the full transaction to get the fee
  return 0n;
}
