/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, WEHCAT_MP_LOGIN_ERROR, ILLEGAL_PROPERTY_COMPANY_USER } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

interface RequestBody {
    code: string;
    brand?: string;
    model?: string;
    system?: string;
    platform?: string;
    encryptedData: string;
    iv: string;
}

const PcUserMpLoginAction = <Action>{
    router: {
        path: '/user/mp_login',
        method: 'post',
        authRequired: false
    },

    validator: {
        body: [
            {
                name: 'code',
                required: true,
                regex: /^[0-9a-zA-Z]{32}$/
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
        const { code, encryptedData, iv, brand, model, system, platform } = <RequestBody>ctx.request.body;

        const phoneInfo = await wechatService.getUserMpPhone(code, iv, encryptedData);

        if (!phoneInfo.success) {
            return (ctx.body = {
                code: WEHCAT_MP_LOGIN_ERROR,
                message: phoneInfo.message
            });
        }

        let pcUserInfo = await ctx.model
            .table('ipms_property_company_user')
            .leftJoin(
                'ipms_wechat_official_accounts_user',
                'ipms_wechat_official_accounts_user.union_id',
                'ipms_property_company_user.union_id'
            )
            .leftJoin(
                'ipms_property_company_access',
                'ipms_property_company_access.id',
                'ipms_property_company_user.access_id'
            )
            .where('ipms_property_company_user.leave_office', FALSE)
            .where('ipms_property_company_user.phone', phoneInfo.data.purePhoneNumber)
            .select(
                'ipms_property_company_user.id',
                'ipms_property_company_user.account',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.gender',
                'ipms_property_company_user.avatar_url',
                'ipms_property_company_user.phone',
                'ipms_property_company_user.admin',
                'ipms_property_company_user.join_company_at',
                'ipms_property_company_user.created_at',
                'ipms_wechat_official_accounts_user.subscribed',
                'ipms_property_company_access.content'
            )
            .first();

        if (!pcUserInfo) {
            return (ctx.body = {
                code: ILLEGAL_PROPERTY_COMPANY_USER,
                message: '未查询到任职信息'
            });
        }

        await ctx.model
            .from('ipms_property_company_user')
            .update({
                open_id: phoneInfo.data.openid,
                union_id: phoneInfo.data.unionid
            })
            .where('id', pcUserInfo.id);

        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];
        delete pcUserInfo.content;

        const token = utils.crypto.md5(`${phoneInfo.data.openid}${Date.now()}`);
        await ctx.model
            .from('ipms_property_company_auth')
            .where({ property_company_user_id: pcUserInfo.id })
            .update({
                token
            });

        await ctx.model.from('ipms_property_company_user_login').insert({
            property_company_user_id: pcUserInfo.id,
            ip: ctx.request.ip,
            user_agent: `brand/${brand},model/${model},system/${system},platform/$${platform}`,
            login_at: Date.now()
        });

        const postInfo = await propertyCompanyService.postInfo(ctx.model, pcUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                postInfo,
                userInfo: pcUserInfo
            }
        };
    }
};

export default PcUserMpLoginAction;
