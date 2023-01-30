export function getHistory(deltas: IDelta[]): IHistoryItem[] {
  const deltasByTransactionId = getDeltasMappedToTransactionId(deltas);
  const history = Array.from(deltasByTransactionId.values()).map(getListItem);
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
function getListItem(deltas: IDelta[]): IHistoryItem {
  //Very simple if only one delta, like you received two LEMONADE tokens
  if (deltas.length === 1) {
    const delta = deltas[0];
    const item: IHistoryItem = {
      isSent: delta.satoshis < 0,
      fee: 0,
      assets: [
        {
          assetName: delta.assetName,
          satoshis: delta.satoshis,
          value: delta.satoshis / 1e8,
        },
      ],
      blockHeight: delta.height,
      transactionId: delta.txid,
    };
    return item;
  } else {
    const balanceByAsset = {};
    deltas.map((delta) => {
      balanceByAsset[delta.assetName] = balanceByAsset[delta.assetName] || 0;
      balanceByAsset[delta.assetName] += delta.satoshis;
    });

    const fee = getRavencoinTransactionFee(deltas);
    if (fee > 0) {
      balanceByAsset["RVN"] -= fee;
    }
    let isSent = false;

    let assets: INeedABetterName[] = Object.keys(balanceByAsset).map((name) => {
      //If any of the values are negative, it means we have sent
      if (balanceByAsset[name] < 0) {
        isSent = true;
      }

      const obj = {
        assetName: name,
        satoshis: balanceByAsset[name],
        value: balanceByAsset[name] / 1e8,
      };

      return obj;
    });

    //Did we transfer asset (not RVN)
    const containsAssets = !!assets.find((asset) => asset.assetName !== "RVN");

    const hasSentAssets = isSent && containsAssets === true;

    //OK we have transfered assets
    //If we find RVN transferes less than 5 RVN, assume it is the miners fee
    //Sure, technically you can send 4 RVN and 1 LEMONADE in the same transaction but that is exceptional

    //@ts-ignore
    if (hasSentAssets === true) {
      assets = assets.filter((asset) => {
        if (asset.assetName === "RVN" && asset.value < 5) {
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
      fee: fee,
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
export default {
  getHistory,
};

function getRavencoinTransactionFee(deltas: IDelta[]): number {
  //We currently do not support calculation of fee.
  //Why? because we need to get the full transaction to get the fee
  return 0;
  /*
  //Check all inputed RVN and match with outputted RVN
  //The diff is the tansaction fee.

  //this only applies to SENT transactions

  let inputted = 0;
  let outputted = 0;

  //It is sent if we have a RVN transfer that is negative
  const isSent = !!deltas.find(
    (delta) => delta.assetName === "RVN" && delta.satoshis < 0
  );

  if (isSent === true) {
    console.log("Think that ", deltas[0].txid, "is sent");
  }
  if (isSent === false) {
    return 0;
  }

  for (let delta of deltas) {
    if (delta.assetName === "RVN") {
      if (delta.satoshis < 0) {
        inputted = inputted + delta.satoshis;
      } else if (delta.satoshis > 0) {
        outputted = outputted + delta.satoshis;
      }
    }
  }

  const fee = inputted - outputted;
  return fee;*/
}
