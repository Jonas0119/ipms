/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { VISTOR_ACCESS_CODE } from '~/constant/enter_access';
import utils from '~/utils';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcVistorDetailAction = <Action>{
    router: {
        path: '/vistor/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FKTX],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;
        let registrant = null;

        const info = await ctx.model
            .from('ipms_vistor')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_vistor.building_id')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_vistor.scan_by')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_vistor.wechat_mp_user_id')
            .select(
                'ipms_vistor.id',
                'ipms_vistor.vistor_name',
                'ipms_vistor.vistor_phone',
                'ipms_vistor.car_number',
                'ipms_vistor.have_vistor_info',
                'ipms_vistor.scan_by',
                'ipms_vistor.building_id',
                'ipms_vistor.property_company_user_id',
                'ipms_vistor.wechat_mp_user_id as owner_id',
                'ipms_wechat_mp_user.real_name as owner_name',
                'ipms_vistor.uid',
                'ipms_vistor.expire',
                'ipms_vistor.used_at',
                'ipms_vistor.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_property_company_user.id as scan_user_id',
                'ipms_property_company_user.real_name as scan_real_name'
            )
            .where('ipms_vistor.id', id)
            .andWhere('ipms_vistor.community_id', community_id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取访客信息'
            });
        }

        if (info.property_company_user_id) {
            registrant = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.property_company_user_id)
                .select('id', 'real_name')
                .first();
        }

        delete info.property_company_user_id;

        const uid = utils.access.encrypt(info.id, info.building_id, VISTOR_ACCESS_CODE);

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                uid,
                registrant
            }
        };
    }
};

export default PcVistorDetailAction;
