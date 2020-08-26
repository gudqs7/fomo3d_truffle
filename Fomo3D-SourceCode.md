# Fomo3D 合约源码分析

### 准备工作
#### 环境准备 (用于调试合约)
  - git, nodejs, Chrome
  - ganache-cli, remix-ide


#### 代码 及 IDE
> 安装好 Git 后, 下载源码 `git clone https://github.com/reedhong/fomo3d_clone.git`  
安装好 nodejs 后, 使用 npm 安装2个东西(建议使用国内镜像源:cnpm)
` npm install ganache-cli -g & npm install remix-ide -g `  


> 至于IDE 上的选择, 只要 IDE 支持 sol 语法, 如 idea 就有 solidity 插件, 亦或者 vscode 也很棒, 而且中文支持比较好, 还对于大文件 js 及 json 打开速度比较快, 编辑也比较流畅( idea 可能是插件太多, 各种语法解析比较卡)

### 源码结构		
```
+-- interface	 
|	 +-- DiviesInterface.sol
|	 +-- F3DexternalSettingsInterface.sol
|	 +-- HourglassInterface.sol
|	 +-- JIincForwarderInterface.sol
|	 +-- JIincInterfaceForForwarder.sol
|	 +-- PlayerBookInterface.sol
|	 +-- PlayerBookReceiverInterface.sol
|	 +-- TeamJustInterface.sol
|	 +-- otherFoMo3D.sol
+-- library	
|	 +-- F3DKeysCalcLong.sol
|	 +-- F3Ddatasets.sol
|	 +-- MSFun.sol	
|	 +-- NameFilter.sol
|	 +-- SafeMath.sol	
|	 +-- UintCompressor.sol
+-- Divies.sol
+-- F3Devents.sol	
+-- F3DexternalSettings.sol	
+-- FoMo3Dlong.sol	
+-- Hourglass.sol	
+-- JIincForwarder.sol
+-- PlayerBook.sol	
+-- TeamJust.sol	
+-- modularLong.sol
```

> 以上就是 reed 大佬整理的源码结构, 看到这么多文件, 心里感觉好慌, 别怕, 其实大多数文件都是摆设, 没有太多逻辑代码, 我们主要需要看的, 也就是那么几个合约, 既然如此, 我们先排除一些用处不大, 非游戏关键核心的合约


### 各大收款合约
 - JIincForwarder.sol (JIincForwarderInterface 类型变量的实际引用), 用于向项目基金会转账
 - otherFoMo3D.sol (游戏 activate 前必须设置的 otherFomo 变量的实际引用), 向不知道哪个地址转账
 - Divies.sol (DeviesInterface 类型变量的实际引用), 用于 p3d 分红

#### JIincForwarder.sol
> 这个合约就是向 基金会地址 转发 ether, 单独写一个中转的好处就是灵活, 这个合约可以做到基金会地址安全转移, 也就是说中途可以改变基金会的转账地址, 而这个过程需要新旧2个合约共同完成(旧.startMigration(新地址)--> 新.finishMigration(), 中途 旧方可以 旧.cancelMigration(), 而完成地址转移后, 新地址完全替代旧地址 )  
> 其中比较转账逻辑就是调用下面的这个接口对应的实际合约 的 deposit 方法 

```
interface JIincInterfaceForForwarder {
    function deposit(address _addr) external payable returns (bool);
    function migrationReceiver_setup() external returns (bool);
}
```
> 至于现在这个基金会的地址到底是啥, 可以通过 status() 方法查看哦

#### otherFoMo3D.sol
> 这个合约很有意思, 或者说它的背后很有意思, 大家都想知道 其他的 fomo 到底是啥, 据说不是 soon 版  
> 至于逻辑上, 这个 potSwap 的调用时机是在玩家买 key 的时候, 而它的作用, 我认为是游戏间的奖池交换  
> 比如说, fomolong 共有100个 ether 买入, 那么就会有1%流向 otherFomo 的奖池, 同理, otherFomo 里应该也会有这个逻辑的存在, 这么做有啥用就交给大家自己思考了

