/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_REPAIR_STEP } from '~/constant/repair';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcRepairDetailAction = <Action>{
    router: {
        path: '/repair/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WXWF],
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
        let allotInfo = null;
        let disposedInfo = null;
        let referInfo = null;

        const info = await ctx.model
            .from('ipms_repair')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_repair.building_id')
            .where('ipms_repair.id', id)
            .andWhere('ipms_repair.community_id', community_id)
            .select(
                'ipms_repair.id',
                'ipms_repair.wechat_mp_user_id',
                'ipms_repair.property_company_user_id',
                'ipms_repair.repair_type',
                'ipms_repair.building_id',
                'ipms_repair.description',
                'ipms_repair.repair_imgs',
                'ipms_repair.allot_user_id',
                'ipms_repair.alloted_at',
                'ipms_repair.dispose_user_id',
                'ipms_repair.dispose_reply',
                'ipms_repair.dispose_content',
                'ipms_repair.dispose_imgs',
                'ipms_repair.disposed_at',
                'ipms_repair.finished_at',
                'ipms_repair.dispose_subscribed',
                'ipms_repair.confrim_subscribed',
                'ipms_repair.finish_subscribed',
                'ipms_repair.merge_id',
                'ipms_repair.step',
                'ipms_repair.rate',
                'ipms_repair.rate_content',
                'ipms_repair.rated_at',
                'ipms_repair.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取工单信息'
            });
        }

        if (info.step >= ALLOT_REPAIR_STEP) {
            allotInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.allot_user_id)
                .select('id', 'real_name')
                .first();

            disposedInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.dispose_user_id)
                .select('id', 'real_name')
                .first();
        }

        if (info.property_company_user_id) {
            referInfo = await ctx.model
                .from('ipms_property_company_user')
                .where('id', info.property_company_user_id)
                .select('id', 'real_name')
                .first();
        } else {
            referInfo = await ctx.model
                .from('ipms_wechat_mp_user')
                .where('id', info.wechat_mp_user_id)
                .select('id', 'real_name')
                .first();
        }

        const urge_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_repair_urge')
                .where('repair_id', id)
                .count()
        );

        info.refer = info.property_company_user_id ? 'colleague' : 'owner';

        delete info.allot_user_id;
        delete info.dispose_user_id;
        delete info.property_company_user_id;
        delete info.wechat_mp_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                info: {
                    ...info,
                    repair_imgs: info.repair_imgs ? info.repair_imgs.split('#') : [],
                    dispose_imgs: info.dispose_imgs ? info.dispose_imgs.split('#') : []
                },
                referInfo,
                allotInfo,
                disposedInfo,
                urge_total
            }
        };
    }
};

export default PcRepairDetailAction;
