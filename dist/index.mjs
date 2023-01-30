function $c3f6c693698dc7cd$export$f9582a3c130d9538(deltas) {
    const deltasByTransactionId = $c3f6c693698dc7cd$var$getDeltasMappedToTransactionId(deltas);
    const history = Array.from(deltasByTransactionId.values()).map($c3f6c693698dc7cd$var$getListItem);
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
 */ function $c3f6c693698dc7cd$var$getListItem(deltas) {
    //Very simple if only one delta, like you received two LEMONADE tokens
    if (deltas.length === 1) {
        const delta = deltas[0];
        const item = {
            isSent: delta.satoshis < 0,
            assets: [
                {
                    assetName: delta.assetName,
                    value: delta.satoshis / 1e8,
                    satoshis: delta.satoshis
                }
            ],
            blockHeight: delta.height,
            transactionId: delta.txid
        };
        return item;
    } else {
        const balanceByAsset = {};
        deltas.map((delta)=>{
            balanceByAsset[delta.assetName] = balanceByAsset[delta.assetName] || 0;
            balanceByAsset[delta.assetName] += delta.satoshis;
        });
        let isSent = false;
        let assets = Object.keys(balanceByAsset).map((name)=>{
            //If any of the values is negative, it means we have sent
            if (balanceByAsset[name] < 0) isSent = true;
            const obj = {
                assetName: name,
                satoshis: balanceByAsset[name],
                value: balanceByAsset[name] / 1e8
            };
            return obj;
        });
        //Did we transfer asset (not RVN)
        const containsAssets = !!assets.find((asset)=>asset.assetName !== "RVN");
        const hasSentAssets = isSent && containsAssets === true;
        //OK we have transfered assets
        //If we find RVN transferes less than 5 RVN, assume it is the miners fee
        //Sure, technically you can send 4 RVN and 1 LEMONADE in the same transaction but that is exceptional
        //@ts-ignore
        if (hasSentAssets === true) assets = assets.filter((asset)=>{
            if (asset.assetName === "RVN" && asset.value < 5) return false;
            return true;
        });
        const listItem = {
            assets: assets,
            blockHeight: deltas[0].height,
            transactionId: deltas[0].txid,
            isSent: isSent
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


export {$c3f6c693698dc7cd$export$f9582a3c130d9538 as getHistory, $c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
