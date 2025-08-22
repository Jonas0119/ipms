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

const PcContractDetailAction = <Action>{
    router: {
        path: '/contract/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_contract')
            .leftJoin('ipms_contract_category', 'ipms_contract_category.id', 'ipms_contract.category_id')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_contract.created_by')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_contract.second_party_wechat_mp_user_id')
            .where('ipms_contract.id', id)
            .andWhere('ipms_contract.community_id', community_id)
            .select(
                'ipms_contract.id',
                'ipms_contract.title',
                'ipms_contract.category_id',
                'ipms_contract.first_party',
                'ipms_contract.first_party_linkman',
                'ipms_contract.first_party_phone',
                'ipms_contract.second_party',
                'ipms_contract.second_party_linkman',
                'ipms_contract.second_party_phone',
                'ipms_contract.begin_time',
                'ipms_contract.finish_time',
                'ipms_contract.contract_fee',
                'ipms_contract.created_at',
                'ipms_contract_category.name as category',
                'ipms_property_company_user.id as created_user_id',
                'ipms_property_company_user.real_name as created_user_real_name',
                'ipms_wechat_mp_user.id as second_party_user_id',
                'ipms_wechat_mp_user.real_name as second_party_user_real_name',
                'ipms_wechat_mp_user.phone as owner_phone'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取合同信息'
            });
        }

        const items = await ctx.model
            .from('ipms_contract_item')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_contract_item.building_id')
            .where('contract_id', id)
            .select(
                'ipms_contract_item.id',
                'ipms_contract_item.title',
                'ipms_contract_item.descritpion',
                'ipms_contract_item.building_id',
                'ipms_contract_item.attachment_url',
                'ipms_contract_item.attachment_name',
                'ipms_contract_item.fee',
                'ipms_contract_item.created_at',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                items
            }
        };
    }
};

export default PcContractDetailAction;