```

interface otherFoMo3D {
    function potSwap() external payable;
}

fomo3Dlong 代码: (fomo3Dlong本身也可以是一个 otherFomo, 甚至在 真正的otherFomo 里它的那个 otherFomo 就是 fomo3Dlong 也不一定)

function potSwap()
    external
    payable
{
    // setup local rID
    uint256 _rID = rID_ + 1;
    
    round_[_rID].pot = round_[_rID].pot.add(msg.value); // 奖池金额增加
    emit F3Devents.onPotSwapDeposit(_rID, msg.value);
}
```

#### Divies.sol

> 这部分是给 P3D 分红的, 代码很简单, 就一个转账的调用, 调用时机上, 首先是买 key 的钱被瓜分时, 有它的一份, 其次当一轮 (Round) 结束后, 又会根据赢的队伍来分配奖池, 抽出一部分给到 P3D

```
interface DiviesInterface {
    function deposit() external payable;
}
```

> 当然这其中如何给 P3D 分红我还没搞太懂, 大致流程貌似是: 买 key分红 --> 调用 Divies 的 deposit 方法, Divies 合约中此方法无具体实现(空方法, 啥也不干, 就收钱) --> 预计什么时候会有 P3D 的玩家来调用这个合约的 distribute 方法, 而 这个方法的作用似乎是将 分红转来的钱拿去投入 P3D, 然后卖出, 根据传入的百分比决定是否继续投入或重复投入和售出多少次, 最后把钱提现回来(可能就没多少了), 而钱通过10% 的分红机制全给了 P3D 的用户??? 这一块一直不太懂, 而且这个方法的 调用时机不明, 调用时还增加了 时间限制和拥挤队列的限制. 总的将这里面就是存在给 P3D 分红的钱, 但这钱啥时候 给 P3D, 我还是没猜出来.

### 3大合约
> 光是转账合约就感觉有些看不懂了, 真是头疼啊, 只好把不懂的放下, 留待日后琢磨. 还是先分析游戏核心代码吧

 - TeamJust.sol
 - PlayerBook.sol
 - FoMo3Dlong.sol

#### TeamJust.sol

