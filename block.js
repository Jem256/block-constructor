"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var crypto = require("crypto");
var Block = /** @class */ (function () {
    function Block(previousHash, transactions) {
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.timestamp = Date.now();
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    Block.prototype.calculateHash = function () {
        var blockString = this.previousHash +
            JSON.stringify(this.transactions) +
            this.timestamp +
            this.nonce;
        return crypto.createHash('sha256').update(blockString).digest('hex');
    };
    Block.prototype.mineBlock = function (difficulty) {
        var targetPrefix = Array(difficulty + 1).join('0');
        while (this.hash.substring(0, difficulty) !== targetPrefix) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    };
    return Block;
}());
function createGenesisBlock() {
    return new Block('0', [
        { sender: 'Genesis', recipient: 'Genesis', amount: 0 },
    ]);
}
function readTransactionsFromCSV(csvFilePath) {
    var csvData = fs.readFileSync(csvFilePath, 'utf-8');
    var lines = csvData.split('\n');
    var transactions = lines.slice(0, 3).map(function (line) {
        var _a = line.split(','), sender = _a[0], recipient = _a[1], amount = _a[2];
        return { sender: sender, recipient: recipient, amount: parseFloat(amount) };
    });
    return transactions;
}
function createBlockchain(csvFilePath, difficulty) {
    var blockchain = [createGenesisBlock()];
    var transactions = readTransactionsFromCSV(csvFilePath);
    for (var _i = 0, transactions_1 = transactions; _i < transactions_1.length; _i++) {
        var transaction = transactions_1[_i];
        var previousBlock = blockchain[blockchain.length - 1];
        var newBlock = new Block(previousBlock.hash, [transaction]);
        newBlock.mineBlock(difficulty);
        blockchain.push(newBlock);
    }
    return blockchain;
}
function printBlockchain(blockchain) {
    for (var _i = 0, blockchain_1 = blockchain; _i < blockchain_1.length; _i++) {
        var block = blockchain_1[_i];
        console.log(block);
    }
}
var csvFilePath = './mempool.csv';
// Set the difficulty level for proof-of-work
var difficultyLevel = 3;
// Create blockchain
var blockchain = createBlockchain(csvFilePath, difficultyLevel);
// Print blockchain
printBlockchain(blockchain);
