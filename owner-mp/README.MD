## IPMS 业主端小程序

> 请将本目录下`project.config.json`中的appid修改为对应的appid后发布，发布前记得前往小程序控制台配置api、上传下载白名单

## 📋 用户完整流程

### 🚀 流程概览

从用户打开小程序到完成房产信息输入的完整流程：

```
用户打开小程序 → 应用启动检查 → 登录认证 → 补充用户信息 → 绑定手机号 → 关联小区 → 填写房产信息
```

**详细用户流程文档：** 请查看 [USER_FLOW.md](./USER_FLOW.md) 获取完整的技术实现细节。

### 🔄 主要阶段说明

#### 1. 应用启动阶段（app.js）
- **检查更新**：自动检测小程序版本更新
- **设备适配**：获取设备信息，计算导航栏高度
- **登录状态检查**：验证本地token，决定是否跳转登录页

#### 2. 用户登录阶段（pages/login/index.js ↔ /mp/user/login）
- **前端**：获取微信登录code，收集设备信息
- **后端**：验证微信code，创建/更新用户记录，生成token
- **流程**：根据用户状态自动跳转到对应页面

#### 3. 信息补充阶段（pages/zone/supplement.js ↔ /mp/user/supplement）
- **获取微信信息**：授权获取用户昵称和头像
- **绑定手机号**：通过微信API获取用户手机号（/mp/user/bind_phone）
- **完善资料**：填写真实姓名、身份证、个性签名等

#### 4. 小区关联阶段（pages/community/binding.js）
- **自助绑定**：系统自动匹配已有房产信息
- **扫码绑定**：扫描物业或家庭成员提供的二维码
- **自主申请**：手动填写小区房产信息等待审核

#### 5. 房产申请阶段（pages/community/append.js ↔ /mp/apply/create）
- **信息填写**：小区名称、住宅/车位/仓库信息
- **订阅消息**：获取模板消息权限（带容错机制）
- **提交申请**：创建业主认证申请，等待物业审核

### 🔧 技术特点

- **完整的错误处理**：每个阶段都有相应的异常处理和用户提示
- **智能流程控制**：根据用户状态自动跳转到合适的页面
- **容错机制**：模板消息失败不影响主要业务流程
- **安全认证**：使用token进行API认证，自动处理登录过期

### 配置文件

详见本目录下`src/config.js`

```js
// 服务端域名
export const API_HOST = '';

// 对象存储域名
export const ASSETS_HOST = '';

// 本地存储 token 字段名
export const TOKEN_NAME = 'IPMS-TOKEN';

// 本地存储 用户id 字段名
export const USER_ID = 'USER_ID';

// 服务端权限认证字段（修改请修改服务端配置 token.mp）
export const AUTH_HEADER_NAME = 'ipms-mp-token';

// 微信最低版本
export const WECHAT_VERSION = '7.0.0';

// 微信sdk最低版本
export const SDK_VERSION = '2.16.0';

// 小程序版本
export const VERSION = '1.1.8';

```


### 模板消息配置

> 模板id请在`server/src/constant/tpl.ts`中更新

#### 报修工单分配通知

字段名称`MP_REPAIR_ALLOT_TPL`

```
订单号 {{character_string1.DATA}}
订单状态 {{phrase2.DATA}}
温馨提示 {{thing5.DATA}}
订单时间 {{time3.DATA}}
```

#### 报修工单接单通知

字段名称`MP_REPAIR_CONFIRM_TPL`

```
订单号 {{character_string1.DATA}}
订单状态 {{phrase3.DATA}}
地址信息 {{thing4.DATA}}
订单时间 {{time2.DATA}}
```

#### 报修工单完成通知

字段名称`MP_REPAIR_CONFIRM_TPL`

```
报修位置 {{thing2.DATA}}
备注 {{thing4.DATA}}
报修时间 {{date1.DATA}}
```

#### 投诉工单受理通知

字段名称`MP_COMPLAIN_ALLOT_TPL`

```
园区名称 {{thing1.DATA}}
受理状态 {{thing4.DATA}}
回复时间 {{time7.DATA}}
```

