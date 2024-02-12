import * as fs from 'fs';
import * as crypto from 'crypto';

class Block {
    public previousHash: string;
    public transactions: any[];
    public timestamp: number;
    public nonce: number;
    public hash: string;

    constructor(previousHash: string, transactions: any[]) {
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.timestamp = Date.now();
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        const blockString =
            this.previousHash +
            JSON.stringify(this.transactions) +
            this.timestamp +
            this.nonce;
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    mineBlock(difficulty: number): void {
        const targetPrefix = Array(difficulty + 1).join('0');

        while (this.hash.substring(0, difficulty) !== targetPrefix) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

function createGenesisBlock(): Block {
    return new Block('0', [
        { sender: 'Genesis', recipient: 'Genesis', amount: 0 },
    ]);
}

function readTransactionsFromCSV(csvFilePath: string): any[] {
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvData.split('\n');
    const transactions = lines.slice(0, 3).map((line) => {
        const [sender, recipient, amount] = line.split(',');
        return { sender, recipient, amount: parseFloat(amount) };
    });

    return transactions;
}

function createBlockchain(csvFilePath: string, difficulty: number): Block[] {
    const blockchain: Block[] = [createGenesisBlock()];
    const transactions = readTransactionsFromCSV(csvFilePath);

    for (const transaction of transactions) {
        const previousBlock = blockchain[blockchain.length - 1];
        const newBlock = new Block(previousBlock.hash, [transaction]);
        newBlock.mineBlock(difficulty);
        blockchain.push(newBlock);
    }

    return blockchain;
}

function printBlockchain(blockchain: Block[]): void {
    for (const block of blockchain) {
        console.log(block);
    }
}

const csvFilePath = './mempool.csv';

// Set the difficulty level for proof-of-work
const difficultyLevel = 3;

// Create blockchain
const blockchain = createBlockchain(csvFilePath, difficultyLevel);

// Print blockchain
printBlockchain(blockchain);
