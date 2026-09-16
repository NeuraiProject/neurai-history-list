
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "getHistory", () => $80bd448eb6ea085b$export$f9582a3c130d9538);
$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);
/** RPC integer amounts must arrive before any lossy Number conversion. */ function $80bd448eb6ea085b$var$rawInteger(value) {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value);
    if (typeof value === 'string' && value.length <= 100 && /^-?\d+$/.test(value)) return BigInt(value);
    throw new Error('satoshis must be a safe integer, integer string or bigint');
}
function $80bd448eb6ea085b$var$jsonInteger(raw) {
    return raw >= -9007199254740991n && raw <= 9007199254740991n ? Number(raw) : String(raw);
}
function $80bd448eb6ea085b$var$displayAmount(raw) {
    const abs = raw < 0n ? -raw : raw;
    const frac = (abs % 100000000n).toString().padStart(8, '0').replace(/0+$/, '');
    const text = (raw < 0n ? '-' : '') + abs / 100000000n + (frac ? '.' + frac : '');
    const num = Number(text);
    return (abs <= 9007199254740991n || abs % 100000000n === 0n) && String(num) === text ? num : text;
}
function $80bd448eb6ea085b$export$f9582a3c130d9538(deltas, baseCurrency = "XNA") {
    const deltasByTransactionId = $80bd448eb6ea085b$var$getDeltasMappedToTransactionId(deltas);
    const history = Array.from(deltasByTransactionId.values()).map((obj)=>$80bd448eb6ea085b$var$getListItem(obj, baseCurrency));
    history.sort((h1, h2)=>{
        //Sort on blockheight AND transaction, you can send multiple transaction in the same block
        const value1 = h1.blockHeight + "_" + h1.transactionId;
        const value2 = h2.blockHeight + "_" + h2.transactionId;
        if (value1 > value2) return -1;
        if (value2 < value1) return 1;
        return 0;
    });
    return history;
}
/**
 *
 * @param deltas Address deltas from the same transaction
 */ function $80bd448eb6ea085b$var$getListItem(deltas, baseCurrency = "XNA") {
    //Very simple if only one delta, like you received two LEMONADE tokens
    if (deltas.length === 1) {
        const delta = deltas[0];
        const item = {
            isSent: $80bd448eb6ea085b$var$rawInteger(delta.satoshis) < 0n,
            fee: 0,
            assets: [
                {
                    assetName: delta.assetName,
                    satoshis: $80bd448eb6ea085b$var$jsonInteger($80bd448eb6ea085b$var$rawInteger(delta.satoshis)),
                    value: $80bd448eb6ea085b$var$displayAmount($80bd448eb6ea085b$var$rawInteger(delta.satoshis))
                }
            ],
            blockHeight: delta.height,
            transactionId: delta.txid
        };
        return item;
    } else {
        const balanceByAsset = Object.create(null);
        deltas.map((delta)=>{
            balanceByAsset[delta.assetName] = balanceByAsset[delta.assetName] || 0n;
            balanceByAsset[delta.assetName] += $80bd448eb6ea085b$var$rawInteger(delta.satoshis);
        });
        const fee = $80bd448eb6ea085b$var$getBaseCurrencyFee(deltas, baseCurrency);
        if (fee > 0) balanceByAsset[baseCurrency] -= BigInt(fee);
        let isSent = false;
        let assets = Object.keys(balanceByAsset).map((name)=>{
            //If any of the values are negative, it means we have sent
            if (balanceByAsset[name] < 0) isSent = true;
            const obj = {
                assetName: name,
                satoshis: $80bd448eb6ea085b$var$jsonInteger(balanceByAsset[name]),
                value: $80bd448eb6ea085b$var$displayAmount(balanceByAsset[name])
            };
            return obj;
        });
        //Did we transfer asset (not XNA)
        const containsAssets = !!assets.find((asset)=>asset.assetName !== baseCurrency);
        const hasSentAssets = isSent && containsAssets === true;
        //OK we have transfered assets
        //If we find XNA transferes less than 5 XNA, assume it is the miners fee
        //Sure, technically you can send 4 XNA and 1 LEMONADE in the same transaction but that is exceptional
        //@ts-ignore
        if (hasSentAssets === true) assets = assets.filter((asset)=>{
            if (asset.assetName === baseCurrency && $80bd448eb6ea085b$var$rawInteger(asset.satoshis) > -500000000n && $80bd448eb6ea085b$var$rawInteger(asset.satoshis) < 500000000n) return false;
            return true;
        });
        const listItem = {
            assets: assets,
            blockHeight: deltas[0].height,
            transactionId: deltas[0].txid,
            isSent: isSent,
            fee: fee
        };
        return listItem;
    }
}
function $80bd448eb6ea085b$var$getDeltasMappedToTransactionId(deltas) {
    if (!deltas) throw Error("Argument deltas is mandatory and cannot be nullish");
    const map = new Map();
    deltas.map((delta)=>{
        const arr = map.get(delta.txid) || [];
        arr.push(delta);
        map.set(delta.txid, arr);
    });
    return map;
}
var $80bd448eb6ea085b$export$2e2bcd8739ae039 = {
    getHistory: $80bd448eb6ea085b$export$f9582a3c130d9538
};
function $80bd448eb6ea085b$var$getBaseCurrencyFee(deltas, baseCurrency = "XNA") {
    //We currently do not support calculation of fee.
    //Why? because we need to get the full transaction to get the fee
    return 0;
}


//# sourceMappingURL=index.cjs.map
