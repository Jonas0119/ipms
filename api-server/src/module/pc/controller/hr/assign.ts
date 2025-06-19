/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

const PcHrAssignAction = <Action>{
    router: {
        path: '/hr/assign',
        method: 'get',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    response: async ctx => {
        const access = await ctx.model
            .from('ejyy_property_company_access')
            .select('id', 'name', 'content')
            .orderBy('id', 'desc');

        const department = await ctx.model
            .from('ejyy_property_company_department')
            .select('id', 'name')
            .orderBy('id', 'desc');

        const job = await ctx.model
            .from('ejyy_property_company_job')
            .select('id', 'name', 'parent_id')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                access,
                department,
                job
            }
        };
    }
};

export default PcHrAssignAction;