#### 投诉工单处理通知

字段名称`MP_COMPLAIN_CONFRIM_TPL`

```
小区 {{thing4.DATA}}
处理内容 {{thing2.DATA}}
处理状态 {{phrase1.DATA}}
```

#### 挪车状态通知

字段名称`MP_MOVE_CAR_TPL`

```
请求状态 {{phrase1.DATA}}
处理人员 {{thing2.DATA}}
处理时间 {{time3.DATA}}
```

#### 业主认证通知

字段名称`MP_OWER_APPROVE`

```
认证户主 {{name2.DATA}}
认证户室 {{thing1.DATA}}
认证时间 {{time3.DATA}}
```



#业主端小程序用户流程详解

## 完整用户流程概览

从用户打开小程序到完成房产信息输入的完整流程，涉及以下主要步骤：

```
用户打开小程序 → 应用启动检查 → 登录认证 → 补充用户信息 → 绑定手机号 → 关联小区 → 填写房产信息
```

---

## 1. 小程序启动阶段

### 前端代码：`owner-mp/src/app.js`

当用户打开小程序时，微信会自动执行 `App` 的生命周期函数：

#### 1.1 `onLaunch()` - 应用启动
```javascript
onLaunch() {
    // 检查更新
    this.checkUpdate();
    // 适配
    this.adaptive();
    // 检查网络
    this.checkNetwork();
}
```

**功能说明：**
- **检查更新**：检测小程序是否有新版本，提示用户更新
- **设备适配**：获取设备信息，计算导航栏高度等适配参数
- **网络检查**：检测网络连接状态，如果无网络则跳转到错误页面

#### 1.2 `onShow()` - 应用显示
```javascript
onShow(opts) {
    if (utils.storage.isLogin()) {
        this.getUserInfo();
    } else {
        // 构建重定向URL
        const query = [];
        for (let key in opts.query) {
            query.push(`${key}=${opts.query[key]}`);
        }
        const redirect = encodeURIComponent(`/${opts.path}${query.length ? '?' : ''}${query.join('&')}`);

        // 跳转到登录页面
        return wx.redirectTo({
            url: `/pages/login/index?redirect=${redirect}`
        });
    }
}
```

**流程判断：**
- 检查本地存储中是否有登录token（`utils.storage.isLogin()`）
- **有token**：调用 `getUserInfo()` 获取用户信息
- **无token**：跳转到登录页面，并保存当前页面路径用于登录后跳转

---

## 2. 用户登录阶段

### 前端代码：`owner-mp/src/pages/login/index.js`

#### 2.1 登录页面初始化
```javascript
onLoad(opts) {
    this.setData({
        redirect: opts.redirect ? decodeURIComponent(opts.redirect) : null
    });
}
```

#### 2.2 用户点击登录
```javascript
login() {
    // 检查用户协议同意状态
    if (!agree) {
        return $notify({
            customNavBar: true,
            type: 'danger',
            message: '请阅读并同意用户协议'
        });
    }

    // 调用微信登录API
    wx.login({
        success: ({ code }) => {
            const { brand, model, system, platform } = this.data.systemInfo;

            // 发送登录请求到后端
            utils.request({
                url: '/user/login',
                method: 'post',
                data: {
                    code,          // 微信登录凭证
                    brand,         // 设备品牌
                    model,         // 设备型号
                    system,        // 操作系统
                    platform       // 平台信息
                }
            })
        }
    });
}
```

### 后端代码：`api-server/src/module/mp/controller/user/login.ts`

#### 2.3 后端处理登录请求

**API路径：** `POST /mp/user/login`

