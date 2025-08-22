/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { BINDING_BUILDING, BINDING_CAR, TRUE } from '~/constant/status';
import utils from '~/utils';
import os from 'os';
import checkDiskSpace from 'check-disk-space';
import moment from 'moment';

interface RequestBody {
    community_id: number;
}

const StatisticScreenAction = <Action>{
    router: {
        path: '/statistic/screen',
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

        const building_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_building_info')
                .where('community_id', community_id)
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
                .where('status', BINDING_CAR)
                .whereIn('building_id', function() {
                    this.from('ipms_building_info')
                        .where('community_id', community_id)
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

        const repair_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_repair')
                .where('community_id', community_id)
                .count()
        );

        const complain_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_complain')
                .where('community_id', community_id)
                .count()
        );

        const movecar_total = utils.sql.countReader(
            await ctx.model
                .from('ipms_move_car')
                .where('community_id', community_id)
                .count()
        );

        const diskInfo = await checkDiskSpace('/');

        const day_start = moment()
            .startOf('day')
            .valueOf();
        const day_end = moment()
            .endOf('day')
            .valueOf();

        const entrance_log = await ctx.model
            .from('ipms_iot_entrance_log')
            .leftJoin('ipms_iot_entrance', 'ipms_iot_entrance.id', 'ipms_iot_entrance_log.entrance_id')
            .where('ipms_iot_entrance.community_id', community_id)
            .andWhere('ipms_iot_entrance_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ipms_iot_entrance_log.created_at', '<=', day_end)
            .select('ipms_iot_entrance_log.created_at');

        const elevator_log = await ctx.model
            .from('ipms_iot_elevator_log')
            .leftJoin('ipms_iot_elevator', 'ipms_iot_elevator.id', 'ipms_iot_elevator_log.elevator_id')
            .where('ipms_iot_elevator.community_id', community_id)
            .andWhere('ipms_iot_elevator_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ipms_iot_elevator_log.created_at', '<=', day_end)
            .select('ipms_iot_elevator_log.created_at');

        const lamp_log = await ctx.model
            .from('ipms_iot_lamp_log')
            .leftJoin('ipms_iot_lamp_line', 'ipms_iot_lamp_line.id', 'ipms_iot_lamp_log.lamp_line_id')
            .leftJoin('ipms_iot_lamp', 'ipms_iot_lamp.id', 'ipms_iot_lamp_line.lamp_id')
            .where('ipms_iot_lamp.community_id', community_id)
            .andWhere('ipms_iot_lamp_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ipms_iot_lamp_log.created_at', '<=', day_end)
            .select('ipms_iot_lamp_log.created_at');

        const repeater_log = await ctx.model
            .from('ipms_iot_meter_read')
            .leftJoin('ipms_iot_meter', 'ipms_iot_meter.id', 'ipms_iot_meter_read.meter_id')
            .where('ipms_iot_meter.community_id', community_id)
            .andWhere('ipms_iot_meter_read.from_repeater', TRUE)
            .andWhere('ipms_iot_meter_read.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ipms_iot_meter_read.created_at', '<=', day_end)
            .select('ipms_iot_meter_read.created_at');

        const park_log = await ctx.model
            .from('ipms_iot_park_log')
            .leftJoin('ipms_iot_park', 'ipms_iot_park.id', 'ipms_iot_park_log.park_id')
            .where('ipms_iot_park.community_id', community_id)
            .andWhere('ipms_iot_park_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ipms_iot_park_log.created_at', '<=', day_end)
            .select('ipms_iot_park_log.created_at');

        const warning_log = await ctx.model
            .from('ipms_iot_warning_log')
            .leftJoin('ipms_iot_warning', 'ipms_iot_warning.id', 'ipms_iot_warning_log.warning_id')
            .where('ipms_iot_warning.community_id', community_id)
            .andWhere('ipms_iot_warning_log.created_at', '>=', day_start - 1000 * 6 * 24 * 60 * 60)
            .andWhere('ipms_iot_warning_log.created_at', '<=', day_end)
            .select('ipms_iot_warning_log.created_at');

        const center = await ctx.model
            .from('ipms_employee_sign_setting')
            .where('community_id', community_id)
            .andWhere('latest', true)
            .select('lat', 'lng')
            .first();

        const entrance = await ctx.model
            .from('ipms_iot_entrance')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const elevator = await ctx.model
            .from('ipms_iot_elevator')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const lamp = await ctx.model
            .from('ipms_iot_lamp')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const repeater = await ctx.model
            .from('ipms_iot_meter_repeater')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const park = await ctx.model
            .from('ipms_iot_park')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const warning = await ctx.model
            .from('ipms_iot_warning')
            .where('community_id', community_id)
            .select('lat', 'lng', 'online');

        const entrance_current_day_log = await ctx.model
            .from('ipms_iot_entrance_log')
            .leftJoin('ipms_iot_entrance', 'ipms_iot_entrance.id', 'ipms_iot_entrance_log.entrance_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_iot_entrance_log.wechat_mp_user_id')
            .leftJoin('ipms_vistor', 'ipms_vistor.id', 'ipms_iot_entrance_log.vistor_id')
            .where('ipms_iot_entrance.community_id', community_id)
            .andWhere('ipms_iot_entrance_log.created_at', '>=', day_start)
            .andWhere('ipms_iot_entrance_log.created_at', '<=', day_end)
            .select(
                'ipms_iot_entrance_log.created_at',
                'ipms_iot_entrance.name',
                'ipms_wechat_mp_user.real_name as owner',
                'ipms_vistor.vistor_name as vistor'
            )
            .limit(15)
            .offset(0)
            .orderBy('ipms_iot_entrance_log.id', 'desc');

        const elevator_current_day_log = await ctx.model
            .from('ipms_iot_elevator_log')
            .leftJoin('ipms_iot_elevator', 'ipms_iot_elevator.id', 'ipms_iot_elevator_log.elevator_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_iot_elevator_log.wechat_mp_user_id')
            .leftJoin('ipms_vistor', 'ipms_vistor.id', 'ipms_iot_elevator_log.vistor_id')
            .where('ipms_iot_elevator.community_id', community_id)
            .andWhere('ipms_iot_elevator_log.created_at', '>=', day_start)
            .andWhere('ipms_iot_elevator_log.created_at', '<=', day_end)
            .select(
                'ipms_iot_elevator_log.created_at',
                'ipms_iot_elevator.name',
                'ipms_wechat_mp_user.real_name as owner',
                'ipms_vistor.vistor_name as vistor'
            )
            .limit(15)
            .offset(0)
            .orderBy('ipms_iot_elevator_log.id', 'desc');

        const park_current_day_log = await ctx.model
            .from('ipms_iot_park_log')
            .leftJoin('ipms_iot_park', 'ipms_iot_park.id', 'ipms_iot_park_log.park_id')
            .where('ipms_iot_park.community_id', community_id)
            .andWhere('ipms_iot_park_log.created_at', '>=', day_start)
            .andWhere('ipms_iot_park_log.created_at', '<=', day_end)
            .select(
                'ipms_iot_park_log.created_at',
                'ipms_iot_park_log.car_number',
                'ipms_iot_park_log.gate',
                'ipms_iot_park.name'
            )
            .limit(15)
            .offset(0)
            .orderBy('ipms_iot_park_log.id', 'desc');

        const repair_current_day = await ctx.model
            .from('ipms_repair')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start)
            .andWhere('created_at', '<=', day_end)
            .select('step', 'merge_id', 'rate');

        const complain_current_day = await ctx.model
            .from('ipms_complain')
            .where('community_id', community_id)
            .andWhere('created_at', '>=', day_start)
            .andWhere('created_at', '<=', day_end)
            .select('step', 'merge_id', 'rate');

        const warning_current = await ctx.model
            .from('ipms_iot_warning_log')
            .leftJoin('ipms_iot_warning', 'ipms_iot_warning.id', 'ipms_iot_warning_log.warning_id')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_iot_warning_log.building_id')
            .where('ipms_iot_warning.community_id', community_id)
            .andWhere('ipms_iot_warning_log.created_at', '>=', day_start)
            .andWhere('ipms_iot_warning_log.created_at', '<=', day_end)
            .select(
                'ipms_iot_warning_log.created_at',
                'ipms_iot_warning_log.category',
                'ipms_iot_warning_log.building_id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .limit(10)
            .offset(0)
            .orderBy('ipms_iot_warning_log.id', 'desc');

        const notice = await ctx.model
            .from('ipms_notice_to_user')
            .where('community_id', community_id)
            .andWhere('published', TRUE)
            .select('title', 'overview')
            .orderBy('id', 'desc')
            .first();

        ctx.body = {
            code: SUCCESS,
            data: {
                building_total,
                owner_total,
                car_total,
                pet_total,
                repair_total,
                complain_total,
                movecar_total,
                cpu: Math.round(os.loadavg()[0]),
                mem: Math.round((1 - os.freemem() / os.totalmem()) * 100),
                disk: Math.round((1 - diskInfo.free / diskInfo.size) * 100),
                log: {
                    entrance: entrance_log,
                    elevator: elevator_log,
                    lamp: lamp_log,
                    repeater: repeater_log,
                    park: park_log,
                    warning: warning_log
                },
                iot: {
                    center,
                    entrance,
                    elevator,
                    lamp,
                    repeater,
                    park,
                    warning
                },
                current: {
                    entrance_current_day_log,
                    elevator_current_day_log,
                    park_current_day_log
                },
                order: {
                    repair_current_day,
                    complain_current_day
                },
                warning_current,
                notice
            }
        };
    }
};

export default StatisticScreenAction;
