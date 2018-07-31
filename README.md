## 说明
本项目通过reed 大佬的 [fomo3d_clone](https://github.com/reedhong/fomo3d_clone) 项目改造而成, 感谢 reed 大佬!!!

经过本人吐血试验折腾, 弄好了一次性编译部署 (没啥必要, 但我就是喜欢死磕)

## 本地部署指南

#### 部署合约: 
```
truffle compile
truffle migrate --reset # 执行后 复制 fomo3dLong 后跟的地址
```

#### 部署前端:

```
cd src/js
sed -i "" 's/{{address}}/0xe80662701fe17ebf9332b6a1bbf762ed1efa5ec7/g' bundle.js # 非 mac 去除 -i 后的 ""
cd ../../
npm install & npm run dev
```

>PS: 前端路径 由于没有 采用专业的后端服务器, 所以 /play /xxx 直接访问均报错, 请再访问出错后, 删除后缀, 重新载入, 等待 loading