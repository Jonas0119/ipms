/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Knex from 'knex';
import * as redisService from './redis';
import * as ROLE from '~/constant/role_access';

/**
 * 发送维修工单通知到物业公司
 * @param model Knex数据库实例
 * @param id 维修工单ID
 * @param urge 是否为催促通知，默认false
 */
async function send(model: Knex, id: number, urge = false) {
    // 通过维修工单ID查询对应的社区ID
    // 使用左连接从社区信息表和维修工单表获取社区ID
    const { community_id } = await model
        .from('ipms_community_info')
        .leftJoin('ipms_repair', 'ipms_repair.community_id', 'ipms_community_info.id')
        .where('ipms_repair.id', id)
        .select('ipms_community_info.id as community_id')
        .first();

    // 通过Redis发布订阅机制向物业公司推送WebSocket通知
    // 包含工单ID、角色类型(维修工单)、是否催促、社区ID等信息
    redisService.pubish(redisService.WS_NOTICE_TO_PROPERTY_COMPANY, {
        id,                    // 维修工单ID
        type: ROLE.WXWF,      // 角色类型：维修工单
        urge,                 // 是否为催促通知
        community_id          // 社区ID，用于定位具体社区
    });
}

export async function noticePropertyCompany(model: Knex, id: number) {
    send(model, id);
}

// 用户催促工单
export function userUrge(model: Knex, id: number) {
    send(model, id, true);
}
