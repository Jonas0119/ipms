## 项目介绍

IPMS 是一套基于 AGPL v3 开源协议的智慧物业管理解决方案，涵盖微信公众号/小程序/PC/H5/智能硬件多端。后端采用 Koa + TypeScript 构建，支持分布式部署；前端使用 Vue + View Design 开发。

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

### Docker 部署（Redis → MySQL → MinIO → 后端 → 前端）

0) 网络与目录
```bash
docker network create ipms-net || true
mkdir -p ~/ipms/{mysql-data,redis-data,minio-data,minio-config,frontend-dist}
```

1) MySQL
```bash
docker run -d --name ipms-mysql --network ipms-net \
  -e MYSQL_ROOT_PASSWORD='rootpass' -e MYSQL_DATABASE=ipms \
  -v ~/ipms/mysql-data:/var/lib/mysql -p 3306:3306 mysql:5.7

# 初始化新库（本机执行）
mysql -h127.0.0.1 -uroot -p'rootpass' < resources/db_ipms.sql
```

2) Redis
```bash
docker run -d --name ipms-redis --network ipms-net \
  -v ~/ipms/redis-data:/data -p 6379:6379 redis:6.2.6
```

3) MinIO
```bash
docker run -d --name ipms-minio --network ipms-net \
  -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=minioadmin \
  -v ~/ipms/minio-data:/data -v ~/ipms/minio-config:/root/.minio \
  -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address :9001
```

4) 后端（API Server）
```bash
cd api-server && npm ci && npm run dist
docker run -d --name api-server --network ipms-net \
  -p 6688:6688 -v $(pwd)/dist:/www/apiserver -w /www/apiserver \
  node:24.2.0 sh -c "npm install && node ipms_server.js"
```

5) 前端（控制台）
```bash
cd console-web && npm ci && npm run build
cp -r dist/* ~/ipms/frontend-dist/
docker run -d --name ipms-web -p 8080:80 \
  -v ~/ipms/frontend-dist:/usr/share/nginx/html:ro nginx:1.25
```


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
# .ipmsrc 配置文件
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


## 后端（Koa）架构与设计亮点

### 开发者需要自研的组件（Koa 应用通用）
- 路由与控制器：定义 URL、HTTP Method 与业务处理逻辑（本项目采用 Action 模式统一声明）。
- 权限与认证：令牌校验、角色/资源访问控制（PC 与 MP 双端分离）。
- 参数校验：统一的请求体验证与错误提示。
- 中间件体系：请求解析、日志、静态资源、初始化门禁、模型注入、Header 处理等。
- 会话管理：Session 存储与过期逻辑、清理策略。
- 存储抽象：统一封装 Local/OSS/MinIO 的上传/直传/预签名策略。
- 配置管理：多环境配置装载与默认值合并、敏感信息隔离。
- 定时任务：系统性任务调度（如 Session 清理）。
- 日志与监控：统一日志接口、可控输出与问题追踪。
- 异步能力：WebSocket 推送、Redis 订阅等。

### 本项目的实现与健壮性措施
- 路由与 Action 模式（解耦与一致性）
  - 每个接口以 Action 形式定义：`router + validator + response`。
  - 统一注册：PC 端在 `api-server/src/module/pc/router.ts` 汇总导出；由 `api-server/src/module/pc/index.ts` 遍历并通过 `KoaRouter` 动态挂载。
  - 好处：接口声明清晰、鉴权/校验可在装配层集中处理，降低重复代码。

- 认证与鉴权（双端隔离）
  - PC：在 `api-server/src/module/pc/index.ts` 校验 `ipms-pc-token`，并按 `roles`/`verifyCommunity` 做细粒度控制。
  - MP：在 `api-server/src/module/mp/index.ts` 校验 `ipms-mp-token`，支持资料完整性 `verifyIntact` 校验。
  - 统一常量：`api-server/src/constant/code.ts` 定义状态码与语义。

- 参数校验（统一入口）
  - `validatorService` 在装配层统一执行 `validator` 配置，失败直接返回一致的错误结构，控制器聚焦业务。

- 中间件链与初始化门禁（稳定启动）
  - 中间件顺序明确：`koa-body → 日志 → session → 静态 → 模型注入 → IP → Header → 初始化门禁 → 路由 → 监控`（见 `api-server/src/app.ts`）。
  - 初始化门禁：`api-server/src/middleware/init.ts` 未初始化时仅放行白名单与 `/pc/init/*`，其余返回 `SYSTEMT_NOT_INIT`，前端跳转到 `/user/init`，防止系统处于未就绪状态下被访问。

