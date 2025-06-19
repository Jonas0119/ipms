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

## 更新日志

### 2024-12-19 存储服务清理升级（第二阶段）

#### 🧹 旧代码清理
**核心目标：** 彻底移除旧存储实现，统一到新的 storage 服务
- **后端清理**：删除 `service/upload/`、`service/oss.ts`、`types/upload.ts`、`module/pc/controller/upload/` 等旧实现
- **前端清理**：删除 `utils/oss.js`，移除 `utils/index.js` 中的 oss 导出
- **配置统一**：移除 `config.ts` 中的 `upload` 和 `aliyun` 配置，统一使用 `storage` 配置
- **兼容清理**：删除 `upload.js` 中的兼容性方法 `getUploadSign`、`getOSSConfig` 等

#### ⚙️ 配置结构简化
**配置统一：** 所有存储相关配置集中在 `storage` 节点下
```yaml
# 旧配置（已删除）
upload: { mode: "local", local: {...} }
aliyun: { accessKeyId: "...", oss: {...} }

# 新配置（统一格式）
storage:
  mode: "local"  # local/oss/minio
  local: { savePath: "./uploads", urlPrefix: "/static", baseUrl: "..." }
  oss: { accessKeyId: "...", bucket: "...", region: "..." }
  minio: { endpoint: "...", accessKey: "...", bucket: "..." }
```

#### 🔧 服务整合
- **SMS服务**：改用 `config.storage.oss` 配置替代 `config.aliyun`
- **静态中间件**：移除对 `config.upload` 的兼容支持
- **路由清理**：删除 PC 模块的 `/upload/*` 路由

#### ✅ 保留项目
- **MP模块**：按需求保留小程序端的上传相关文件
- **现有接口**：新的 `/storage/*` 接口保持不变
- **前端组件**：所有上传组件继续正常工作

#### 🐛 MP模块修复
**问题：** MP模块上传控制器引用已删除的旧上传服务导致编译错误
- **修复文件**：`mp/controller/upload/local.ts` 和 `mp/controller/upload/sign.ts`
- **解决方案**：将旧的 `uploadService` 替换为新的 `StorageServiceFactory`
- **技术升级**：使用统一的存储服务接口，保持功能一致性
- **验证结果**：后端编译测试通过，接口功能正常

#### 🎯 升级效果
- **代码减少**：删除约 2000+ 行冗余代码
- **配置简化**：配置文件结构更清晰统一
- **维护性提升**：单一存储服务架构，易于维护和扩展
- **编译验证**：前后端构建测试全部通过
- **问题修复**：MP模块编译错误完全解决

### 2024-12-19 系统存储与模板管理全面升级

#### 📦 存储服务统一升级
**核心改进：** 实现前端零配置的统一上传体验
- **新增接口**：`/storage/config` 统一存储配置，`/storage/upload` 统一上传处理
- **前端改进**：整合 `oss.js` 和 `upload.js` 为统一 `upload.js`，支持三种上传策略(server/direct/presigned)
- **组件升级**：ImageUpload、AvatarCrop、FileUpload、MultipleImageUpload 全部使用新服务
- **配置简化**：删除前端存储配置功能，统一由后端管理

#### 🗂️ 模板管理系统重构
**核心改进：** 配置统一化、模板管理通用化
- **新增服务**：`template.ts` 统一模板管理服务
- **新增接口**：`/template/config` 配置获取，`/template/download/:type` 通用下载
- **前端工具**：新增 `template.js` 工具类，智能下载策略(直链优先)
- **配置优化**：存储配置结构统一，模板路径可配置

#### 🐛 关键问题修复
- **404错误**：修复 Upload 组件 action 属性导致的请求错误
- **静态文件**：修复本地存储模式下静态文件访问问题
- **MinIO模板**：优化 MinIO 模式下模板下载处理
- **代码质量**：修复所有 lint 错误，提升代码规范

#### ⚡ 技术特性
- **零配置**：前端自动获取存储配置，无需手动设置
- **向后兼容**：保持原有接口不变，平滑升级
- **智能选择**：自动选择最优上传/下载策略
- **易扩展**：新增存储方式或模板类型仅需后端配置

#### 🔧 使用方式
```javascript
// 统一上传
import uploadService from '@/utils/upload';
await uploadService.upload(file, { dir: 'images' });

// 模板下载
import templateService from '@/utils/template';
await templateService.downloadTemplate('building_import');

// 组件使用
<ImageUpload v-model="imageUrl" dir="avatar" />
```

#### 📋 配置示例
```yaml
# .ejyyrc 配置文件
storage:
  mode: "local"  # local/oss/minio
  template:
    path: "template"
    files:
      building_import: "固定资产导入模板.xlsx"
  local:
    savePath: "./uploads"
    urlPrefix: "/static"
    baseUrl: "http://127.0.0.1:6688"
```

**升级效果：** 开发效率提升、维护成本降低、用户体验改善、配置管理简化

### 2024-12-19 版权声明修复与代码质量提升

