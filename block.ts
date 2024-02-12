import * as fs from 'fs';

interface Transaction {
    txid: string;
    fee: number;
    weight: number;
    parentTxids: string[];
}

function readMempoolData(csvFilePath: string): Transaction[] {
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    const transactions: Transaction[] = csvData
        .split('\n')
        .map((line) => {
            if (!line.trim()) return null; // Skip empty lines
            const [txid, fee, weight, parentTxids] = line.split(',');
            const parsedParentTxids = parentTxids.split(',').filter(Boolean);
            return {
                txid,
                fee: parseFloat(fee),
                weight: parseInt(weight),
                parentTxids: parsedParentTxids,
            };
        })
        .filter(
            (transaction): transaction is Transaction => transaction !== null
        ); // Use filter with type assertion

    return transactions;
}

function getMaxFeeBlock(transactions: Transaction[]): string[] {
    const sortedTransactions = transactions.sort((a, b) => b.fee - a.fee); // Sort by fee in descending order
    const includedTxids: Set<string> = new Set();

    for (const transaction of sortedTransactions) {
        if (!isValidTransaction(transaction, includedTxids)) {
            continue;
        }

        includedTxids.add(transaction.txid);
    }

    return Array.from(includedTxids);
}

function isValidTransaction(
    transaction: Transaction,
    includedTxids: Set<string>
): boolean {
    for (const parentTxid of transaction.parentTxids) {
        if (!includedTxids.has(parentTxid)) {
            return false; // Parent transaction not included
        }
    }

    return true;
}

// Replace 'mempool.csv' with the actual path to your mempool CSV file
const csvFilePath = './mempool.csv';

// Read mempool data
const mempoolData = readMempoolData(csvFilePath);

// Get the maximum fee block
const maxFeeBlock = getMaxFeeBlock(mempoolData);

// Output the result
console.log(maxFeeBlock.join('\n'));