- 会话管理与清理（可诊断、可恢复）
  - 存储：`MysqlSessionStore`（`api-server/src/store/mysql-session.ts`）持久化到 `ipms_session_store`。
  - TTL：受 `config.session.maxAge` 控制（默认 30 分钟），并在 set 时写入 `expire` 时间戳。
  - 清理：定时任务 `api-server/src/schedule/session.ts` 每小时 30 分清理已过期会话，且通过 `ipms_schedule` 去重避免多实例重复执行。

- 存储服务抽象（统一能力、前端零配置）
  - 工厂：`StorageServiceFactory`（`api-server/src/service/storage/storage-factory.ts`）按 `config.storage.mode` 返回 `Local/Oss/MinIO` 实例。
  - 能力：统一 `getUploadConfig/handleFileUpload/getFileUrl` 接口；支持本地上传、OSS 直传、MinIO 预签名；失败路径有回退策略。
  - 对外接口：`/storage/config`、`/storage/upload` 等由 PC/MP 分端暴露，结合初始化门禁实现“初始化前免认证、初始化后受保护”。

- 配置管理（安全与一致性）
  - 载入：`api-server/src/config.ts` 读取 `.ipmsrc`（YAML），合并默认值，提供强类型 `config`。
  - 隔离：敏感信息只出现在 `.ipmsrc`，仓库中仅保留类型与默认值。

- 日志与监控（可观测性）
  - 统一日志：`~/utils/kjhlog`；Koa 访问日志通过自定义 transporter 写入同一日志体系，启动/任务/异常均有结构化输出。
  - 监控中间件：`WatcherMiddleware`（请求收尾埋点、统计）。

- 异步通信与实时能力
  - WebSocket：`api-server/src/wss/index.ts` 初始化服务端推送；
  - Redis：`api-server/src/service/redis.ts` 订阅与消息转发，解耦实时事件。

- 工程化与可维护性
  - TypeScript 全量类型声明，Action/Model/Service 分层；
  - Webpack/ts-loader 打包后端产物，保留 `node_modules` 外置，部署轻量（见 `api-server/webpack.config.js`）；
  - 统一代码风格（Prettier）、约定式模块别名 `~`（package.json/tsconfig/webpack 一致）。

### 目录到功能的快速索引
- 路由与注册：`api-server/src/module/pc/router.ts`、`api-server/src/module/pc/index.ts`、`api-server/src/module/mp/index.ts`
- 中间件：`api-server/src/middleware/*`（`init.ts`、`header.ts`、`ip.ts`、`static.ts` 等）
- 会话：`api-server/src/store/mysql-session.ts`、`api-server/src/schedule/session.ts`
- 存储：`api-server/src/service/storage/*`、`api-server/src/types/storage.ts`
- 配置：`api-server/src/config.ts`、部署配置 `.ipmsrc`
- 日志：`api-server/src/utils/kjhlog.ts`
- 实时：`api-server/src/wss/index.ts`、`api-server/src/service/redis.ts`

#how to run如何启动服务
#后台服务
docker run -d --name api-server1   -p 6688:6688   -v /Users/pzq/tech/projects/ipms/api-server/dist:/www/apiserver   -w /www/apiserver   node:24.2.0   \
  sh -c "echo '开始安装依赖...' && npm install  && echo '依赖安装完成，等待5秒...' && sleep 20 && echo '启动服务器...' && node ipms_server.js"

docker run -d --name api-server1   -p 6688:6688   -v /Users/pzq/tech/projects/ipms/api-server/dist:/www/apiserver   -w /www/apiserver   node:24.2.0   sh -c "node ipms_server.js"

#前端服务
docker run -d   --name my-nginx1    -p 8080:80     -v /Users/pzq/tech/projects/ipms/console-web/nginx-conf/custom.conf:/etc/nginx/conf.d/default.conf   -v /Users/pzq/tech/projects/ipms/console-web/dist:/usr/share/nginx/html   nginx
注意需要修改配置文件中的server本地IP地址


#mysql
docker run -d --name mysql57 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=Tjfae@123    mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

docker exec -it mysql57 mysql -u root -p

