/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WEHCAT_MP_GET_PHONE_ERROR } from '~/constant/code';
import * as wechatService from '~/service/wechat';
import utils from '~/utils';

interface RequestBody {
    code: string;
    encryptedData: string;
    iv: string;
}

const MpUserBindPhoneAction = <Action>{
    router: {
        path: '/user/bind_phone',
        method: 'post',
        authRequired: true
    },
    validator: {
        body: [
            {
                name: 'code',
                required: true,
                regex: /^[0-9a-zA-Z]{32}$/
            },
            {
                name: 'encryptedData',
                required: true
            },
            {
                name: 'iv',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { code, encryptedData, iv } = <RequestBody>ctx.request.body;

        const phoneInfo = await wechatService.getUserMpPhone(code, iv, encryptedData);

        if (!phoneInfo.success) {
            return (ctx.body = {
                code: WEHCAT_MP_GET_PHONE_ERROR,
                message: '获取手机号码失败'
            });
        }

        await ctx.model
            .from('ejyy_wechat_mp_user')
            .where({ id: ctx.mpUserInfo.id })
            .update({ phone: phoneInfo.data.purePhoneNumber });

        const { purePhoneNumber: phone } = phoneInfo.data;

        ctx.body = {
            code: SUCCESS,
            data: {
                phone: utils.phone.hide(phone)
            }
        };
    }
};

export default MpUserBindPhoneAction;
