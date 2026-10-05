/** RPC integer amounts must arrive before any lossy Number conversion. */ function $c3f6c693698dc7cd$var$rawInteger(value) {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value);
    if (typeof value === 'string' && value.length <= 100 && /^-?\d+$/.test(value)) return BigInt(value);
    throw new Error('satoshis must be a safe integer, integer string or bigint');
}
function $c3f6c693698dc7cd$var$jsonInteger(raw) {
    return raw >= -9007199254740991n && raw <= 9007199254740991n ? Number(raw) : String(raw);
}
function $c3f6c693698dc7cd$var$displayAmount(raw) {
    const abs = raw < 0n ? -raw : raw;
    const frac = (abs % 100000000n).toString().padStart(8, '0').replace(/0+$/, '');
    const text = (raw < 0n ? '-' : '') + abs / 100000000n + (frac ? '.' + frac : '');
    const num = Number(text);
    return (abs <= 9007199254740991n || abs % 100000000n === 0n) && String(num) === text ? num : text;
}
function $c3f6c693698dc7cd$export$f9582a3c130d9538(deltas, baseCurrency = "XNA") {
    const deltasByTransactionId = $c3f6c693698dc7cd$var$getDeltasMappedToTransactionId(deltas);
    const history = Array.from(deltasByTransactionId.values()).map((obj)=>$c3f6c693698dc7cd$var$getListItem(obj, baseCurrency));
    history.sort((h1, h2)=>{
        //Newest block first, compared as numbers ("99" > "100" as text).
        //Then by transaction, you can send multiple transaction in the same block
        if (h1.blockHeight !== h2.blockHeight) return h2.blockHeight - h1.blockHeight;
        if (h1.transactionId > h2.transactionId) return -1;
        if (h1.transactionId < h2.transactionId) return 1;
        return 0;
    });
    return history;
}
/**
 *
 * @param deltas Address deltas from the same transaction
 */ function $c3f6c693698dc7cd$var$getListItem(deltas, baseCurrency = "XNA") {
    //Very simple if only one delta, like you received two LEMONADE tokens
    if (deltas.length === 1) {
        const delta = deltas[0];
        const item = {
            isSent: $c3f6c693698dc7cd$var$rawInteger(delta.satoshis) < 0n,
            fee: 0,
            assets: [
                {
                    assetName: delta.assetName,
                    satoshis: $c3f6c693698dc7cd$var$jsonInteger($c3f6c693698dc7cd$var$rawInteger(delta.satoshis)),
                    value: $c3f6c693698dc7cd$var$displayAmount($c3f6c693698dc7cd$var$rawInteger(delta.satoshis))
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
            balanceByAsset[delta.assetName] += $c3f6c693698dc7cd$var$rawInteger(delta.satoshis);
        });
        const fee = $c3f6c693698dc7cd$var$getBaseCurrencyFee(deltas, baseCurrency);
        if (fee > 0n) balanceByAsset[baseCurrency] -= fee;
        let isSent = false;
        let assets = Object.keys(balanceByAsset).map((name)=>{
            //If any of the values are negative, it means we have sent
            if (balanceByAsset[name] < 0) isSent = true;
            const obj = {
                assetName: name,
                satoshis: $c3f6c693698dc7cd$var$jsonInteger(balanceByAsset[name]),
                value: $c3f6c693698dc7cd$var$displayAmount(balanceByAsset[name])
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
            if (asset.assetName === baseCurrency && $c3f6c693698dc7cd$var$rawInteger(asset.satoshis) > -500000000n && $c3f6c693698dc7cd$var$rawInteger(asset.satoshis) < 500000000n) return false;
            return true;
        });
        const listItem = {
            assets: assets,
            blockHeight: deltas[0].height,
            transactionId: deltas[0].txid,
            isSent: isSent,
            // Fee calculation is not implemented. Preserve the public JSON contract.
            // A future implementation must define exact output units and representation.
            fee: 0
        };
        return listItem;
    }
}
function $c3f6c693698dc7cd$var$getDeltasMappedToTransactionId(deltas) {
    if (!deltas) throw Error("Argument deltas is mandatory and cannot be nullish");
    const map = new Map();
    deltas.map((delta)=>{
        const arr = map.get(delta.txid) || [];
        arr.push(delta);
        map.set(delta.txid, arr);
    });
    return map;
}
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    getHistory: $c3f6c693698dc7cd$export$f9582a3c130d9538
};
function $c3f6c693698dc7cd$var$getBaseCurrencyFee(deltas, baseCurrency = "XNA") {
    //We currently do not support calculation of fee.
    //Why? because we need to get the full transaction to get the fee
    return 0n;
}


export {$c3f6c693698dc7cd$export$f9582a3c130d9538 as getHistory, $c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
