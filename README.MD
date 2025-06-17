## 项目介绍

「e家宜业」是一套基于AGPL v3开源协议开源的智慧物业解决方案。实现了微信公众号、小程序、PC、H5、智能硬件多端打通。 后端采用Koa + Typescript轻量级构建，支持分布式部署；前端使用vue + view-design开发。

> 禁止将本项目的代码和资源进行任何形式的出售和盈利，产生的一切后果由侵权者自负！！

## 产品展示

### web中台

![web1](resources/images/web1.png)
![web3](resources/images/web3.jpg)
![web4](resources/images/web4.jpg)
![web6](resources/images/web6.jpg)
![web8](resources/images/web8.jpg)
![web9](resources/images/web9.jpg)
![web11](resources/images/web11.jpg)

### 业主端小程序

<p align="center" >
<img src="resources/images/owner1.jpg" width="320"/>
<img src="resources/images/owner2.jpg" width="320"/>
<img src="resources/images/owner3.jpg" width="320"/>
<img src="resources/images/owner5.jpg" width="320"/>
<img src="resources/images/owner6.jpg" width="320"/>
<img src="resources/images/owner7.jpg" width="320"/>
</p>

### 员工端小程序

<p align="center" >
<img src="resources/images/pc1.jpg" width="320"/>
<img src="resources/images/pc3.jpg" width="320"/>
<img src="resources/images/pc4.jpg" width="320"/>
<img src="resources/images/pc5.jpg" width="320"/>
</p>

## 如何部署

