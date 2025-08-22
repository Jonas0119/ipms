/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { EjyyBuildingInfo, EjyyUserBuilding } from '~/types/model';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { NORMAL_STATUS, TRUE, BINDING_BUILDING } from '~/constant/status';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';

interface RequestBody {
    phone: string;
    community_id: number;
}

interface ModalAlias {
    user_building_id: number;
}

type Building = ModalAlias &
    Pick<EjyyUserBuilding, 'building_id' | 'authenticated' | 'authenticated_type'> &
    Pick<EjyyBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number'>;

const PcOptionOwerAction = <Action>{
    router: {
        path: '/option/owner',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'phone',
                required: true,
                regex: /^1\d{10}$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { phone, community_id } = <RequestBody>ctx.request.body;

        const ownerInfo = await ctx.model
            .from('ipms_wechat_mp_user')
            .where('phone', phone)
            .andWhere('intact', TRUE)
            .select('id', 'real_name', 'phone', 'avatar_url')
            .first();

        if (!ownerInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '未查询到业主信息'
            });
        }

        const result = <Building[]>await ctx.model
            .table('ipms_user_building')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
            .where('ipms_user_building.wechat_mp_user_id', ownerInfo.id)
            .andWhere('ipms_user_building.status', BINDING_BUILDING)
            .andWhere('ipms_building_info.community_id', community_id)
            .select(
                'ipms_user_building.id as user_building_id',
                'ipms_user_building.authenticated',
                'ipms_user_building.authenticated_type',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_building_info.id as building_id'
            )
            .orderBy('ipms_user_building.id', 'desc');

        if (result.length === 0) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '未查询到业主信息'
            });
        }

        const buildings = {
            houses: [],
            carports: [],
            warehouses: [],
            merchants: [],
            garages: []
        };

        result.forEach(record => {
            switch (record.type) {
                case HOUSE:
                    buildings.houses.push(record);
                    break;

                case CARPORT:
                    buildings.carports.push(record);
                    break;

                case WAREHOUSE:
                    buildings.warehouses.push(record);
                    break;

                case MERCHANT:
                    buildings.merchants.push(record);
                    break;

                case GARAGE:
                    buildings.garages.push(record);
                    break;
            }
        });

        ownerInfo.phone = utils.phone.hide(ownerInfo.phone);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...ownerInfo,
                ...buildings
            }
        };
    }
};

export default PcOptionOwerAction;
