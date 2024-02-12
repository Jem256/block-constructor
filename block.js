"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
function readMempoolData(csvFilePath) {
    var csvData = fs.readFileSync(csvFilePath, 'utf-8');
    var transactions = csvData
        .split('\n')
        .map(function (line) {
        if (!line.trim())
            return null; // Skip empty lines
        var _a = line.split(','), txid = _a[0], fee = _a[1], weight = _a[2], parentTxids = _a[3];
        var parsedParentTxids = parentTxids === null || parentTxids === void 0 ? void 0 : parentTxids.split(',').filter(Boolean);
        return {
            txid: txid,
            fee: parseFloat(fee),
            weight: parseInt(weight),
            parentTxids: parsedParentTxids,
        };
    })
        .filter(function (transaction) { return transaction !== null; }); // Use filter with type assertion
    return transactions;
}
function getMaxFeeBlock(transactions) {
    var sortedTransactions = transactions.sort(function (a, b) { return b.fee - a.fee; }); // Sort by fee in descending order
    var includedTxids = new Set();
    for (var _i = 0, sortedTransactions_1 = sortedTransactions; _i < sortedTransactions_1.length; _i++) {
        var transaction = sortedTransactions_1[_i];
        if (!isValidTransaction(transaction, includedTxids)) {
            continue;
        }
        includedTxids.add(transaction.txid);
    }
    return Array.from(includedTxids);
}
function isValidTransaction(transaction, includedTxids) {
    for (var _i = 0, _a = transaction === null || transaction === void 0 ? void 0 : transaction.parentTxids; _i < _a.length; _i++) {
        var parentTxid = _a[_i];
        if (!includedTxids.has(parentTxid)) {
            return false; // Parent transaction not included
        }
    }
    return true;
}
// Replace 'mempool.csv' with the actual path to your mempool CSV file
var csvFilePath = './test.csv';
// Read mempool data
var mempoolData = readMempoolData(csvFilePath);
// Get the maximum fee block
var maxFeeBlock = getMaxFeeBlock(mempoolData);
// Output the result
console.log(maxFeeBlock.join('\n'));