```typescript
response: async ctx => {
    const { code, brand, model, system, platform } = ctx.request.body;
    
    // 1. 通过微信code获取用户session信息
    const mpSessionInfo = await wechatService.getUserMpSession(code);
    
    if (!mpSessionInfo.success) {
        return ctx.body = {
            code: WEHCAT_MP_LOGIN_ERROR,
            message: mpSessionInfo.message
        };
    }

    // 2. 生成用户token
    const token = utils.crypto.md5(`${mpSessionInfo.data.openid}${Date.now()}`);
    
    // 3. 查询或创建用户记录
    let mpUserInfo = await ctx.model
        .from('ipms_wechat_mp_user')
        .leftJoin('ipms_wechat_official_accounts_user', ...)
        .where('ipms_wechat_mp_user.open_id', mpSessionInfo.data.openid)
        .select(...)
        .first();

    if (!mpUserInfo) {
        // 新用户：创建用户记录
        mpUserInfo = {
            open_id: mpSessionInfo.data.openid,
            union_id: mpSessionInfo.data.unionid || null,
            phone: null,
            created_at: Date.now()
        };
        
        const [id] = await ctx.model.from('ipms_wechat_mp_user').insert(mpUserInfo);
        // 设置默认值
        mpUserInfo.id = id;
        mpUserInfo.intact = INCOMPLETE_USER_INFO; // 用户信息不完整
        
        // 创建认证记录
        await ctx.model.from('ipms_wechat_mp_auth').insert({
            wechat_mp_user_id: mpUserInfo.id,
            token
        });
    } else {
        // 老用户：更新token
        await ctx.model
            .from('ipms_wechat_mp_auth')
            .where({ wechat_mp_user_id: mpUserInfo.id })
            .update({ token });
    }

    // 4. 记录登录日志
    await ctx.model.from('ipms_wechat_mp_user_login').insert({
        wechat_mp_user_id: mpUserInfo.id,
        ip: ctx.request.ip,
        brand, model, system, platform,
        login_at: Date.now()
    });

    // 5. 获取用户关联的小区信息
    const communityInfo = await communityService(ctx.model, mpUserInfo.id);

    // 6. 返回登录结果
    ctx.body = {
        code: SUCCESS,
        data: {
            token,           // 认证token
            userInfo: mpUserInfo,      // 用户信息
            communityInfo    // 小区信息
        }
    };
}
```

#### 2.4 前端处理登录结果

```javascript
.then(res => {
    // 保存token和用户ID到本地存储
    utils.storage.login(res.data.token);
    utils.storage.setUserId(res.data.userInfo.id);

    // 更新全局数据
    this.bridge.updateData({
        userInfo: res.data.userInfo,
        communityInfo: res.data.communityInfo,
        globalFetching: false
    });

    // 根据用户状态进行页面跳转
    if (!res.data.userInfo.intact) {
        // 用户信息不完整，跳转到补充信息页面
        wx.redirectTo({
            url: '/pages/zone/supplement'
        });
    } else if (res.data.communityInfo.list.length === 0) {
        // 未关联小区，跳转到小区绑定页面
        wx.redirectTo({
            url: '/pages/community/binding'
        });
    } else if (this.data.redirect !== null) {
        // 有重定向地址，跳转到目标页面
        wx.redirectTo({
            url: this.data.redirect
        });
    } else {
        // 正常登录，跳转到首页
        wx.switchTab({
            url: '/pages/home/index'
        });
    }
})
```

---

## 3. 补充用户信息阶段

### 前端代码：`owner-mp/src/pages/zone/supplement.js`

如果用户信息不完整（`intact = false`），系统会自动跳转到个人信息补充页面。

#### 3.1 获取微信授权信息
```javascript
useWechatInfo() {
    wx.getUserProfile({
        desc: '用于完善用户信息',
        success: res => {
            this.setData({
                nick_name: res.userInfo.nickName
            });
            
            // 下载并上传微信头像到OSS
            wx.downloadFile({
                url: res.userInfo.avatarUrl,
                success: res => {
                    // 计算文件hash
                    utils.file.md5(res.tempFilePath).then(hash => {
                        const fileName = `avatar/${hash}${utils.file.ext(res.tempFilePath)}`;
                        
                        // 获取OSS上传签名
                        utils.oss(fileName).then(sign => {
                            // 上传文件到OSS
                            wx.uploadFile({
                                url: sign.host,
                                filePath: res.tempFilePath,
                                name: 'file',
                                formData: sign,
                                success: () => {
                                    this.setData({
                                        avatar_url: `/${sign.key}`
                                    });
                                }
                            });
                        });
                    });
                }
            });
        }
    });
}
```

