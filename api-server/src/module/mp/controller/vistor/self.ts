/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpVistorSelfAction = <Action>{
    router: {
        path: '/vistor/self',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_vistor')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_vistor.community_id')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_vistor.building_id')
            .where('ipms_vistor.vistor_phone', ctx.mpUserInfo.phone)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_vistor.id'))
            .select(
                'ipms_vistor.id',
                'ipms_vistor.used_at',
                'ipms_vistor.expire',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_community_info.name as community_name'
            )
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

export default MpVistorSelfAction;
