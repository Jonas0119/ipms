/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import 'module-alias/register';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBodyMiddleware from 'koa-body';
import KoaSessionMilddleware from 'koa-session';
import KoaLogMiddleware from 'koa-logger';
import MysqlSessionStore from '~/store/mysql-session';
import http from 'http';
import config from '~/config';
import * as ScheduleJob from '~/schedule';
import MpModule from '~/module/mp';
import PcModule from '~/module/pc';
import NotifyModule from '~/module/notify';
import OaModule from '~/module/oa';
import wss from '~/wss';
import * as redisService from '~/service/redis';
import ModelMiddleware from '~/middleware/model';
import IpMiddleware from '~/middleware/ip';
import HeaderMiddleware from '~/middleware/header';
import WatcherMiddleware from '~/middleware/watcher';
import InitMiddleware from '~/middleware/init';
import StaticMiddleware from '~/middleware/static';
import kjhlog from '~/utils/kjhlog';

// Declare global kjhlog type
declare global {
    var kjhlog: typeof import('~/utils/kjhlog').default;
}

const app = new Koa();
const router = new KoaRouter();
const server = http.createServer(app.callback());

// Initialize global kjhlog
global.kjhlog = kjhlog;
kjhlog.info(`Starting ${config.name} server with process ${process.pid}`);

// schedule
ScheduleJob.run();

// modules
MpModule(router);
PcModule(router);
NotifyModule(router);
OaModule(router);

// WebSocket
wss.init(server);

// for socket
redisService.subscribe();

app.use(KoaBodyMiddleware({ multipart: true }))
    .use(
        KoaLogMiddleware({
            transporter: str => {
                kjhlog.info(`${str}`);
            }
        })
    )
    .use(
        KoaSessionMilddleware(
            {
                store: new MysqlSessionStore(),
                ...config.session
            },
            app
        )
    )
    .use(StaticMiddleware())
    .use(ModelMiddleware())
    .use(IpMiddleware())
    .use(HeaderMiddleware())
    .use(InitMiddleware())
    .use(router.routes())
    .use(WatcherMiddleware());

const port = process.env.port ? parseInt(process.env.port, 10) : config.server.port;

server.listen(port, '0.0.0.0', () => {
    kjhlog.success(`${config.name} server running on port ${port}，work process ${process.pid}`);
});