#### 3.2 绑定手机号

用户需要点击"获取手机号"按钮授权：

```javascript
getPhoneNumber(e) {
    utils.request({
        url: '/user/bind_phone',
        method: 'post',
        data: {
            code: this.data.loginCode,          // 登录凭证
            encryptedData: e.detail.encryptedData, // 加密数据
            iv: e.detail.iv                     // 初始向量
        }
    })
    .then(res => {
        // 更新本地用户信息
        this.bridge.updateData({
            userInfo: {
                ...this.data.userInfo,
                phone: res.data.phone
            }
        });
    });
}
```

### 后端代码：`api-server/src/module/mp/controller/user/bind_phone.ts`

**API路径：** `POST /mp/user/bind_phone`

```typescript
response: async ctx => {
    const { code, encryptedData, iv } = ctx.request.body;
    
    // 1. 解密获取用户手机号
    const phoneInfo = await wechatService.getUserMpPhone(code, iv, encryptedData);
    
    if (!phoneInfo.success) {
        return ctx.body = {
            code: WEHCAT_MP_GET_PHONE_ERROR,
            message: '获取手机号码失败'
        };
    }

    // 2. 更新用户手机号
    try {
        await ctx.model
            .from('ipms_wechat_mp_user')
            .where({ id: ctx.mpUserInfo.id })
            .update({ phone: phoneInfo.data.purePhoneNumber });
    } catch (error) {
        return ctx.body = {
            code: WEHCAT_MP_GET_PHONE_ERROR,
            message: '绑定手机号失败'
        };
    }

    const { purePhoneNumber: phone } = phoneInfo.data;

    ctx.body = {
        code: SUCCESS,
        data: {
            phone: utils.phone.hide(phone) // 返回脱敏后的手机号
        }
    };
}
```

#### 3.3 提交完整的用户信息

```javascript
save() {
    this.validate(() => {
        const { nick_name, signature, real_name, idcard, avatar_url, userInfo } = this.data;

        utils.request({
            url: '/user/supplement',
            method: 'post',
            data: {
                nick_name,   // 昵称
                signature,   // 个性签名
                real_name,   // 真实姓名
                idcard,      // 身份证号
                avatar_url   // 头像URL
            }
        })
        .then(res => {
            // 更新用户信息状态为完整
            this.bridge.updateData({
                userInfo: {
                    ...userInfo,
                    nick_name,
                    signature,
                    avatar_url,
                    intact: true,           // 信息完整标记
                    gender: res.data.gender // 从身份证解析的性别
                }
            });

            // 跳转到小区绑定页面
            wx.redirectTo({
                url: '/pages/community/binding'
            });
        });
    });
}
```

### 后端代码：`api-server/src/module/mp/controller/user/supplement.ts`

**API路径：** `POST /mp/user/supplement`

```typescript
response: async ctx => {
    const { nick_name, signature, real_name, idcard, avatar_url } = ctx.request.body;

    // 1. 验证用户是否已绑定手机号
    if (!ctx.mpUserInfo.phone) {
        return ctx.body = {
            code: USER_NOT_BINDING_PHONE,
            message: '当前用户未绑定手机号码'
        };
    }

    // 2. 从身份证号解析性别
    const gender = utils.idcard.gender(idcard);

    // 3. 更新用户信息
    await ctx.model
        .from('ipms_wechat_mp_user')
        .where('id', ctx.mpUserInfo.id)
        .update({
            nick_name,
            signature,
            real_name,
            idcard: idcard.toUpperCase(),
            avatar_url,
            gender,
            intact: INTACT_USER_INFO  // 标记信息完整
        });

    ctx.body = {
        code: SUCCESS,
        message: '个人资料补充成功',
        data: { gender }
    };
}
```

---

## 4. 小区关联阶段

### 前端代码：`owner-mp/src/pages/community/binding.js`

用户可以通过多种方式关联小区：

#### 4.1 自助绑定
```javascript
getCommunityInfo() {
    utils.request({
        url: '/community/binding_by_self',
        method: 'get'
    })
    .then(
        res => this.bindSuccesHandler(res),
        res => this.bindFailHandler(res)
    );
}
```

