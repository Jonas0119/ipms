/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    used?: boolean;
}

const PcVistorListAction = <Action>{
    router: {
        path: '/vistor/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FKTX],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'used',
                regex: /^true|false$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, used } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_vistor')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_vistor.building_id')
            .where('ipms_vistor.community_id', community_id)
            .andWhere(function() {
                if (typeof used === 'boolean') {
                    if (used) {
                        this.whereNotNull('ipms_vistor.used_at');
                    } else {
                        this.whereNull('ipms_vistor.used_at');
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_vistor.id'))
            .select(
                'ipms_vistor.id',
                'ipms_vistor.vistor_name',
                'ipms_vistor.have_vistor_info',
                'ipms_vistor.used_at',
                'ipms_vistor.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .select(ctx.model.raw('IF(ipms_vistor.property_company_user_id, 1, 0) as check_in'))
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_vistor.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcVistorListAction;
