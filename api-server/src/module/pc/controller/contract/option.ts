/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

const PcContractOptionAction = <Action>{
    router: {
        path: '/contract/option',
        method: 'get',
        authRequired: true,
        roles: [ROLE.HTGL]
    },
    response: async ctx => {
        const list = await ctx.model
            .from('ipms_contract_category')
            .select('id', 'name', 'description')
            .orderBy('id');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcContractOptionAction;