#### 4.2 扫描物业二维码
```javascript
bindByProperty() {
    wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: res => {
            utils.request({
                url: '/community/binding_by_property',
                method: 'post',
                data: {
                    qrcontent: res.result
                }
            })
        }
    });
}
```

#### 4.3 扫描家庭成员二维码
```javascript
bindByFamily() {
    wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: res => {
            utils.request({
                url: '/community/binding_by_family',
                method: 'post',
                data: {
                    qrcontent: res.result
                }
            })
        }
    });
}
```

#### 4.4 自主申请关联小区
```javascript
slefAppend() {
    wx.navigateTo({ url: '/pages/community/append' });
}
```

---

## 5. 房产信息填写阶段

### 前端代码：`owner-mp/src/pages/community/append.js`

#### 5.1 表单验证
```javascript
validator: {
    formFields: ['community_name', 'house', 'carport', 'warehouse'],
    formRule: {
        community_name: [
            { required: true, message: '请输入小区名称' },
            { max: 56, message: '小区名称不能超过56个字' },
            { min: 2, message: '小区名称应大于2个字' }
        ],
        house: [{ max: 56, message: '住宅信息不能超过56个字' }],
        carport: [{ max: 56, message: '车位信息不能超过56个字' }],
        warehouse: [{ max: 56, message: '仓库信息不能超过56个字' }]
    }
}
```

#### 5.2 提交房产信息

```javascript
save() {
    this.validate(() => {
        const { community_name, house, carport, warehouse } = this.data;

        // 验证至少填写一项房产信息
        if (!house && !carport && !warehouse) {
            return $toast({ message: '住宅、车位、仓房信息必须填写一个' });
        }

        // 获取订阅消息模板
        wx.getSetting({
            withSubscriptions: true,
            success: res => {
                utils.request({
                    url: '/apply/tpl',
                    method: 'get'
                })
                .then(({ data: tpls }) => {
                    // 检查模板ID有效性（容错机制）
                    const validTemplates = Object.values(tpls).filter(tpl => tpl && tpl.trim() !== '');
                    
                    if (validTemplates.length === 0) {
                        // 无有效模板，直接提交
                        send({});
                        return;
                    }

                    // 请求订阅消息权限
                    wx.requestSubscribeMessage({
                        tmplIds: validTemplates,
                        success: res => {
                            // 处理订阅结果并提交申请
                            const data = {};
                            Object.keys(tpls).forEach((key, index) => {
                                const tpl = Object.values(tpls)[index];
                                if (tpl && tpl.trim() !== '') {
                                    data[key] = res[tpl] === 'accept' ? 1 : 0;
                                } else {
                                    data[key] = 0;
                                }
                            });
                            send(data);
                        },
                        fail: () => {
                            // 订阅失败不影响主流程
                            send({});
                        }
                    });
                });
            }
        });

        // 提交申请的核心函数
        const send = data => {
            utils.request({
                url: '/apply/create',
                method: 'post',
                data: {
                    community_name,
                    house,
                    carport,
                    warehouse,
                    ...data  // 订阅消息相关数据
                }
            })
            .then(res => {
                $dialog.alert({
                    title: '提交成功',
                    message: res.data.community_id
                        ? '您的认证申请已提交，请等待物业公司审核'
                        : '系统中未查询到该小区，您的申请会被搁置'
                })
                .then(() => {
                    wx.navigateBack({ delta: 1 });
                });
            });
        };
    });
}
```

### 后端代码：`api-server/src/module/mp/controller/apply/create.ts`

**API路径：** `POST /mp/apply/create`

#### 5.3 后端处理房产申请

