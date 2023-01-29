# ravencoin-history-list

Creates a list of transactions for a wallet based on address deltas, in a human understandable way.

## What do we mean by human understandable?

Example.
Alice transfer one LEMONADE token to Bob.
Now Alice expects her history to show that she sent one LEMONADE token to Bob.

Technically, a transaction has been broadcasted on the network.
That transaction typically contains

- One or more unspent transaction outputs (UTXOs) to cover the miner fee, Alice needs to pay some RVN to send an asset.
- One or more UTXOs for the LEMONADE transfer, like input 20 LEMONADE, output one to BOB and 19 back to a change address.

## How to use

As a developer, you have to ask a Ravencoin node for the address deltas (getaddressdelta).
The address deltas represents everything that has come in and out from your addresses.

See example below.

## Install

`npm install @ravenrebels/ravencoin-history-list`

## How to use

```
 import {getHistory } from "@ravenrebels/ravencoin-history-list";


```

## Example how to use

Create a JavaScript project (npm init -y) and create an index.mjs file

Run the file `node index.mjs`
![image](https://user-images.githubusercontent.com/9694984/215101963-0fb8b973-3072-473d-817e-3104ecf28fd1.png)

```
const { getHistory } = require("../ravencoin-history-list"); //Replace with  @ravenrebels/ravencoin-history-list
const aliceDeltas = require("./example/alice_deltas_after_sending.json");

const history = getHistory(aliceDeltas);
const stuff = [];
for (let item of history) {
  item.assets.map((asset) => {
    asset.transactionId = item.transactionId.substring(0, 10) + "..";
    stuff.push(asset);
  });
}
console.table(stuff);

```

Exepected result
