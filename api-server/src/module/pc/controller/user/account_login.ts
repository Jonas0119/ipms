/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, CAPTCHA_ERROR, PWD_ERROR } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

interface RequestBody {
    account: string;
    password: string;
    captcha: string;
}

const PcUserAccountLoginAction = <Action>{
    router: {
        path: '/user/account_login',
        method: 'post',
        authRequired: false
    },
    validator: {
        body: [
            {
                name: 'account',
                required: true,
                min: 4,
                max: 32
            },
            {
                name: 'password',
                required: true,
                max: 32
            },
            {
                name: 'captcha',
                required: true,
                length: 4
            }
        ]
    },
    response: async ctx => {
        const { account, password, captcha } = <RequestBody>ctx.request.body;

        if (!ctx.session.loginCaptcha || ctx.session.loginCaptcha !== captcha.toLowerCase()) {
            return (ctx.body = {
                code: CAPTCHA_ERROR,
                message: '验证码错误'
            });
        }

        delete ctx.session.loginCaptcha;

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
            .where('ipms_property_company_user.account', account)
            .select(
                'ipms_property_company_user.id',
                'ipms_property_company_user.account',
                'ipms_property_company_user.password',
                'ipms_property_company_user.open_id',
                'ipms_property_company_user.real_name',
                'ipms_property_company_user.gender',
                'ipms_property_company_user.avatar_url',
                'ipms_property_company_user.phone',
                'ipms_property_company_user.department_id',
                'ipms_property_company_user.job_id',
                'ipms_property_company_user.join_company_at',
                'ipms_property_company_user.admin',
                'ipms_property_company_user.created_at',
                'ipms_wechat_official_accounts_user.subscribed',
                'ipms_property_company_access.content'
            )
            .first();

        if (!pcUserInfo || pcUserInfo.password !== utils.crypto.md5(password)) {
            return (ctx.body = {
                code: PWD_ERROR,
                message: '密码错误或账号不存在'
            });
        }

        const token = utils.crypto.md5(`${pcUserInfo.openid}${Date.now()}`);

        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];

        delete pcUserInfo.openid;
        delete pcUserInfo.content;
        delete pcUserInfo.password;
        delete pcUserInfo.department_id;
        delete pcUserInfo.job_id;

        await ctx.model
            .from('ipms_property_company_auth')
            .where({ property_company_user_id: pcUserInfo.id })
            .update({
                token
            });

        await ctx.model.from('ipms_property_company_user_login').insert({
            property_company_user_id: pcUserInfo.id,
            ip: ctx.request.ip,
            user_agent: ctx.headers['user-agent'],
            login_at: Date.now()
        });

        const postInfo = await propertyCompanyService.postInfo(ctx.model, pcUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                userInfo: pcUserInfo,
                postInfo
            }
        };
    }
};

export default PcUserAccountLoginAction;