```typescript
response: async ctx => {
    const { community_name, house, carport, warehouse, subscribed } = ctx.request.body;

    // 1. 验证至少有一项房产信息
    if (!house && !carport && !warehouse) {
        return ctx.body = {
            code: PARAMS_ERROR
        };
    }

    // 2. 检查当日是否已提交过申请
    const lastInfo = await ctx.model
        .from('ipms_owner_apply')
        .where('wechat_mp_user_id', ctx.mpUserInfo.id)
        .orderBy('id', 'desc')
        .first();

    if (lastInfo && moment().isSame(moment(lastInfo.created_at), 'day')) {
        return ctx.body = {
            code: SUBMIT_EXCEED_LIMIT,
            message: '今日已提交过业主认证'
        };
    }

    // 3. 查询小区是否存在
    const communityInfo = await ctx.model
        .from('ipms_community_info')
        .where('name', community_name)
        .first();

    // 4. 创建申请记录
    const [id] = await ctx.model.from('ipms_owner_apply').insert({
        wechat_mp_user_id: ctx.mpUserInfo.id,
        community_name,
        house: house || null,
        carport: carport || null,
        warehouse: warehouse || null,
        community_id: communityInfo ? communityInfo.id : null, // 小区ID，存在则关联
        subscribed,
        created_at: Date.now()
    });

    ctx.body = {
        code: SUCCESS,
        data: {
            id,
            community_id: communityInfo ? communityInfo.id : null
        }
    };
}
```

---

## 6. 数据库表结构

### 6.1 用户相关表

**ipms_wechat_mp_user** - 小程序用户表
```sql
- id: 用户ID
- open_id: 微信OpenID
- union_id: 微信UnionID
- nick_name: 昵称
- phone: 手机号
- real_name: 真实姓名
- idcard: 身份证号
- gender: 性别
- avatar_url: 头像URL
- signature: 个性签名
- intact: 信息是否完整
- created_at: 创建时间
```

**ipms_wechat_mp_auth** - 认证令牌表
```sql
- id: 记录ID
- wechat_mp_user_id: 用户ID
- token: 认证令牌
```

### 6.2 申请相关表

**ipms_owner_apply** - 业主申请表
```sql
- id: 申请ID
- wechat_mp_user_id: 申请用户ID
- community_name: 小区名称
- house: 住宅信息
- carport: 车位信息
- warehouse: 仓库信息
- community_id: 小区ID（如果匹配到）
- subscribed: 是否订阅消息
- created_at: 申请时间
```

---

## 7. 关键配置文件

### 7.1 小程序配置：`owner-mp/src/config.js`
```javascript
export const API_HOST = 'http://127.0.0.1:6688';  // API服务器地址
export const ASSETS_HOST = '';                      // 静态资源服务器
export const TOKEN_NAME = 'IPMS-TOKEN';            // 本地存储token字段名
export const USER_ID = 'USER_ID';                  // 本地存储用户ID字段名
```

### 7.2 请求工具：`owner-mp/src/utils/request.js`
```javascript
function request({ url, data, method }) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${config.API_HOST}/mp${url}`,
            header: {
                ['ipms-mp-token']: storage.token(),  // 认证token
                ['wechat-mp-request']: true
            },
            data,
            dataType: 'json',
            method,
            success: res => {
                if (res.statusCode === 401) {
                    // token失效，清除本地存储并跳转登录
                    storage.logout();
                    wx.redirectTo({
                        url: '/pages/login/index'
                    });
                }
                // 处理其他状态码...
            }
        });
    });
}
```

---

## 8. 完整流程总结

1. **启动检查阶段**
   - 小程序启动 → 检查更新、设备适配、网络状态
   - 检查登录状态 → 有token继续，无token跳转登录

2. **登录认证阶段**
   - 用户同意协议 → 微信登录获取code → 后端验证并返回token
   - 前端保存token → 根据用户状态决定下一步跳转

3. **信息补充阶段**
   - 用户信息不完整 → 授权获取微信信息 → 绑定手机号 → 补充个人资料
   - 后端验证并更新用户信息 → 标记信息完整

4. **小区关联阶段**
   - 无关联小区 → 提供多种关联方式 → 扫码/自助/自主申请
   - 关联成功后进入正常使用流程

5. **房产申请阶段**
   - 填写小区名称和房产信息 → 获取消息模板 → 请求订阅权限
   - 提交申请 → 后端验证并存储 → 等待物业审核

每个阶段都有完善的错误处理机制和用户引导，确保用户能够顺利完成整个流程。
