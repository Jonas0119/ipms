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

const MpVistorDetailAction = <Action>{
    router: {
        path: '/vistor/detail/:id',
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
            .select(
                'ipms_vistor.id',
                'ipms_vistor.vistor_name',
                'ipms_vistor.vistor_phone',
                'ipms_vistor.car_number',
                'ipms_vistor.uid',
                'ipms_vistor.have_vistor_info',
                'ipms_vistor.expire',
                'ipms_vistor.used_at',
                'ipms_vistor.created_at',
                'ipms_vistor.building_id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_community_info.name as community_name'
            )
            .select(ctx.model.raw('IF(ipms_vistor.property_company_user_id, 1, 0) as check_in'))
            .where('ipms_vistor.id', id)
            .where('ipms_vistor.wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        detail.vistor_phone = utils.phone.hide(detail.vistor_phone);

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

export default MpVistorDetailAction;