### 数据库初始化（生产/测试）
```sql
CREATE DATABASE IF NOT EXISTS `ipms` DEFAULT CHARACTER SET utf8mb4;
-- 导入初始化脚本
-- mysql -h127.0.0.1 -uroot -p'***' < resources/db_ipms.sql
```

#删除表中的历史数据，中心初始化整个系统
TRUNCATE TABLE `ipms_ask_for_leave`;                           
TRUNCATE TABLE `ipms_ask_for_leave_flow`;                      
TRUNCATE TABLE `ipms_building_info`;                           
TRUNCATE TABLE `ipms_community_info`;                          
TRUNCATE TABLE `ipms_community_remote_open_door_log`;          
TRUNCATE TABLE `ipms_community_setting`;                       
TRUNCATE TABLE `ipms_complain`;                                
TRUNCATE TABLE `ipms_contract`;                                
TRUNCATE TABLE `ipms_contract_category`;                       
TRUNCATE TABLE `ipms_contract_item`;                           
TRUNCATE TABLE `ipms_convenient`;                              
TRUNCATE TABLE `ipms_employee_sign_record`;                    
TRUNCATE TABLE `ipms_employee_sign_setting`;                   
TRUNCATE TABLE `ipms_feedback`;                                
TRUNCATE TABLE `ipms_fitment`;                                 
TRUNCATE TABLE `ipms_inform`;                                  
TRUNCATE TABLE `ipms_iot_elevator`;                            
TRUNCATE TABLE `ipms_iot_elevator_log`;                        
TRUNCATE TABLE `ipms_iot_entrance`;                            
TRUNCATE TABLE `ipms_iot_entrance_log`;                        
TRUNCATE TABLE `ipms_iot_lamp`;                                
TRUNCATE TABLE `ipms_iot_lamp_line`;                           
TRUNCATE TABLE `ipms_iot_lamp_log`;                            
TRUNCATE TABLE `ipms_iot_lamp_work_mode`;                      
TRUNCATE TABLE `ipms_iot_meter`;                               
TRUNCATE TABLE `ipms_iot_meter_read`;                          
TRUNCATE TABLE `ipms_iot_meter_repeater`;                      
TRUNCATE TABLE `ipms_iot_park`;                                
TRUNCATE TABLE `ipms_iot_park_blacklist`;                      
TRUNCATE TABLE `ipms_iot_park_log`;                            
TRUNCATE TABLE `ipms_iot_warning`;                             
TRUNCATE TABLE `ipms_iot_warning_log`;                         
TRUNCATE TABLE `ipms_material`;                                
TRUNCATE TABLE `ipms_material_category`;                       
TRUNCATE TABLE `ipms_material_purchase`;                       
TRUNCATE TABLE `ipms_material_purchase_flow`;                  
TRUNCATE TABLE `ipms_material_purchase_item`;                  
TRUNCATE TABLE `ipms_material_supplier`;                       
TRUNCATE TABLE `ipms_material_used`;                           
TRUNCATE TABLE `ipms_meeting`;                                 
TRUNCATE TABLE `ipms_meeting_participant`;                     
TRUNCATE TABLE `ipms_meeting_room`;                            
TRUNCATE TABLE `ipms_mission`;                                 
TRUNCATE TABLE `ipms_mission_category`;                        
TRUNCATE TABLE `ipms_mission_complete`;                        
TRUNCATE TABLE `ipms_mission_complete_node`;                   
TRUNCATE TABLE `ipms_mission_line`;                            
TRUNCATE TABLE `ipms_mission_line_node`;                       
TRUNCATE TABLE `ipms_mission_point`;                           
TRUNCATE TABLE `ipms_move_car`;                                
TRUNCATE TABLE `ipms_notice_to_user`;                          
TRUNCATE TABLE `ipms_notice_to_user_readed`;                   
TRUNCATE TABLE `ipms_notice_tpl`;                              
TRUNCATE TABLE `ipms_owner_apply`;                             
TRUNCATE TABLE `ipms_owner_detail_log`;                        
TRUNCATE TABLE `ipms_party`;                                   
TRUNCATE TABLE `ipms_pet`;                                     
TRUNCATE TABLE `ipms_pet_vaccinate`;                           
TRUNCATE TABLE `ipms_property_company_access`;                 
TRUNCATE TABLE `ipms_property_company_auth`;                   
TRUNCATE TABLE `ipms_property_company_building_registered`;    
TRUNCATE TABLE `ipms_property_company_department`;             
TRUNCATE TABLE `ipms_property_company_job`;                    
TRUNCATE TABLE `ipms_property_company_user`;                   
TRUNCATE TABLE `ipms_property_company_user_access_community`;  
TRUNCATE TABLE `ipms_property_company_user_default_community`; 
TRUNCATE TABLE `ipms_property_company_user_join_record`;       
TRUNCATE TABLE `ipms_property_company_user_login`;             
TRUNCATE TABLE `ipms_property_fee`;                            
TRUNCATE TABLE `ipms_property_fee_order`;                      
TRUNCATE TABLE `ipms_property_fee_order_item`;                 
TRUNCATE TABLE `ipms_question`;                                
TRUNCATE TABLE `ipms_question_option`;                         
TRUNCATE TABLE `ipms_questionnaire`;                           
TRUNCATE TABLE `ipms_questionnaire_answer`;                    
TRUNCATE TABLE `ipms_questionnaire_answer_result`;             
TRUNCATE TABLE `ipms_questionnaire_statistics`;                
TRUNCATE TABLE `ipms_refound`;                                 
TRUNCATE TABLE `ipms_refound_flow`;                            
TRUNCATE TABLE `ipms_refound_item`;                            
TRUNCATE TABLE `ipms_repair`;                                  
TRUNCATE TABLE `ipms_repair_urge`;                             
TRUNCATE TABLE `ipms_schedule`;                                
TRUNCATE TABLE `ipms_session_store`;                           
TRUNCATE TABLE `ipms_storehouse`;                              
TRUNCATE TABLE `ipms_topic`;                                   
TRUNCATE TABLE `ipms_user_building`;                           
TRUNCATE TABLE `ipms_user_building_operate_log`;               
TRUNCATE TABLE `ipms_user_car`;                                
TRUNCATE TABLE `ipms_user_car_operate_log`;                    
TRUNCATE TABLE `ipms_user_car_sync`;                           
TRUNCATE TABLE `ipms_user_default_community`;                  
TRUNCATE TABLE `ipms_vistor`;                                  
TRUNCATE TABLE `ipms_wechat_mp_auth`;                          
TRUNCATE TABLE `ipms_wechat_mp_user`;                          
TRUNCATE TABLE `ipms_wechat_mp_user_login`;                    
TRUNCATE TABLE `ipms_wechat_official_accounts_user`;           
TRUNCATE TABLE `ipms_workflow`;                                
TRUNCATE TABLE `ipms_workflow_node`;                           