#### 🔧 版权声明标准化
**核心目标：** 统一项目版权声明格式，提升代码规范性
- **问题识别**：发现错误格式 `/**//** * | 开源物业管理系统，敬请使用 */ */`
- **格式统一**：标准化为正确格式，包含完整的分隔线设计
- **覆盖范围**：处理 825 个源文件，修复 800 个文件的版权声明
- **自动化工具**：开发 `fix_copyright.py` 脚本，支持批量修复

#### 🐛 代码语法修复
**质量提升：** 修复前后端项目中的语法错误
- **前端修复**：
  - `copyright.vue` HTML 语法错误（多余的闭合标签）
  - `dashboard/index.vue` JavaScript 计算表达式错误
- **后端修复**：
  - `service/map.ts` TypeScript 数学运算符语法错误
- **验证工具**：ESLint、Prettier、TypeScript 编译器全面检查

#### ✅ 验证结果
- **版权声明覆盖率**：97.0% (800/825 个文件)
- **错误格式清零**：0 个错误的版权声明格式
- **语法错误清零**：前后端项目编译测试全部通过
- **代码格式化**：所有文件通过 Prettier 格式化

#### 🛠️ 技术工具
- **修复脚本**：`fix_copyright.py` - 智能识别和修复版权声明
- **质量检查**：ESLint (Vue)、TypeScript Compiler、Prettier
- **项目结构**：前端 Vue.js + View Design，后端 Node.js + TypeScript + Koa

#### 📊 统计数据
- **总源文件**：825 个 (.js, .ts, .vue)
- **修复文件**：800 个包含正确版权声明
- **语法修复**：3 个文件的语法错误
- **代码质量**：100% 通过 lint 检查

**升级效果：** 代码规范统一、版权声明标准化、项目质量提升、维护成本降低

### 2024-12-19 日志系统重构升级

#### 🔧 自定义日志系统
**核心目标：** 替换第三方日志依赖，实现自主可控的日志管理
- **新增模块**：`kjhlog` - 自研日志工具，替代 `chowa-log` 依赖
- **功能完整**：支持多级别日志(DEBUG/INFO/WARN/ERROR)、文件输出、控制台输出
- **兼容性强**：保持与原 `cwlog` API 完全兼容，无缝替换
- **智能配置**：开发环境控制台输出，生产环境文件记录

#### 🛠️ 批量代码迁移
**自动化处理：** 开发自动化脚本，批量处理代码迁移
- **影响范围**：21 个文件的日志调用全部迁移
- **导入管理**：自动添加 `kjhlog` 导入语句，统一使用 `~/utils/kjhlog` 路径
- **API兼容**：支持 `log()`、`info()`、`warn()`、`error()`、`success()`、`warning()` 方法
- **全局可用**：在 `app.ts` 中初始化全局 `kjhlog` 实例

#### 🐛 编译问题修复
**质量保证：** 修复编译过程中发现的各类问题
- **参数错误**：修复 `oa/controller/service/reply.ts` 中 `msg.text()` 参数缺失
- **方法重复**：重构 `kjhlog` 内部方法，避免方法名冲突
- **类型安全**：确保所有 TypeScript 类型检查通过
- **编译验证**：webpack 构建测试完全通过

#### ⚡ 日志特性
- **按日期分文件**：生产环境按日期自动创建日志文件
- **格式统一**：`[时间戳] [级别] 消息内容` 标准格式
- **环境适配**：开发环境详细输出，生产环境精简记录
- **错误处理**：日志写入失败时自动降级到控制台

#### 📊 迁移统计
- **替换文件**：21 个 TypeScript 文件
- **日志调用**：30+ 处日志调用点全部迁移
- **编译状态**：✅ 零错误通过 webpack 构建
- **依赖清理**：移除对第三方日志库的依赖

**升级效果：** 日志系统自主可控、减少外部依赖、提升系统稳定性、便于后续维护扩展

### 2024-12-19 前端配置优化

#### 🔧 网站标题配置修复
**问题解决：** 修复前端编译警告，完善配置管理
- **警告修复**：解决 `SITE_TITLE` 配置项缺失导致的编译警告
- **标题设置**：统一网站标题为"智慧物业管理平台"
- **应用范围**：页面标题、导航栏、打印页面、IoT仪表板等多处使用
- **构建验证**：前端构建测试通过，无警告信息

#### 📊 影响统计
- **配置文件**：`console-web/src/config.js` 新增 `SITE_TITLE` 配置
- **使用位置**：5+ 个组件和页面引用该配置
- **构建状态**：✅ 前端构建无警告通过
- **用户体验**：统一的品牌标识和页面标题

**升级效果：** 配置完整性提升、编译警告清零、品牌标识统一、用户体验改善


#how to run
#后台服务
docker run -d --name api-server   -p 6688:6688   -v /Users/pzq/tech/projects/ejyy/api-server/dist:/www/apiserver   -w /www/apiserver   node:24.2.0   sh -c "npm install && node ejyy_server.js"

#mysql
docker run -d --name my-redis -p 6379:6379 redis:6.2.6
docker exec -it mysql57 mysql -u root -p

#redis

#minio


#前端服务


#获取docker IP
docker inspect my-redis | grep IPAddress
