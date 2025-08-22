/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    WATER_AND_HEATING,
    ELECTRICITY,
    DOOR_AND_WINDOW,
    PUBLIC_FACILITY,
    SUBMIT_REPAIR_STEP,
    ALLOT_REPAIR_STEP,
    CONFIRM_REPAIR_STEP,
    FINISH_REPAIR_STEP
} from '~/constant/repair';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    repair_type: typeof WATER_AND_HEATING | typeof ELECTRICITY | typeof DOOR_AND_WINDOW | typeof PUBLIC_FACILITY;
    step: typeof SUBMIT_REPAIR_STEP | typeof ALLOT_REPAIR_STEP | typeof CONFIRM_REPAIR_STEP | typeof FINISH_REPAIR_STEP;
    refer: 'owner' | 'colleague';
}

const PcRepairListAction = <Action>{
    router: {
        path: '/repair/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WXWF],
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
                name: 'repair_type',
                regex: /^1|2|3|4$/
            },
            {
                name: 'step',
                regex: /^1|2|3|4$/
            },
            {
                name: 'refer',
                regex: /^owner|colleague$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, repair_type, step, refer } = <RequestBody>ctx.request.body;
        const where = {};

        if (repair_type) {
            where['repair_type'] = repair_type;
        }

        const list = await ctx.model
            .from('ipms_repair')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_repair.building_id')
            .where('ipms_repair.community_id', community_id)
            .andWhere(where)
            .where(function() {
                if (step) {
                    if (step === FINISH_REPAIR_STEP) {
                        this.where('ipms_repair.step', step).orWhereNotNull('ipms_repair.merge_id');
                    } else {
                        this.where('ipms_repair.step', step);
                    }
                }
            })
            .andWhere(function() {
                if (refer) {
                    if (refer === 'owner') {
                        this.whereNotNull('ipms_repair.wechat_mp_user_id');
                    } else {
                        this.whereNotNull('ipms_repair.property_company_user_id');
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_repair.id'))
            .select(
                'ipms_repair.id',
                'ipms_repair.repair_type',
                'ipms_repair.description',
                'ipms_repair.building_id',
                'ipms_repair.step',
                'ipms_repair.merge_id',
                'ipms_repair.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

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

export default PcRepairListAction;
