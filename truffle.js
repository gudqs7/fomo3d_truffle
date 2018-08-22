const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = 'your self 12 chars';

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            gas: 7500000,
            network_id: "*" // Match any network id
        },
        kovan: {
            gasPrice: 5000000000,
            provider: function() {
                return new HDWalletProvider(mnemonic,
                    "https://kovan.infura.io/v3/09c30ad18ed145c3997b0621e1816909")
            },
            network_id: 3
        },
        ropsten: {
           // gas: 8000000,
            gasPrice: 8000000000,
            provider: function() {
                return new HDWalletProvider(mnemonic,
                    "https://ropsten.infura.io/v3/09c30ad18ed145c3997b0621e1816909")
            },
            network_id: 2
        },
        mainnet: {
            gas: 7500000,
            gasPrice: 6000000000,
            provider: function() {
                return new HDWalletProvider(mnemonic,
                    "https://mainnet.infura.io/v3/09c30ad18ed145c3997b0621e1816909")
            },
            network_id: 1

        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};