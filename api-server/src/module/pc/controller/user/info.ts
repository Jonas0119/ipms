/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

const PcUserInfoAction = <Action>{
    router: {
        path: '/user/info',
        method: 'get',
        authRequired: true
    },

    response: async ctx => {
        const postInfo = await propertyCompanyService.postInfo(ctx.model, ctx.pcUserInfo.id);
        const info = { ...ctx.pcUserInfo };

        info.phone = utils.phone.hide(info.phone);

        delete info.department_id;
        delete info.job_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                userInfo: info,
                postInfo
            }
        };
    }
};

export default PcUserInfoAction;
