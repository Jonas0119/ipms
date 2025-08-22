/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import utils from '~/utils';
import * as ROLE from '~/constant/role_access';
import { HOUSE, WAREHOUSE, CARPORT, MERCHANT, GARAGE } from '~/constant/building';
import { BINDING_BUILDING, TRUE } from '~/constant/status';
import moment from 'moment';

interface RequestBody {
    community_id: number;
}

const StatisticAnalysisAction = <Action>{
    router: {
        path: '/statistic/analysis',
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

        const house_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', HOUSE)
                .count()
        );
        const house_binding_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', HOUSE)
                .whereIn('id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('ipms_building_info.community_id', community_id)
                        .andWhere('ipms_building_info.type', HOUSE)
                        .andWhere('ipms_user_building.status', BINDING_BUILDING)
                        .select('ipms_user_building.building_id');
                })
                .count()
        );

        const carport_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', CARPORT)
                .count()
        );
        const carport_binding_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', CARPORT)
                .whereIn('id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('ipms_building_info.community_id', community_id)
                        .andWhere('ipms_building_info.type', CARPORT)
                        .andWhere('ipms_user_building.status', BINDING_BUILDING)
                        .select('ipms_user_building.building_id');
                })
                .count()
        );

        const warehouse_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', WAREHOUSE)
                .count()
        );
        const warehouse_binding_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', WAREHOUSE)
                .whereIn('id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('ipms_building_info.community_id', community_id)
                        .andWhere('ipms_building_info.type', WAREHOUSE)
                        .andWhere('ipms_user_building.status', BINDING_BUILDING)
                        .select('ipms_user_building.building_id');
                })
                .count()
        );

        const merchant_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', MERCHANT)
                .count()
        );
        const merchant_binding_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', MERCHANT)
                .whereIn('id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('ipms_building_info.community_id', community_id)
                        .andWhere('ipms_building_info.type', MERCHANT)
                        .andWhere('ipms_user_building.status', BINDING_BUILDING)
                        .select('ipms_user_building.building_id');
                })
                .count()
        );

        const garage_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', GARAGE)
                .count()
        );
        const garage_binding_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
                .andWhere('type', GARAGE)
                .whereIn('id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('ipms_building_info.community_id', community_id)
                        .andWhere('ipms_building_info.type', GARAGE)
                        .andWhere('ipms_user_building.status', BINDING_BUILDING)
                        .select('ipms_user_building.building_id');
                })
                .count()
        );

        const owner_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_wechat_mp_user')
                .whereIn('id', function() {
                    this.from('ipms_user_building')
                        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
                        .where('ipms_building_info.community_id', community_id)
                        .andWhere('ipms_user_building.status', BINDING_BUILDING)
                        .select('ipms_user_building.wechat_mp_user_id');
                })
                .count()
        );

        const car_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_user_car')
                .where('status', TRUE)
                .whereIn('building_id', function() {
                    this.from('ipms_building_info')
                        .where('community_id', community_id)
                        .andWhere('type', CARPORT)
                        .select('id');
                })
                .count()
        );

        const pet_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_pet')
                .where('community_id', community_id)
                .count()
        );

        const day_start = moment()
            .startOf('day')
            .valueOf();
        const day_end = moment()
            .endOf('day')
            .valueOf();

        const repairList = await ctx.model
            .from('ipms_repair')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('created_at', '<=', day_end)
            .select('created_at', 'alloted_at', 'disposed_at', 'finished_at', 'rate');

        const complainList = await ctx.model
            .from('ipms_complain')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('created_at', '<=', day_end)
            .select('created_at', 'alloted_at', 'disposed_at', 'finished_at', 'rate');

        const moveCarList = await ctx.model
            .from('ipms_move_car')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('created_at', '<=', day_end)
            .select('created_at');

        const petList = await ctx.model
            .from('ipms_pet')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('created_at', '<=', day_end)
            .select('created_at');

        const vistorList = await ctx.model
            .from('ipms_vistor')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('created_at', '<=', day_end)
            .select('created_at');

        const noticeList = await ctx.model
            .from('ipms_notice_to_user')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('created_at', '<=', day_end)
            .select('created_at');

        ctx.body = {
            code: SUCCESS,
            data: {
                house_total,
                house_binding_total,
                carport_total,
                carport_binding_total,
                warehouse_total,
                warehouse_binding_total,
                merchant_total,
                merchant_binding_total,
                garage_total,
                garage_binding_total,
                owner_total,
                car_total,
                pet_total,
                repairList,
                complainList,
                moveCarList,
                petList,
                vistorList,
                noticeList
            }
        };
    }
};

export default StatisticAnalysisAction;
