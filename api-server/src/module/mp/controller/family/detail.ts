/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { BINDING_BUILDING } from '~/constant/status';
import { HOUSE, CARPORT, WAREHOUSE } from '~/constant/building';
import {
    AUTHENTICTED_BY_SELF,
    AUTHENTICTED_BY_PROPERTY_COMPANY,
    AUTHENTICTED_BY_FAMILY
} from '~/constant/authenticated_type';

interface RequestParams {
    id: number;
}

interface Record {
    id: number;
    building_id: number;
    type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE;
    authenticated: 0 | 1;
    authenticated_type:
        | typeof AUTHENTICTED_BY_SELF
        | typeof AUTHENTICTED_BY_PROPERTY_COMPANY
        | typeof AUTHENTICTED_BY_FAMILY;
    authenticated_user_id: number;
    area: string;
    building: string;
    unit: string;
    number: string;
    community_id: number;
    name: string;
    province: string;
    city: string;
    district: string;
}

interface Community {
    community_id: number;
    name: string;
    province: string;
    city: string;
    district: string;
    houses: Building[];
    carports: Building[];
    warehouses: Building[];
}

interface CommunityMap {
    [community_id: number]: Community;
}

interface Building {
    id: number;
    building_id: number;
    type: typeof HOUSE | typeof CARPORT | typeof WAREHOUSE;
    authenticated: 0 | 1;
    authenticated_type:
        | typeof AUTHENTICTED_BY_SELF
        | typeof AUTHENTICTED_BY_PROPERTY_COMPANY
        | typeof AUTHENTICTED_BY_FAMILY;
    authenticated_user_id: number;
    area: string;
    building: string;
    unit: string;
    number: string;
}

const MpFamilyDetailAction = <Action>{
    router: {
        path: '/family/detail/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const userInfo = await ctx.model
            .from('ipms_wechat_mp_user')
            .where('id', id)
            .select('id', 'nick_name', 'avatar_url', 'signature')
            .first();

        const records = <Record[]>await ctx.model
            .from('ipms_user_building')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_building_info.community_id')
            .whereIn('ipms_user_building.building_id', function() {
                this.from('ipms_user_building')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .where('status', BINDING_BUILDING)
                    .select('building_id');
            })
            .where('ipms_user_building.wechat_mp_user_id', id)
            .andWhere('status', BINDING_BUILDING)
            .select(
                'ipms_user_building.id',
                'ipms_user_building.authenticated',
                'ipms_user_building.authenticated_type',
                'ipms_user_building.authenticated_user_id',
                'ipms_user_building.building_id',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.community_id',
                'ipms_community_info.name',
                'ipms_community_info.province',
                'ipms_community_info.city',
                'ipms_community_info.district'
            )
            .orderBy('ipms_user_building.id', 'desc');

        if (records.length === 0) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        const baseMap = <CommunityMap>{};

        records.forEach(record => {
            if (!(record.community_id in baseMap)) {
                baseMap[record.community_id] = {
                    community_id: record.community_id,
                    name: record.name,
                    province: record.province,
                    city: record.city,
                    district: record.district,
                    houses: [],
                    carports: [],
                    warehouses: []
                };
            }

            let cg = <'houses' | 'carports' | 'warehouses'>null;
            if (record.type === HOUSE) {
                cg = 'houses';
            } else if (record.type === CARPORT) {
                cg = 'carports';
            } else if (record.type === WAREHOUSE) {
                cg = 'warehouses';
            }

            if (!cg) {
                return;
            }

            baseMap[record.community_id][cg].push({
                id: record.id,
                building_id: record.building_id,
                authenticated: record.authenticated,
                authenticated_type: record.authenticated_type,
                authenticated_user_id: record.authenticated_user_id,
                type: record.type,
                area: record.area,
                building: record.building,
                unit: record.unit,
                number: record.number
            });
        });

        const list = <Community[]>[];

        for (let community_id in baseMap) {
            list.push(baseMap[community_id]);
        }

        list.reverse();

        ctx.body = {
            code: SUCCESS,
            data: {
                userInfo,
                list
            }
        };
    }
};

export default MpFamilyDetailAction;
