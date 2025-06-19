/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import { Middleware, DefaultState, DefaultContext } from 'koa';
import utils from '~/utils';
import config from '~/config';
import fs from 'fs';
import path from 'path';

function WatcherMiddleware(): Middleware<DefaultState, DefaultContext> {
    return async (ctx, next) => {
        try {
            await next();
        } catch (error) {
            ctx.status = 500;

            if (config.debug) {
                kjhlog.error('===============错误捕捉开始=================');
                console.log(error);
                kjhlog.error('===============错误捕捉结束=================');
            } else {
                utils.mail.send({
                    to: config.smtp.to,
                    subject: `${config.name}异常捕获`,
                    content: [
                        `访问地址：${ctx.request.path}`,
                        `进程号：${process.pid}`,
                        `body参数： ${JSON.stringify(ctx.request.body)}`,
                        `params参数： ${JSON.stringify(ctx.params)}`,
                        `进程号：${process.pid}`,
                        `错误原因：${error}`
                    ]
                });
            }
        }

        if (ctx.status === 404) {
            // 检查是否是本地开发环境
            const isLocalDev =
                config.debug ||
                ctx.host.includes('localhost') ||
                ctx.host.includes('127.0.0.1') ||
                ctx.host.includes('172.17.0.5') ||
                /^\d+\.\d+\.\d+\.\d+/.test(ctx.host);

            if (isLocalDev) {
                // 本地环境：检查是否是API请求
                const isApiRequest =
                    ctx.path.startsWith('/pc/') ||
                    ctx.path.startsWith('/mp/') ||
                    ctx.path.startsWith('/oa/') ||
                    ctx.path.startsWith('/notify/') ||
                    ctx.path.startsWith('/static/') ||
                    ctx.path.startsWith('/cws/');

                if (isApiRequest) {
                    // API请求返回404 JSON响应
                    ctx.status = 404;
                    ctx.body = { code: 404, message: '页面不存在' };
                } else {
                    // 前端路由：尝试返回index.html (SPA回退)
                    try {
                        const indexPath = path.join(process.cwd(), 'console-web/dist/index.html');
                        if (fs.existsSync(indexPath)) {
                            const content = fs.readFileSync(indexPath, 'utf-8');
                            ctx.status = 200;
                            ctx.type = 'text/html';
                            ctx.body = content;
                        } else {
                            ctx.status = 404;
                            ctx.body = { code: 404, message: '前端文件未找到' };
                        }
                    } catch (err) {
                        kjhlog.error('读取index.html失败: ' + err.message);
                        ctx.status = 404;
                        ctx.body = { code: 404, message: '页面加载失败' };
                    }
                }
            } else {
                // 生产环境：重定向到官网
            }
        }
    };
}

export default WatcherMiddleware;