> 首先看 TeamJust.sol , 这个是用来做权限控制的, 里面 除了与 muitiSig( 这个以后说 )相关的几个方法, 也就是管理 admin 和 dev 了, 如 `addAdmin` `removeAdmin`, 而 `isDev` `isAdmin` 则是拿来给其他合约调用(比如 playerBook 的 onlyDevs) 

 ```
function setup(address _addr)
    onlyDevs()
    public
{
    require( address(Jekyll_Island_Inc) == address(0) );
    Jekyll_Island_Inc = JIincForwarderInterface(_addr);
}  
 ```
 
 > 经过我的观察发现, 这个 teamJust 合约应该是比较后加的, 比如 fomo3Dlong 合约的激活就没有使用, 而2个合约不同的对于 `Jekyll_Island_Inc` 的赋值也让我推测这可能是较新的写法. 我也觉得这种通过调用合约赋值的方式比较好, 所以在我整的 项目 [fomo3d_truffle](https://github.com/gudqs7/fomo3d_truffle) 中, 我把 activate 函数的用户限制 也改成了 用 teamJust 来做, 而 其中的 playerBook 和 teamJust 实际合约地址也是通过 类似上面 setup 的方式 赋值, 这么做还有个好处就是可以通过 truffle 一键把这些合约部署且赋值, 而不是弄一个改源码重新编译这种测试起来比较麻烦的方式

#### PlayerBook.sol

> 这个合约主要是管理 玩家信息, 而玩家信息则分为 name, id, addr, id 是根据地址是否存在自增生成的, 而 name 则是通过 花钱注册可用于推广获取提成的! 合约内大多方法都像个数据库一样均为 crud 操作, 夹带的逻辑无非就是一些验证, 其他的都比较少, 里面比较有意思的点就是 addGame 

```
function addGame(address _gameAddress, string _gameNameStr)
    onlyDevs()
    public
{
    require(gameIDs_[_gameAddress] == 0, "derp, that games already been registered");
    
    if (multiSigDev("addGame") == true)
    {deleteProposal("addGame");
        gID_++;
        bytes32 _name = _gameNameStr.nameFilter();
        gameIDs_[_gameAddress] = gID_;
        gameNames_[_gameAddress] = _name;
        games_[gID_] = PlayerBookReceiverInterface(_gameAddress);
    
        games_[gID_].receivePlayerInfo(1, plyr_[1].addr, plyr_[1].name, 0);
        games_[gID_].receivePlayerInfo(2, plyr_[2].addr, plyr_[2].name, 0);
        games_[gID_].receivePlayerInfo(3, plyr_[3].addr, plyr_[3].name, 0);
        games_[gID_].receivePlayerInfo(4, plyr_[4].addr, plyr_[4].name, 0);
    }
}
```

> 这里是把 fomo3Dlong 的地址和名称传入, 然后就会通过接口向 fomo3Dlong 传入几个预设的玩家信息(来自 playerbook的构造方法), 而调用过这个方法后, `registerNameXxxxFromDapp` 这样的方法才能不被 `isRegisteredGame` 拦截. 所以部署时, 这一步是必做的.   

> 其他的几个点: 可设置的注册费用, 且费用被转到基金会;  购买 key 邀请分红总是和访问的链接的推广码有关, 只有在无推广码时, 才从历史中获取 laff, 而 laff 每访问一个推广码(并买了 key)都在改变


#### FoMo3Dlong.sol

> 主要合约啊, 先看下 所有的 state 变量

```
string constant public name = "FoMo3D Long Official";
string constant public symbol = "F3D";
uint256 private rndExtra_ = extSettings.getLongExtra();     // length of the very first ICO 
uint256 private rndGap_ = extSettings.getLongGap();         // length of ICO phase, set to 1 year for EOS.
uint256 constant private rndInit_ = 1 hours;                // round timer starts at this
uint256 constant private rndInc_ = 30 seconds;              // every full key purchased adds this much to the timer
uint256 constant private rndMax_ = 24 hours;                // max length a round timer can be  
uint256 public airDropPot_;             // person who gets the airdrop wins part of this pot
uint256 public airDropTracker_ = 0;     // incremented each time a "qualified" tx occurs.  used to determine winning air drop
uint256 public rID_;  

mapping (address => uint256) public pIDxAddr_;          // (addr => pID) returns player id by address
mapping (bytes32 => uint256) public pIDxName_;          // (name => pID) returns player id by name
mapping (uint256 => F3Ddatasets.Player) public plyr_;   // (pID => data) player data
mapping (uint256 => mapping (uint256 => F3Ddatasets.PlayerRounds)) public plyrRnds_;    // (pID => rID => data) player round data by player id & round id
mapping (uint256 => mapping (bytes32 => bool)) public plyrNames_; // (pID => name => bool) list of names a player owns.  (used so you can change your display name amongst any name you own)

mapping (uint256 => F3Ddatasets.Round) public round_;   // (rID => data) round data
mapping (uint256 => mapping(uint256 => uint256)) public rndTmEth_;      // (rID => tID => data) eth in per team, by round id and team id

mapping (uint256 => F3Ddatasets.TeamFee) public fees_;          // (team => fees) fee distribution by team
mapping (uint256 => F3Ddatasets.PotSplit) public potSplit_;     // (team => fees) pot split distribution by team
```

> 大部分都可以通过 变量名 猜出个大概, 实在不行可以搜索大致看一下哪里用了, 结合的先看一下, 其他都是各种数据, 没啥复杂的, 这里就主要看下 fees_ 和 potSplit_

```
// Team allocation percentages
// (F3D, P3D) + (Pot , Referrals, Community)
    // Referrals / Community rewards are mathematically designed to come from the winner's share of the pot.
fees_[0] = F3Ddatasets.TeamFee(30,6);   //50% to pot, 10% to aff, 2% to com, 1% to pot swap, 1% to air drop pot
fees_[1] = F3Ddatasets.TeamFee(43,0);   //43% to pot, 10% to aff, 2% to com, 1% to pot swap, 1% to air drop pot
fees_[2] = F3Ddatasets.TeamFee(56,10);  //20% to pot, 10% to aff, 2% to com, 1% to pot swap, 1% to air drop pot
fees_[3] = F3Ddatasets.TeamFee(43,8);   //35% to pot, 10% to aff, 2% to com, 1% to pot swap, 1% to air drop pot
    
// how to split up the final pot based on which team was picked
// (F3D, P3D)
potSplit_[0] = F3Ddatasets.PotSplit(15,10);  //48% to winner, 25% to next round, 2% to com
potSplit_[1] = F3Ddatasets.PotSplit(25,0);   //48% to winner, 25% to next round, 2% to com
potSplit_[2] = F3Ddatasets.PotSplit(20,20);  //48% to winner, 10% to next round, 2% to com
potSplit_[3] = F3Ddatasets.PotSplit(30,10);  //48% to winner, 10% to next round, 2% to com
```

> fees_ 就是用来决定 玩家 买 key 后, 买 key 的 ether 怎么分配, 其中 2% 基金会(com) + 1% (otherFomo) + 1% 空投池 + fees_[].p3d % P3D + fees_[].gen % 收益, 10% 给 推荐人(无则给P3D)  
> 总结就是 14% 固定 + 86% 可设定, 86% 分3块( gen+p3d+pot ),所以2队是56% gen + 10% p3d + 20% pot, 其他队伍类似  
> potSplit_ 类似, 固定的 48%(win)+2%(com) + 50% 可设定, 分3块(gen+p3d+nextround), 如2队的 20 gen + 20 p3d + 10 next


然后讲讲所有的方法, 简单的归类下

```
修饰器
isActivated() 			//拦截游戏未激活
isHuman()					//听说拦截非人类?
isWithinLimits(eth)		//拦截太穷的人和 v 神 ???

ether 买		//从不同地址进的, 第一个参数是推荐人标识, 第二个是选的 team
buyXid(id, team)  	
buyXaddr(addr, team)
buyXname(name, team)

valuts 买		//从不同地址进的, 第一个参数是推荐人标识, 第二个是选的 team, 第三个是根据 key 数量计算出来的 eth
reLoadXid(id, team, eth)	
reLoadXaddr(addr, team, eth)
reLoadXname(name, team, eth)


buyCore  			// 这里就是判断了一下本轮是否结束了, 然后直接调用的 core,当然结束会走 endRound
reLoadCore		// 同上, 结束的判断, 还有就是减去 gen 的金额, 再调用 core
core				// 限制前100eth, 更新 end 时间, 超过0.1eth 判断空投, 更新玩家及轮次等数据, 调用2个分红方法
distributeExternal 	// 给固定的13% (10% aff,2% com,1% otherFomo) 及 P3D 打钱
distributeInternal	// 给空投1% 和 gen 和 pot 打钱

提现跑路
withdraw() 	

结束一轮
endRound()	// pot 分成5分, win 拿48%, 2%给 com, 还有 gen, p3d, nextRound 则根据配置来分配, 其中 p3d 和下一轮逻辑比较简单, 而 gen 我还没太懂, 因为涉及到 mask 的我都没看明白( 没时间细看, 全是数学, 要慢慢推理分析 )		

注册 name		//注册一个 name 用于推广获取提成, 第一个参数是 name 标识, 第二个是推荐人的标识, 第三个是是否同步到其他游戏
registerNameXID(name, id, all) 
registerNameXaddr(name, addr, all)
registerNameXname(name, name, all)

玩家信息相关 , 前2个一般是给外部调用的
receivePlayerInfo			//将传入玩家信息储存
receivePlayerNameList		//储存玩家的所有name
determinePID				//确定玩家信息, 若无则生成一个 pid

玩家分红, keys相关
calcUnMaskedEarnings  		// 实现看不懂, 不过方法作用是用来计算能提现的收益
calcKeysReceived(rid, eth)	// 根据轮次返回 用eth能买多少 keys
iWantXKeys					// 根据 key 数量返回需要多少 eth
managePlayer					// 第 x 轮时将上一轮的收益移至此轮, 仅轮次开始后第一次购买执行
updateGenVault				// 计算及更新收益
updateMasks					// 更新被锁定的收益
withdrawEarnings				// 计算可提现的收益

```

> 这么多方法, 我也只能列个大致作用和我看的懂的逻辑, 具体的细节等我参透再出文章  

> 最后总结游戏大致逻辑 :  玩家买 key--> buyXxx(relaodXxx) 方法--> xxxCore --> core --> distributeExternal & distributeInternal --> 游戏结束 --> 玩家 buy 触发 endRound --> 分了钱 pot 的钱, 部分转入下一轮 --> 激活新一轮 --> 接上最开始 进入循环 !!! 当然中途可以提现自己没锁住的收益, 以及注册 name 拉人啥的. 

### 几个有意思的类库

#### MSFun.sol

> 首先说下, 这个库是用来做多重签名的, 啥意思呢? 就是一个方法, 必须好几个(多)人同意执行, 最后才会执行. 用法如下: 

```
 *                                ┌────────────────────┐
 *                                │ Setup Instructions │
 *                                └────────────────────┘
 * (Step 1) import the library into your contract
 * 
 *    import "./MSFun.sol";
 *
 * (Step 2) set up the signature data for msFun
 * 
 *     MSFun.Data private msData;
 *                                ┌────────────────────┐
 *                                │ Usage Instructions │
 *                                └────────────────────┘
 * at the beginning of a function
 * 
 *     function functionName() 
 *     {
 *         if (MSFun.multiSig(msData, required signatures, "functionName") == true)
 *         {
 *             MSFun.deleteProposal(msData, "functionName");
 * 
 *             // put function body here 
 *         }
 *     }
```

> 大致就是先导包, 然后定义一个 MSFun.data 作为区分合约的标识, 然后再方法中使用 if 包围, if 第一句就是将之前的签名清空

> MSFun.multiSig( data标识, 需要签名的数量, 方法名称 )

> 最后说下此类库在 fomo 中的样子: 首先 data 照旧, 而需要签名的数量来自 teamJust.sol, 它的定义是构造是初始为1, 以后每 add 一个 admin 或 dev 就把对应的 requiredSignatures 加一, remove 同理, 减一. 所以在部署时不改代码的话, 只要满足对应的身份限制, 加了这个MSFun.muitiSig 的方法默认是一个人调用就能执行

#### SafeMath.sol

> 这个没啥好说的, 操作金额必备, 听说狼人杀就是少了这个被攻击的(整形溢出), 也许可以不懂怎么攻击, 但一定要懂怎么防范, so 

```
/**
* @dev Multiplies two numbers, throws on overflow.
*/
function mul(uint256 a, uint256 b) 
    internal 
    pure 
    returns (uint256 c) 
{
    if (a == 0) {
        return 0;
    }
    c = a * b;
    require(c / a == b, "SafeMath mul failed");
    return c;
}
```
> 如你所见, 简单的判断即可确保不会由于溢出导致数据错乱


#### F3DKeysCalcLong.sol

> 我只能猜到作用, 至于完全理解... 没上过大学的我瑟瑟发抖

```
keysRec(curEth, newEth)			// 第一个参数就是using 后的调用方, 第二个参数是 准备花的 eth, 如我花0.01 eth , 用 round_[rId].eth.keysRec(0.01 eth); 得出的就是当前轮次时0.01eth 能买多少个 key, 注意返回的 keys 很大, 1个 实际上是 1e18 吧, 
ethRec(curKeys, sellKeys)		// 同上, 输入想买的 keys 数量, 返回当前轮次 keys 基数下购买 keys 需要花的 eth
keys(eth)						// 根据 eth 计算可得多少 keys
eth(keys)						// 根据 keys 计算需要多少 eth
```

bundle.js 中, iWantKeys 逻辑

``` js
count = BN(parseInt(count) * 1e18)
let priceQuotation = await JUST.Bridges.Browser.contracts.Quick.read('iWantXKeys', count)
```

> keys 和 eth 应该是对应的, 而 eth 的变化规律如果画图的话应该是 指数级上升? 可以画成函数看看


