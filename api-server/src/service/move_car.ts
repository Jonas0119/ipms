/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Knex from 'knex';
import * as redisService from './redis';
import * as ROLE from '~/constant/role_access';

export async function noticePropertyCompany(model: Knex, id: number) {
    const { community_id } = await model
        .from('ipms_community_info')
        .leftJoin('ipms_move_car', 'ipms_move_car.community_id', 'ipms_community_info.id')
        .where('ipms_move_car.id', id)
        .select('ipms_community_info.id as community_id')
        .first();

    redisService.pubish(redisService.WS_NOTICE_TO_PROPERTY_COMPANY, {
        id,
        type: ROLE.XQNC,
        urge: false,
        community_id
    });
}
