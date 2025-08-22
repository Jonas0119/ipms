/**
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2025 IPMS
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Author: support@ipms.local
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
}

const PcOptionBuildingAction = <Action>{
    router: {
        path: '/option/building',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
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

        const list = await ctx.model
            .from('ipms_building_info')
            .where('community_id', community_id)
            .select('id as building_id', 'type', 'area', 'building', 'unit', 'number');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcOptionBuildingAction;
