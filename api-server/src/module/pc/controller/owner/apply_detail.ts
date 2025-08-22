/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcOwerApplyDetailAction = <Action>{
    router: {
        path: '/owner/apply_detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_owner_apply')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_owner_apply.wechat_mp_user_id')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_owner_apply.replied_by')
            .where('ipms_owner_apply.id', id)
            .andWhere('ipms_owner_apply.community_id', community_id)
            .select(
                'ipms_owner_apply.id',
                'ipms_owner_apply.wechat_mp_user_id',
                'ipms_owner_apply.community_name',
                'ipms_owner_apply.house',
                'ipms_owner_apply.carport',
                'ipms_owner_apply.warehouse',
                'ipms_owner_apply.subscribed',
                'ipms_owner_apply.replied',
                'ipms_owner_apply.replied_by',
                'ipms_owner_apply.reply_content',
                'ipms_owner_apply.replied_at',
                'ipms_owner_apply.replied',
                'ipms_owner_apply.content',
                'ipms_owner_apply.success',
                'ipms_owner_apply.created_at',
                'ipms_wechat_mp_user.real_name',
                'ipms_property_company_user.real_name as replied_real_name'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取用户信息'
            });
        }

        let buildings = [];

        if (info.replied && info.success) {
            buildings = await ctx.model
                .from('ipms_building_info')
                .leftJoin('ipms_user_building', 'ipms_user_building.building_id', 'ipms_building_info.id')
                .where('ipms_building_info.community_id', community_id)
                .andWhere('ipms_user_building.wechat_mp_user_id', info.wechat_mp_user_id)
                .whereIn('ipms_building_info.id', info.content)
                .select(
                    'ipms_user_building.id',
                    'ipms_user_building.building_id',
                    'ipms_building_info.type',
                    'ipms_building_info.area',
                    'ipms_building_info.building',
                    'ipms_building_info.unit',
                    'ipms_building_info.number',
                    'ipms_building_info.construction_area',
                    'ipms_building_info.created_at',
                    'ipms_user_building.authenticated',
                    'ipms_user_building.authenticated_type',
                    'ipms_user_building.status'
                );
        }

        delete info.content;

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                buildings
            }
        };
    }
};

export default PcOwerApplyDetailAction;
