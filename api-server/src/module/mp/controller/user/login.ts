/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WEHCAT_MP_LOGIN_ERROR } from '~/constant/code';
import { INCOMPLETE_USER_INFO } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import communityService from '~/service/community';
import utils from '~/utils';

interface RequestBody {
    code: string;
    brand?: string;
    model?: string;
    system?: string;
    platform?: string;
}

const MpUserLoginAction = <Action>{
    router: {
        path: '/user/login',
        method: 'post',
        authRequired: false
    },

    validator: {
        body: [
            {
                name: 'code',
                required: true,
                regex: /^[0-9a-zA-Z-_\$]{32}$/
            },
            {
                name: 'brand',
                required: true
            },
            {
                name: 'model',
                required: true
            },
            {
                name: 'system',
                required: true
            },
            {
                name: 'platform',
                required: true
            }
        ]
    },

    response: async ctx => {
        const { code, brand, model, system, platform } = <RequestBody>ctx.request.body;

        const mpSessionInfo = await wechatService.getUserMpSession(code);

        if (!mpSessionInfo.success) {
            return (ctx.body = {
                code: WEHCAT_MP_LOGIN_ERROR,
                message: mpSessionInfo.message
            });
        }

        const token = utils.crypto.md5(`${mpSessionInfo.data.openid}${Date.now()}`);
        let mpUserInfo = await ctx.model
            .from('ipms_wechat_mp_user')
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_wechat_mp_user.union_id'
            )
            .where('ipms_wechat_mp_user.open_id', mpSessionInfo.data.openid)
            .select(
                'ipms_wechat_mp_user.id',
                'ipms_wechat_mp_user.nick_name',
                'ipms_wechat_mp_user.phone',
                'ipms_wechat_mp_user.gender',
                'ipms_wechat_mp_user.avatar_url',
                'ipms_wechat_mp_user.signature',
                'ipms_wechat_mp_user.intact',
                'ipms_wechat_mp_user.created_at',
                'ipms_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!mpUserInfo) {
            mpUserInfo = {
                open_id: mpSessionInfo.data.openid,
                union_id: mpSessionInfo.data.unionid,
                phone: null,
                created_at: Date.now()
            };

            const [id] = await ctx.model.from('ipms_wechat_mp_user').insert(mpUserInfo);

            mpUserInfo.id = id;
            mpUserInfo.gender = 0;
            mpUserInfo.intact = INCOMPLETE_USER_INFO;
            mpUserInfo.signature = '不一定每天都很好，但每天都会有些小美好在等你';
            mpUserInfo.subscribed = false;

            delete mpUserInfo.open_id;
            delete mpUserInfo.union_id;

            await ctx.model.from('ipms_wechat_mp_auth').insert({
                wechat_mp_user_id: mpUserInfo.id,
                token
            });
        } else {
            mpUserInfo.phone = utils.phone.hide(mpUserInfo.phone);

            await ctx.model
                .from('ipms_wechat_mp_auth')
                .where({ wechat_mp_user_id: mpUserInfo.id })
                .update({
                    token
                });
        }

        await ctx.model.from('ipms_wechat_mp_user_login').insert({
            wechat_mp_user_id: mpUserInfo.id,
            ip: ctx.request.ip,
            brand,
            model,
            system,
            platform,
            login_at: Date.now()
        });

        const communityInfo = await communityService(ctx.model, mpUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                userInfo: mpUserInfo,
                communityInfo
            }
        };
    }
};

export default MpUserLoginAction;
