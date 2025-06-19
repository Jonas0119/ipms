/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import path from 'path';
import { Context } from 'koa';
import { OaAction } from '~/types/action';
import KoaRouter from 'koa-router';
import * as OaModuleRouter from './router';
import * as wechatService from '~/service/wechat';
import menu from './menu';
import config from '~/config';

async function OaModule(appRouter: KoaRouter) {
    for (const name in OaModuleRouter) {
        const { router, response } = <OaAction>OaModuleRouter[name];

        appRouter[router.method](path.posix.join('/oa', router.path), async (ctx: Context, next) => {
            await response.apply(this, [ctx, next]);
        });

        if (config.debug) {
            kjhlog.info(`${name} mounted and request from ${path.posix.join('/oa', router.path)} by ${router.method}`);
        }
    }

    const { errmsg } = await wechatService.createOaMenu(menu);
    kjhlog.info(`公众号菜单创建：${errmsg}`);
}

export default OaModule;
