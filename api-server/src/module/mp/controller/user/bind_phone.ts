/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WEHCAT_MP_GET_PHONE_ERROR } from '~/constant/code';
import * as wechatService from '~/service/wechat';
import utils from '~/utils';
import kjhlog from '~/utils/kjhlog';

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
                regex: /^[0-9a-zA-Z-_$]{32}$/
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
        
        kjhlog.info('用户绑定手机号请求开始', {
            userId: ctx.mpUserInfo.id,
            code: code.substring(0, 8) + '...',
            hasEncryptedData: !!encryptedData,
            hasIv: !!iv
        });

        const phoneInfo = await wechatService.getUserMpPhone(code, iv, encryptedData);

        if (!phoneInfo.success) {
            kjhlog.error('获取微信手机号失败', {
                userId: ctx.mpUserInfo.id,
                error: phoneInfo.message,
                code: code.substring(0, 8) + '...'
            });
            return (ctx.body = {
                code: WEHCAT_MP_GET_PHONE_ERROR,
                message: '获取手机号码失败'
            });
        }

        kjhlog.info('成功获取微信手机号', {
            userId: ctx.mpUserInfo.id,
            phone: phoneInfo.data.purePhoneNumber.substring(0, 3) + '****' + phoneInfo.data.purePhoneNumber.substring(7)
        });

        try {
            await ctx.model
                .from('ipms_wechat_mp_user')
                .where({ id: ctx.mpUserInfo.id })
                .update({ phone: phoneInfo.data.purePhoneNumber });

            kjhlog.info('用户手机号更新成功', {
                userId: ctx.mpUserInfo.id,
                phone: phoneInfo.data.purePhoneNumber.substring(0, 3) + '****' + phoneInfo.data.purePhoneNumber.substring(7)
            });
        } catch (error) {
            kjhlog.error('更新用户手机号失败', {
                userId: ctx.mpUserInfo.id,
                error: error.message,
                phone: phoneInfo.data.purePhoneNumber.substring(0, 3) + '****' + phoneInfo.data.purePhoneNumber.substring(7)
            });
            return (ctx.body = {
                code: WEHCAT_MP_GET_PHONE_ERROR,
                message: '绑定手机号失败'
            });
        }

        const { purePhoneNumber: phone } = phoneInfo.data;

        kjhlog.info('用户绑定手机号成功', {
            userId: ctx.mpUserInfo.id,
            hiddenPhone: utils.phone.hide(phone)
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                phone: utils.phone.hide(phone)
            }
        };
    }
};

export default MpUserBindPhoneAction;
