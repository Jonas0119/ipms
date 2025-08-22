/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE } from '~/constant/status';
import * as mapSerivce from '~/service/map';

interface RequestBody {
    community_id: number;
}

const PcSignSettingDetailAction = <Action>{
    router: {
        path: '/sign_setting/detail',
        method: 'post',
        authRequired: true,
        roles: [],
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

        const detail = await ctx.model
            .from('ipms_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', TRUE)
            .select('lat', 'lng', 'distance')
            .first();

        let location = {};

        if (!detail) {
            location = await mapSerivce.getLocation(ctx.request.ip);
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                location
            }
        };
    }
};

export default PcSignSettingDetailAction;
