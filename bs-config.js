var proxy = require('http-proxy-middleware');
var fomoProxy = proxy(['/**', '!**.js', '!**.css'], {
    target: 'http://localhost:3000',
    forward: 'http://localhost:3000/'
});

module.exports = {
    server: {
        baseDir: [
            "./src",
            "./build/contracts"
        ]
    }/*,
    middleware: [
        fomoProxy
    ]*/
};
