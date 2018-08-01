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
        ropsten: {
            gas: 8000000,
            provider: function() {
                return new HDWalletProvider(mnemonic,
                    "https://kovan.infura.io/v3/{{your_apiKey}}")
            },
            network_id: 3
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};