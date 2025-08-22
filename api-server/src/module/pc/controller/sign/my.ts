/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import moment from 'moment';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const PcSignMyAction = <Action>{
    router: {
        path: '/sign/my',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const date = moment()
            .startOf('day')
            .valueOf();

        const list = await ctx.model
            .from('ipms_employee_sign_record')
            .where('date', date)
            .andWhere('community_id', community_id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .select('begin', 'finish')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcSignMyAction;
