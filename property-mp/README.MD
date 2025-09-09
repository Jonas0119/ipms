## IPMS 物业端小程序

> 请将本目录下`project.config.json`中的appid修改为对应的appid后发布，发布前记得前往小程序控制台配置api、上传下载白名单

## 项目分析报告

### 技术栈
- **框架**: 微信小程序原生开发
- **UI组件库**: 自研组件库（基于Vant设计风格）
- **状态管理**: 全局App数据管理
- **网络请求**: 基于wx.request封装的请求工具
- **文件上传**: 阿里云OSS直传
- **版本**: 1.1.12

### 项目结构
```
src/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式
├── config.js             # 项目配置文件
├── assets/               # 静态资源
├── components/           # 自定义组件库
│   ├── action-sheet/     # 操作面板
│   ├── button/           # 按钮组件
│   ├── calendar/         # 日历组件
│   ├── car-number/       # 车牌号组件
│   ├── image-cropper/    # 图片裁剪器
│   ├── uploader/         # 文件上传组件
│   └── ...               # 其他UI组件
├── pages/                # 页面目录
│   ├── home/             # 首页
│   ├── login/            # 登录页
│   ├── mission/          # 任务管理
│   ├── repair/           # 维修管理
│   ├── complain/         # 投诉管理
│   └── ...               # 其他业务页面
├── utils/                # 工具函数
│   ├── request.js        # 网络请求封装
│   ├── storage.js        # 本地存储工具
│   ├── oss.js           # OSS上传工具
│   └── file.js          # 文件处理工具
└── constants/            # 常量定义
```

### 认证机制
- **Token名称**: `IPMS-TOKEN`
- **认证头**: `ipms-pc-token`
- **用户ID存储**: `USER_ID`
- **认证流程**: 微信授权登录 → 获取手机号 → 后端验证 → 返回token

### API接口配置
- **后端地址**: `http://127.0.0.1:6688`
- **接口前缀**: `/pc`
- **完整URL格式**: `${API_HOST}/pc${url}`
- **请求头设置**:
  ```js
  header: {
    ['ipms-pc-token']: storage.token(),
    ['wechat-mp-request']: true
  }
  ```

### 文件上传实现
1. **上传方式**: 阿里云OSS直传
2. **上传流程**:
   - 调用 `/pc/upload/sign` 获取OSS签名
   - 使用签名直接上传到OSS
   - 返回文件URL
3. **支持功能**:
   - 图片/视频上传
   - 文件大小限制
   - 文件类型验证
   - 上传进度显示

### 主要业务模块
- **首页**: 工作统计、快捷操作
- **任务管理**: 任务分配、执行、报告
- **维修管理**: 维修申请、处理、完成
- **投诉管理**: 投诉处理、反馈
- **访客管理**: 访客登记、认证
- **会议管理**: 会议安排、参与
- **请假管理**: 请假申请、审批
- **采购管理**: 采购申请、审批

### 401错误分析
**错误信息**: `POST http://127.0.0.1:6688/pc/statistic/work 401 (Unauthorized)`

**可能原因**:
1. **Token过期或无效**: 检查本地存储的`IPMS-TOKEN`是否有效
2. **认证头不匹配**: 认证头已统一为`ipms-pc-token`
3. **用户未登录**: 登录状态丢失，需要重新登录
4. **后端服务问题**: 后端认证服务异常

**解决方案**:
1. 检查登录状态，重新登录获取有效token
2. 确认后端认证头配置是否一致
3. 检查后端服务是否正常运行
4. 查看网络请求日志确认token传递

### 配置文件

详见本目录下`src/config.js`

```js
// 服务端域名
export const API_HOST = 'http://127.0.0.1:6688';

// 对象存储域名
export const ASSETS_HOST = '';

// 本地存储 token 字段名
export const TOKEN_NAME = 'IPMS-TOKEN';

// 本地存储 用户id 字段名
export const USER_ID = 'USER_ID';

// 微信最低版本
export const WECHAT_VERSION = '7.0.0';

// 微信sdk最低版本
export const SDK_VERSION = '2.16.0';

// 小程序版本
export const VERSION = '1.1.12';
```