#redis
docker run -d --name my-redis -p 6379:6379 redis:6.2.6

#minio
docker run -d --name my-minio \
  -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=minioadmin \
  -v ~/ipms/minio-data:/data -v ~/ipms/minio-config:/root/.minio \
  -p 9000:9000 -p 9001:9001 minio/minio 



### 启动脚本示例（后端）
```bash
docker run -d --name api-server \
  -p 6688:6688 \
  -v /Users/pzq/tech/projects/ipms/api-server/dist:/www/apiserver \
  -w /www/apiserver \
  node:24.2.0 \
  sh -c "npm install && node ipms_server.js"
```

### 配置文件示例（.ipmsrc）
```yaml
server:
  port: 6688
  name: "IPMS"

mysql:
  host: "localhost"
  port: 3306
  user: "root"
  password: "******"
  database: "ipms"

redis:
  host: "localhost"
  port: 6379
  password: ""

storage:
  mode: "local"
  local:
    savePath: "./uploads"
    urlPrefix: "/static"
    baseUrl: "http://127.0.0.1:6688"
  minio:
    endpoint: "http://127.0.0.1:9000"
    accessKey: "admin"
    secretKey: "******"
    bucket: "ipms"
    useSSL: false
    baseUrl: "http://127.0.0.1:9000"
    customDomain: ""
```

### 说明
- 如由旧系统迁移，请根据自身情况自定义迁移脚本。

#前端服务


#获取docker IP
docker inspect my-redis | grep IPAddress

#获取所有容器的IP
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)

#配置
1、api-server
api-server/src/config.ts  IP需要修改api-server对应的IP

2、console-web
console-web/src/config.js  IP需要修改console-web对应的IP

3、后台配置 api-server/dist/.ipmsrc
1）minio的IP
2）mysql的IP
3）redis的IP
4）