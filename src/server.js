const Koa = require('koa');
const path = require('path');
const mime = require('mime');
const fs = require('mz/fs');

// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();

const app = new Koa();
const url = '/';
const dir = 'src';

// log request URL:
app.use(async (ctx, next) => {
    let rpath = ctx.request.path;
    console.log(rpath);
    if (rpath.startsWith('/img')||rpath.startsWith('/js')||rpath.startsWith('/css')||rpath==='/') {
        if (rpath === '/') {
            rpath = '/index.html';
        }
        let fp = path.join(dir, rpath.substring(url.length));
        console.log(fp);
        if (await fs.exists(fp)) {
            ctx.response.type = mime.lookup(rpath);
            console.log(ctx.response.type);
            ctx.response.body = await fs.readFile(fp);
        } else {
            // 文件不存在:
            ctx.response.status = 404;
        }
    } else {
        // 不是指定前缀的URL，继续处理下一个middleware:
        await next();
    }
});

// add url-route:
router.get('/:name', async (ctx, next) => {
    let rpath = '/index.html';
    let fp = path.join(dir, rpath.substring(url.length));
    console.log(fp);
    if (await fs.exists(fp)) {
        ctx.response.type = mime.lookup(rpath);
        console.log(ctx.response.type);
        ctx.response.body = await fs.readFile(fp);
    } else {
        ctx.response.status = 404;
    }
});

router.get('/api/price', async (ctx, next) => {
    var exec = require('child_process').exec;
    var cmdStr = 'curl -L "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"';
    const { stdout, stderr } = await exec(cmdStr);
    ctx.response.type = 'application/json'
    ctx.response.status = 200;
    ctx.response.body = stdout;

});



// add router middleware:
app.use(router.routes());

app.listen(80);
console.log('app started at port 80...');
