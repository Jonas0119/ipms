/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入模块别名注册器，用于支持路径别名
import 'module-alias/register';
// 导入 Koa 框架相关组件
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBodyMiddleware from 'koa-body';
import KoaSessionMilddleware from 'koa-session';
import KoaLogMiddleware from 'koa-logger';
// 导入自定义的 MySQL Session 存储器
import MysqlSessionStore from '~/store/mysql-session';
// 导入 HTTP 服务器
import http from 'http';
// 导入配置文件
import config from '~/config';
// 导入定时任务模块
import * as ScheduleJob from '~/schedule';
// 导入各个业务模块
import MpModule from '~/module/mp';          // 小程序模块
import PcModule from '~/module/pc';          // PC端模块
import NotifyModule from '~/module/notify';  // 通知模块
import OaModule from '~/module/oa';          // 公众号模块
// 导入 WebSocket 服务
import wss from '~/wss';
// 导入 Redis 服务
import * as redisService from '~/service/redis';
// 导入中间件
import ModelMiddleware from '~/middleware/model';      // 数据库模型中间件
import IpMiddleware from '~/middleware/ip';            // IP 处理中间件
import HeaderMiddleware from '~/middleware/header';    // 请求头处理中间件
import WatcherMiddleware from '~/middleware/watcher';  // 监控中间件
import InitMiddleware from '~/middleware/init';        // 初始化检查中间件
import StaticMiddleware from '~/middleware/static';    // 静态资源中间件
// 导入日志工具
import kjhlog from '~/utils/kjhlog';

// 声明全局 kjhlog 类型，使其在全局范围内可用
declare global {
    var kjhlog: typeof import('~/utils/kjhlog').default;
}

// 创建 Koa 应用实例（HTTP 请求从这里进入中间件链）
const app = new Koa();
// 创建路由器实例（业务模块把路由都挂在到这个 router 上）
const router = new KoaRouter();
// 创建 HTTP 服务器实例（供 HTTP 与 WebSocket 共用）
const server = http.createServer(app.callback());

// 初始化全局日志工具，使其在整个应用中可用
global.kjhlog = kjhlog;
kjhlog.info(`Starting ${config.name} server with process ${process.pid}`);

// 启动定时任务调度器（如短信通知、清理任务、异步对账等都在这里集中调度）
ScheduleJob.run();

// 注册各个业务模块的路由（模块化路由装配，见 ~/module/**/index.ts）
MpModule(router);      // 注册小程序相关路由
PcModule(router);      // 注册PC端相关路由
NotifyModule(router);  // 注册通知相关路由
OaModule(router);      // 注册公众号相关路由

// 初始化 WebSocket 服务，绑定到 HTTP 服务器（/cws 为统一的 WS 入口）
wss.init(server);

// 启动 Redis 订阅服务，用于处理实时消息推送（发布/订阅到 WS 客户端）
redisService.subscribe();

// 配置中间件栈（按执行顺序）
// 注意：HTTP 请求进入顺序即为 use 调用顺序，下游抛错会被最后的 WatcherMiddleware 捕获
app.use(KoaBodyMiddleware({ multipart: true }))  // 请求体解析中间件，支持文件上传
    .use(
        KoaLogMiddleware({
            transporter: str => {
                kjhlog.info(`${str}`);  // 将 Koa 的请求日志输出到自定义日志系统
            }
        })
    )
    .use(
        KoaSessionMilddleware(
            {
                store: new MysqlSessionStore(),  // 使用 MySQL 存储 Session
                ...config.session                // 应用 Session 配置
            },
            app
        )
    )
    .use(StaticMiddleware())    // 静态资源服务（/static/** → 本地/对象存储）
    .use(ModelMiddleware())     // 数据库模型注入（为 ctx 挂载 Knex 实例）
    .use(IpMiddleware())        // IP 解析与透传（配合反代拿到 X-Real-IP）
    .use(HeaderMiddleware())    // 统一请求头、预检处理（允许 OPTIONS、设置允许方法等）
    .use(InitMiddleware())      // 初始化态检查（未初始化仅放行 /pc/init/**、上传与存储）
    .use(router.routes())       // 路由匹配与分发（模块在此之前已注册到 router）
    .use(WatcherMiddleware());  // 兜底监控（异常告警、前端 SPA 回退、API 404 JSON）

// 获取服务器端口，优先使用环境变量，否则使用配置文件中的端口
const port = process.env.port ? parseInt(process.env.port, 10) : config.server.port;

// 启动 HTTP/WS 服务器，监听指定端口
server.listen(port, '0.0.0.0', () => {
    kjhlog.success(`${config.name} server running on port ${port}，work process ${process.pid}`);
});
