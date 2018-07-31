module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            gas: 75000000,
            network_id: "*" // Match any network id
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};