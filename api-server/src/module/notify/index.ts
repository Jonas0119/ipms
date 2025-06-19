/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import path from 'path';
import { Context } from 'koa';
import { NotifyAction } from '~/types/action';
import KoaRouter from 'koa-router';
import * as NotifyModuleRouter from './router';
import config from '~/config';

function MpModule(appRouter: KoaRouter) {
    for (const name in NotifyModuleRouter) {
        const { router, response } = <NotifyAction>NotifyModuleRouter[name];

        appRouter[router.method](path.posix.join('/notify', router.path), async (ctx: Context, next) => {
            await response.apply(this, [ctx, next]);
        });

        if (config.debug) {
            kjhlog.info(
                `${name} mounted and request from ${path.posix.join('/notify', router.path)} by ${router.method}`
            );
        }
    }
}

export default MpModule;
