/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { VISTOR_ACCESS_CODE } from '~/constant/enter_access';
import utils from '~/utils';

interface RequestParams {
    id: number;
}

const MpVistorUseAction = <Action>{
    router: {
        path: '/vistor/use/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const detail = await ctx.model
            .from('ipms_vistor')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_vistor.community_id')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_vistor.building_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_vistor.wechat_mp_user_id')
            .select(
                'ipms_vistor.id',
                'ipms_vistor.uid',
                'ipms_vistor.expire',
                'ipms_vistor.used_at',
                'ipms_vistor.created_at',
                'ipms_vistor.building_id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_community_info.name as community_name',
                'ipms_wechat_mp_user.avatar_url',
                'ipms_wechat_mp_user.nick_name'
            )
            .where('ipms_vistor.id', id)
            .first();

        const uid = utils.access.encrypt(detail.id, detail.building_id, VISTOR_ACCESS_CODE);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                uid
            }
        };
    }
};

export default MpVistorUseAction;
