/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import * as ROLE from '~/constant/role_access';
import { SUCCESS } from '~/constant/code';
import utils from '~/utils';

interface RequestBody {
    password: string;
}

const PcUserResetAction = <Action>{
    router: {
        path: '/user/reset',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        body: [
            {
                name: 'password',
                required: true,
                max: 32
            }
        ]
    },
    response: async ctx => {
        const { password } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ipms_property_company_user')
            .where('id', ctx.pcUserInfo.id)
            .update('password', utils.crypto.md5(password));

        ctx.body = {
            code: SUCCESS,
            message: '重置登录密码成功'
        };
    }
};

export default PcUserResetAction;
