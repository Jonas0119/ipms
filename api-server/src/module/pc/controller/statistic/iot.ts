/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const StatisticIotAction = <Action>{
    router: {
        path: '/statistic/iot',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const entrance = await ctx.model
            .from('ipms_iot_entrance')
            .where('community_id', community_id)
            .select('name', 'online');

        const elevator = await ctx.model
            .from('ipms_iot_elevator')
            .where('community_id', community_id)
            .select('name', 'online');

        const lamp = await ctx.model
            .from('ipms_iot_lamp')
            .leftJoin('ipms_iot_lamp_line', 'ipms_iot_lamp_line.lamp_id', 'ipms_iot_lamp.id')
            .where('ipms_iot_lamp.community_id', community_id)
            .select(
                'ipms_iot_lamp.id',
                'ipms_iot_lamp.name',
                'ipms_iot_lamp.online',
                'ipms_iot_lamp_line.name as line'
            );

        const lmap = {};

        lamp.forEach(record => {
            if (!(record.id in lmap)) {
                lmap[record.id] = {
                    name: record.name,
                    online: record.online,
                    line: []
                };
            }

            if (record.line) {
                lmap[record.id].line.push(record.line);
            }
        });

        const repeater = await ctx.model
            .from('ipms_iot_meter_repeater')
            .where('community_id', community_id)
            .select('name', 'online');

        const park = await ctx.model
            .from('ipms_iot_park')
            .where('community_id', community_id)
            .select('name', 'online');

        const warning = await ctx.model
            .from('ipms_iot_warning')
            .where('community_id', community_id)
            .select('name', 'online');

        ctx.body = {
            code: SUCCESS,
            data: {
                entrance,
                elevator,
                lamp: Object.values(lmap),
                repeater,
                park,
                warning
            }
        };
    }
};

export default StatisticIotAction;