[查看文档](https://gj4h0z80f2.feishu.cn/docx/H62ndDuUhodT7dx0QIJc1sMFnfc)

## SASS版及定制

> 微信添加好友请备注来意，谢谢。

<img src="resources/images/qrcode.jpg" width="266"/>

## License

![AGPL](resources/images/agplv3.png)


项目分析报告
基于对「e家宜业」智慧物业系统的深入分析，我为您提供以下全面的项目分析：
项目概述
「e家宜业」是一套基于AGPL v3开源协议的智慧物业解决方案，实现了微信公众号、小程序、PC、H5、智能硬件多端打通的完整生态系统。
技术架构
后端技术栈 (api-server)
框架: Koa 2 + TypeScript
数据库: MySQL (使用Knex.js ORM)
缓存: Redis
会话管理: Koa-session (支持MySQL存储)
WebSocket: 内置WebSocket服务器支持实时通信
任务调度: node-schedule
日志系统: chowa-log
文件上传: 阿里云OSS
消息推送: 阿里云短信服务
微信集成: 公众号、小程序、支付完整生态
前端技术栈 (console-web)
框架: Vue 2 + Vue Router + Vuex
UI库: View Design (iView)
图表: ECharts
时间处理: Moment.js
二维码: QRCode生成和解析
编辑器: WangEditor
拖拽: awe-dnd
文件处理: Spark-MD5
地图: 支持地图服务集成
主要功能模块
根据角色权限配置，系统包含以下核心功能：
1. 物业管理核心功能
房产档案管理 (FCDA): 楼宇、单元、房屋信息管理
业主档案管理 (YZDA): 业主信息、认证管理
车辆管理 (CLGL): 车辆登记、停车管理
财务管理 (CWGL): 费用收缴、账单管理
合同管理 (HTGL): 各类合同签署管理
2. 服务管理功能
维修维护 (WXWF): 报修工单、维修派单
投诉建议 (TSJY): 投诉处理、建议收集
装修登记 (ZXDJ): 装修申请、审批流程
宠物档案 (CWDA): 宠物信息登记
小区挪车 (XQNC): 挪车申请处理
3. 安防管理功能
访客通行 (FKTX): 访客预约、通行码生成
疫情防控 (YQFK): 健康码、体温登记
巡检任务 (XJRW): 安保巡检计划执行
4. 智能硬件集成
智能门禁 (ZNMJ): 门禁系统对接
智能梯控 (ZNTK): 电梯权限控制
智慧照明 (ZHZM): 照明系统控制
智慧停车 (ZHTC): 停车场管理
能耗管理 (NHGL): 能源消耗监控
智慧预警 (ZHYJ): 设备故障预警
5. 办公管理功能
人力资源 (RLZY): 员工管理
会议室管理 (HYSGL): 会议室预约
物料仓储 (WLCC): 物资管理
党建党训 (DJDX): 党建活动管理
6. 通知公告功能
小区通知 (XQTZ): 面向业主的通知
行政通知 (XZTZ): 内部行政通知
问卷调查 (WJDC): 满意度调查
系统架构特点
多端支持
PC管理后台: Vue.js构建的管理控制台
业主端小程序: 业主使用的微信小程序
员工端小程序: 物业员工使用的小程序
微信公众号: 通知推送、服务入口
H5页面: 移动端网页应用
模块化设计
PC模块 (/module/pc): PC端API接口
MP模块 (/module/mp): 小程序API接口
OA模块 (/module/oa): 公众号接口
Notify模块 (/module/notify): 通知推送接口
运行和部署
后端运行 (api-server)

# 开发环境
npm run dev

# 生产环境构建
npm run dist

# 代码格式化
npm run lint

前端运行 (console-web)

环境要求
Node.js: >= 12.1.0
NPM: >= 6.9.0
MySQL: 数据存储
Redis: 缓存和会话存储
阿里云OSS: 文件存储服务
配置文件
已为您生成了完整的 .ejyyrc 配置文件，包含：
服务器配置
数据库连接
微信小程序和公众号配置
支付配置
阿里云服务配置
邮件服务配置
加密配置等
部署建议
数据库准备: 创建MySQL数据库，导入初始表结构
Redis准备: 启动Redis服务用于缓存和会话
配置修改: 根据实际环境修改 .ejyyrc 配置文件
依赖安装: 分别在 api-server 和 console-web 目录执行 npm install
后端启动: 在 api-server 目录执行 npm run dev 或构建后部署
前端构建: 在 console-web 目录执行 npm run dist，将构建产物部署到Web服务器
这是一个功能完整、架构清晰的智慧物业管理系统，支持从基础的物业管理到智能硬件集成的全方位解决方案。



# 存储服务统一升级总结

## 升级概述

按照优化方案，我们成功完成了存储服务的统一升级，实现了前端零配置的统一上传体验。

## 完成的工作

### 1. 后端改进

#### 1.1 新增统一存储配置接口
- **文件**: `api-server/src/module/pc/controller/storage/config.ts`
- **接口**: `GET /pc/storage/config`
- **功能**: 提供统一的存储配置，支持本地/OSS/MinIO三种模式

#### 1.2 新增统一上传接口
- **文件**: `api-server/src/module/pc/controller/storage/upload.ts`
- **接口**: `POST /pc/storage/upload`
- **功能**: 统一的服务端上传处理

#### 1.3 完善OSS存储服务
- **文件**: `api-server/src/service/storage/oss-storage.ts`
- **功能**: 实现完整的OSS存储服务，包括签名生成等

#### 1.4 路由配置
- **文件**: `api-server/src/module/pc/router.ts`
- **新增**: 导出新的存储控制器

### 2. 前端改进

#### 2.1 统一上传工具类
- **文件**: `console-web/src/utils/upload.js`
- **功能**: 
  - 整合原有的 `oss.js` 和 `upload.js` 功能
  - 实现统一的上传接口
  - 支持三种上传策略：server/direct/presigned
  - 自动根据后端配置选择上传方式

#### 2.2 兼容层
- **文件**: `console-web/src/utils/oss.js`
- **功能**: 保持向后兼容，内部使用新的统一上传服务

#### 2.3 ImageUpload组件升级
- **文件**: `console-web/src/components/image-upload/index.vue`
- **改进**:
  - 使用新的统一上传服务
  - 简化上传逻辑，移除模式判断
  - 统一的错误处理和进度显示
  - 动态获取图片URL

#### 2.4 init页面测试功能
- **文件**: `console-web/src/views/user/init/components/storage.vue`
- **新增**:
  - 配置保存后的上传测试功能
  - 实时验证存储配置是否正确
  - 用户友好的测试反馈

## 技术特性

### 1. 前端零配置
- 所有存储相关配置都从后端获取
- 前端代码无需修改即可支持新的存储方式
- 配置变更后自动生效

### 2. 统一上传体验
- 所有存储模式使用相同的上传接口
- 一致的进度显示和错误处理
- 智能的上传策略选择

### 3. 向后兼容
- 保持原有组件接口不变
- 现有代码无需修改
- 渐进式升级路径

### 4. 易于扩展
- 新增存储方式只需后端配置
- 统一的接口设计便于维护
- 清晰的架构分层

## 使用方式

### 1. 后端配置
在后端配置文件中设置存储模式和相关参数，前端会自动获取并适配。

### 2. 前端使用
```javascript
// 直接使用统一上传服务
import uploadService from '@/utils/upload';

// 上传文件
const result = await uploadService.upload(file, {
    dir: 'images',
    onProgress: (progress) => console.log(progress)
});

// 或者使用升级后的组件
<ImageUpload v-model="imageUrl" dir="test" />
```

### 3. 配置测试
在系统初始化页面配置存储后，可以立即测试上传功能验证配置是否正确。

## 升级效果

1. **开发效率提升**: 前端开发者无需关心存储细节
2. **维护成本降低**: 统一的代码结构，减少重复逻辑
3. **用户体验改善**: 一致的上传交互，更好的错误提示
4. **配置管理简化**: 集中的配置管理，便于运维

## 后续计划

1. 可以继续升级其他上传组件（FileUpload、MultipleImageUpload等）
2. 添加更多存储方式支持（如腾讯云COS等）
3. 完善错误处理和重试机制
4. 添加上传进度的全局状态管理

## 测试建议

1. 测试三种存储模式的配置和上传
2. 验证配置变更后的自动适配
3. 测试错误处理和用户提示
4. 验证向后兼容性

## 存储配置

系统支持三种存储模式：本地存储、阿里云OSS、MinIO私有云。存储配置需要在后端配置文件 `.ejyyrc` 中设置，前端会自动从后端获取配置信息。

### 配置方式

在项目根目录的 `.ejyyrc` 配置文件中添加存储配置：

```json
{
  "storage": {
    "mode": "local",
    "local": {
      "savePath": "./uploads",
      "urlPrefix": "/static",
      "baseUrl": "http://127.0.0.1:6688"
    },
    "oss": {
      "accessKeyId": "your-access-key-id",
      "accessKeySecret": "your-access-key-secret",
      "bucket": "your-bucket-name",
      "region": "oss-cn-hangzhou",
      "customDomain": "https://cdn.yourdomain.com"
    },
    "minio": {
      "endpoint": "http://127.0.0.1:9000",
      "accessKey": "admin",
      "secretKey": "password123",
      "bucket": "ejyy-storage",
      "useSSL": false,
      "customDomain": "https://minio.yourdomain.com",
      "baseUrl": "http://127.0.0.1:9000"
    }
  }
}
```

### 存储模式说明

- **local**: 本地存储，适用于开发环境和小规模部署
- **oss**: 阿里云OSS，适用于生产环境，支持CDN加速
- **minio**: MinIO私有云，适用于私有化部署，企业级存储

### 前端使用

前端无需任何存储配置，上传组件会自动从后端获取存储配置信息：

```javascript
// 上传组件会自动处理不同的存储模式
import { ImageUpload } from '@/components';

// 在模板中使用
<ImageUpload v-model="imageUrl" dir="avatar" />
```

系统会根据后端配置自动选择合适的上传策略：
- 本地存储：服务端上传
- 阿里云OSS：直传上传
- MinIO：预签名上传

## 前端存储配置修改总结

### 修改内容

1. **删除前端存储配置功能**
   - 删除了 `console-web/src/views/user/init/components/storage.vue` 存储配置组件
   - 删除了 `console-web/src/views/user/storage/index.vue` 独立存储配置页面
   - 简化了用户初始化页面，移除了存储配置相关的代码

2. **统一上传服务**
   - 前端所有上传组件现在都使用统一的上传服务 `utils.upload`
   - 上传服务会自动从后端 `/storage/config` 接口获取存储配置
   - 支持本地存储、阿里云OSS、MinIO三种存储模式的自动切换

3. **修改的组件**
   - `ImageUpload`: 图片上传组件
   - `AvatarCrop`: 头像裁剪组件  
   - `FileUpload`: 文件上传组件
   - `MultipleImageUpload`: 多图片上传组件
   - `Editor`: 富文本编辑器的图片上传

4. **后端接口调整**
   - 废弃了 `/init/storage` 接口（前端不再需要设置存储配置）
   - 保留了 `/storage/config` 接口用于前端获取存储配置
   - 保留了旧的上传接口以确保向后兼容性

### 使用方式

现在前端开发者无需关心存储配置，只需要：

```javascript
// 直接使用上传组件
<ImageUpload v-model="imageUrl" dir="avatar" />
<FileUpload v-model="fileInfo" dir="documents" />
```

存储配置完全由后端管理，在 `.ejyyrc` 配置文件中设置即可。