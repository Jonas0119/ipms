/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    community_id: number;
    lng: number;
    lat: number;
    distance: number;
}

const PcSignSettingCreateAction = <Action>{
    router: {
        path: '/sign_setting/create',
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
            },
            {
                name: 'lng',
                required: true,
                regex: /^\d+(\.\d+)?$/
            },
            {
                name: 'lat',
                required: true,
                regex: /^\d+(\.\d+)?$/
            },
            {
                name: 'distance',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, distance, lng, lat } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ipms_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', TRUE)
            .update('latest', FALSE);

        await ctx.model.from('ipms_employee_sign_setting').insert({
            community_id,
            lng,
            lat,
            distance,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcSignSettingCreateAction;
