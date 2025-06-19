/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { OaAction } from '~/types/action';
import crypto from 'crypto';
import config from '~/config';

const OaVerifyAction = <OaAction>{
    router: {
        path: '/',
        method: 'get'
    },
    response: async ctx => {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const hash = crypto.createHash('sha1');
        const arr = [config.wechat.oa.token, timestamp, nonce].sort();
        hash.update(arr.join(''));
        const shasum = hash.digest('hex');

        if (shasum === signature) {
            return (ctx.body = echostr as string);
        }

        ctx.status = 401;
        ctx.body = 'Invalid signature';
    }
};

export default OaVerifyAction;
