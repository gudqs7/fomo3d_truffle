## 说明
本项目通过reed 大佬的 [fomo3d_clone](https://github.com/reedhong/fomo3d_clone) 项目改造而成, 感谢 reed 大佬!!!
 
## 本地部署指南

#### 部署合约: 

> 一共部署了3个合约, 其中3个收款地址被砍掉(改成了部署者的地址), p3d 也砍掉了
> 3个合约 我偷懒没有把合约地址写死, 用的是后续的 set 方法, 所以如果 truffle migrate 最后那段报错了, 可能没有 set 成功, 需要用其他方式调用( truffle console, 或者 remix 等)
> 合约部署完, 如无报错, 直接复制走 FoMo3Dlong 的地址就行了
```
npm install ganache-cli -g
ganache-cli -l 471238800 -g 1 # 开启 testrpc 同时设定 gasLimit 和 gasPrice
truffle compile
truffle migrate --reset # 执行后, 复制 FoMo3Dlong: 后跟的地址
#直接输出最终合约地址, 将不会打印编译过程
truffle migrate --reset | grep 'FoMo3Dlong: 0x' | awk  '{ print $2 }'
```

> 推荐做法   
> truffle migrate --reset > migrate.log  
> cat migrate.log  # 查看有无错误, 如合约均部署成功,但最后报错, 可能有几个赋值方法没有执行(我部署到 kovan 时就发生了这事,可以参考 migrations/2_deploy_fomo3d.js逻辑手动执行)  
> cat migrate.log | grep 'FoMo3Dlong: 0x' | awk  '{ print $2 }'

#### 部署前端:

> 前端没有太多需要改的地方, 若使用英文版, 可参考下面命令行修改地址方式
> 若选择 bundle-cn.js 这个中文版, 则自己找到要修改的地方, 手动修改也行的
> 顺便说下 cn 里面还是 kovan测试网络的配置, 如需使用可把 bundle.js 里面的本地配置拷贝下

```
cd src/js
sed -i "" 's/{{address}}/0x00/g' bundle.js # 非 mac 去除 -i 后的 ""
cd ../../
npm install & npm run start
```

#### 游戏激活(不激活就处于 ICO 中? 不懂...)

> 刚想到一个不一定靠谱的简单方式, 把 migrations 下那个 js 里面加一个 activate 的方法调用

```
npm install remix-ide -g  # 安装个本地的 remix-ide
remix-ide  #注意此时处于项目根目录
```
> OK, 浏览器访问 [remix-ide](localhost:8080), 点击左上角第6个图标( Connect to localhost ), 弹框继续 connect
>
> 左边多出 localhost, 点击 contracts 下的 FoMo3Dlong.sol 文件, ctrl + s , 触发编译 , 下一步
>
> 点击右边的上边的 Run, 选择 web3 provider, 如端口不变, 一路 next, ok, 往下看, 有个选择 合约的 select, 选中 FoMo3Dlong, 然后在 输入框中输入 migrate 得到的合约地址, 然后点击 At Address
>
> 最后点下 合约的 activate 方法


#### 合约源码浅度分析

[Fomo3D 合约源码分析](https://github.com/gudqs7/fomo3d_truffle/blob/master/Fomo3D-SourceCode.md)

> 主要是对源码所有合约整理归类, 解释下合约都有啥作用, 希望对刚接触 fomo3d, 想学习 fomo3d 的有所帮助!