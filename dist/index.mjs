function $c3f6c693698dc7cd$export$2e2bcd8739ae039(deltas) {
    const deltasByTransactionId = $c3f6c693698dc7cd$var$getDeltasMappedToTransactionId(deltas);
    const history = Array.from(deltasByTransactionId.values()).map($c3f6c693698dc7cd$var$getListItem);
    console.log(history);
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
        const temp = {};
        deltas.map((delta)=>{
            temp[delta.assetName] = temp[delta.assetName] || 0;
            temp[delta.assetName] += delta.satoshis;
        });
        let isSent = false;
        const assets = Object.keys(temp).map((name)=>{
            //If any of the values is negative, it means we have sent
            if (temp[name] < 0) isSent = true;
            const obj = {
                assetName: name,
                satoshis: temp[name],
                value: temp[name] / 1e8
            };
            return obj;
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
    const map = new Map();
    deltas.map((delta)=>{
        const arr = map.get(delta.txid) || [];
        arr.push(delta);
        map.set(delta.txid, arr);
    });
    return map;
}


export {$c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
