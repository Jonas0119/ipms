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

// 创建 Koa 应用实例
const app = new Koa();
// 创建路由器实例
const router = new KoaRouter();
// 创建 HTTP 服务器实例
const server = http.createServer(app.callback());

// 初始化全局日志工具，使其在整个应用中可用
global.kjhlog = kjhlog;
kjhlog.info(`Starting ${config.name} server with process ${process.pid}`);

// 启动定时任务调度器
ScheduleJob.run();

// 注册各个业务模块的路由
MpModule(router);      // 注册小程序相关路由
PcModule(router);      // 注册PC端相关路由
NotifyModule(router);  // 注册通知相关路由
OaModule(router);      // 注册公众号相关路由

// 初始化 WebSocket 服务，绑定到 HTTP 服务器
wss.init(server);

// 启动 Redis 订阅服务，用于处理实时消息推送
redisService.subscribe();

// 配置中间件栈（按执行顺序）
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
    .use(StaticMiddleware())    // 静态资源服务中间件
    .use(ModelMiddleware())     // 数据库模型注入中间件
    .use(IpMiddleware())        // IP 地址处理中间件
    .use(HeaderMiddleware())    // 请求头处理中间件
    .use(InitMiddleware())      // 系统初始化检查中间件
    .use(router.routes())       // 路由处理中间件 - 将所有注册的路由规则应用到Koa应用中，负责根据请求URL和HTTP方法匹配相应的路由处理函数并执行业务逻辑
    .use(WatcherMiddleware());  // 请求监控中间件

// 获取服务器端口，优先使用环境变量，否则使用配置文件中的端口
const port = process.env.port ? parseInt(process.env.port, 10) : config.server.port;

// 启动 HTTP 服务器，监听指定端口
server.listen(port, '0.0.0.0', () => {
    kjhlog.success(`${config.name} server running on port ${port}，work process ${process.pid}`);
});
