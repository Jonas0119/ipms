/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Knex from 'knex';
import { HOUSE, CARPORT, WAREHOUSE, MERCHANT, GARAGE } from '~/constant/building';
import { IpmsCommunitySetting, IpmsBuildingInfo, IpmsUserBuilding, IpmsCommunityInfo } from '~/types/model';
import { BINDING_BUILDING } from '~/constant/status';

// 模型别名接口，用于数据库查询结果
interface ModalAlias {
    user_building_id: number;
}

// 建筑物信息类型定义
type Building = ModalAlias &
    Pick<IpmsUserBuilding, 'building_id' | 'authenticated' | 'authenticated_type'> &
    Pick<IpmsBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number'>;

// 社区信息类型定义，包含不同类型的建筑物列表
type Community = Pick<IpmsCommunityInfo, 'name' | 'banner' | 'phone' | 'province' | 'city' | 'district'> &
    Pick<IpmsCommunitySetting, 'access_nfc' | 'access_qrcode' | 'access_remote' | 'fitment_pledge'> &
    Pick<IpmsBuildingInfo, 'community_id'> & {
        houses: Building[];      // 住宅
        carports: Building[];    // 车位
        warehouses: Building[];  // 仓库
        merchants: Building[];   // 商铺
        garages: Building[];     // 车库
    };

// 数据库查询记录类型定义
type Record = ModalAlias &
    Pick<IpmsCommunityInfo, 'name' | 'banner' | 'phone' | 'province' | 'city' | 'district'> &
    Pick<IpmsUserBuilding, 'building_id' | 'authenticated' | 'authenticated_type'> &
    Pick<IpmsBuildingInfo, 'community_id' | 'type' | 'area' | 'building' | 'unit' | 'number'> &
    Pick<IpmsCommunitySetting, 'access_nfc' | 'access_qrcode' | 'access_remote' | 'fitment_pledge'>;

// 社区映射接口，用于按社区ID分组
interface ComunityMap {
    [key: number]: Community;
}

// 社区信息返回接口
interface CommunitiesInfo {
    list: Community[];    // 用户关联的所有社区列表
    current: Community;   // 当前默认社区
}

/**
 * 获取用户关联的社区信息服务
 * 涉及两个问题：关联的家庭用户操作
 * @param model Knex数据库实例
 * @param wehcatMpUserId 微信小程序用户ID
 * @returns Promise<CommunitiesInfo> 返回用户的社区信息
 */
async function communityService(model: Knex, wehcatMpUserId: number): Promise<CommunitiesInfo> {
    console.log(`[communityService] 开始获取用户社区信息, userId: ${wehcatMpUserId}`);
    
    // 查询用户关联的所有建筑物信息，包括社区信息和设置
    const result: Record[] = await model
        .table('ipms_user_building')
        .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_user_building.building_id')
        .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_building_info.community_id')
        .leftJoin('ipms_community_setting', 'ipms_community_setting.community_id', 'ipms_building_info.community_id')
        .where('ipms_user_building.wechat_mp_user_id', wehcatMpUserId)
        .andWhere('ipms_user_building.status', BINDING_BUILDING)
        .select(
            'ipms_user_building.id as user_building_id',
            'ipms_user_building.authenticated',
            'ipms_user_building.authenticated_type',
            'ipms_building_info.id as building_id',
            'ipms_building_info.community_id',
            'ipms_building_info.type',
            'ipms_building_info.area',
            'ipms_building_info.building',
            'ipms_building_info.unit',
            'ipms_building_info.number',
            'ipms_community_info.name',
            'ipms_community_info.banner',
            'ipms_community_info.phone',
            'ipms_community_info.province',
            'ipms_community_info.city',
            'ipms_community_info.district',
            'ipms_community_setting.access_nfc',
            'ipms_community_setting.access_qrcode',
            'ipms_community_setting.access_remote',
            'ipms_community_setting.fitment_pledge'
        )
        .orderBy('ipms_community_info.id', 'desc');

    console.log(`[communityService] 查询到 ${result.length} 条建筑物记录`);

    // 按社区ID分组建筑物信息
    const map: ComunityMap = {};

    result.forEach(record => {
        // 如果社区不存在于映射中，创建新的社区对象
        if (!(record.community_id in map)) {
            console.log(`[communityService] 创建社区映射, communityId: ${record.community_id}, name: ${record.name}`);
            map[record.community_id] = {
                community_id: record.community_id,
                name: record.name,
                banner: record.banner,
                phone: record.phone,
                province: record.province,
                city: record.city,
                district: record.district,
                houses: [],
                carports: [],
                warehouses: [],
                merchants: [],
                garages: [],
                access_nfc: record.access_nfc,
                access_qrcode: record.access_qrcode,
                access_remote: record.access_remote,
                fitment_pledge: record.fitment_pledge
            };
        }

        // 构建建筑物对象
        const building: Building = {
            building_id: record.building_id,
            type: record.type,
            area: record.area,
            building: record.building,
            unit: record.unit,
            number: record.number,
            user_building_id: record.user_building_id,
            authenticated: record.authenticated,
            authenticated_type: record.authenticated_type
        };

        // 根据建筑物类型分类存储
        switch (building.type) {
            case HOUSE:
                map[record.community_id].houses.push(building);
                console.log(`[communityService] 添加住宅, communityId: ${record.community_id}, buildingId: ${building.building_id}`);
                break;

            case CARPORT:
                map[record.community_id].carports.push(building);
                console.log(`[communityService] 添加车位, communityId: ${record.community_id}, buildingId: ${building.building_id}`);
                break;

            case WAREHOUSE:
                map[record.community_id].warehouses.push(building);
                console.log(`[communityService] 添加仓库, communityId: ${record.community_id}, buildingId: ${building.building_id}`);
                break;

            case MERCHANT:
                map[record.community_id].merchants.push(building);
                console.log(`[communityService] 添加商铺, communityId: ${record.community_id}, buildingId: ${building.building_id}`);
                break;

            case GARAGE:
                map[record.community_id].garages.push(building);
                console.log(`[communityService] 添加车库, communityId: ${record.community_id}, buildingId: ${building.building_id}`);
                break;

            default:
                console.warn(`[communityService] 未知建筑物类型: ${building.type}, buildingId: ${building.building_id}`);
                break;
        }
    });

    // 将映射转换为数组
    const list = [];
    for (let id in map) {
        list.push(map[id]);
    }
    list.reverse(); // 反转数组，使最新的社区排在前面

    console.log(`[communityService] 用户关联的社区数量: ${list.length}`);

    // 查询用户的默认社区设置
    const mainCommunityInfo = await model
        .table('ipms_user_default_community')
        .where({ wechat_mp_user_id: wehcatMpUserId })
        .select('community_id')
        .first();

    console.log(`[communityService] 查询到默认社区设置:`, mainCommunityInfo);

    let default_community_id = null;

    // 验证默认社区是否仍然有效（用户仍然关联该社区）
    // 一定要注意删除社区时候判断默认社区 否则此处逻辑不满足
    if (
        mainCommunityInfo &&
        mainCommunityInfo.community_id &&
        list.some(item => item.community_id === mainCommunityInfo.community_id)
    ) {
        default_community_id = mainCommunityInfo.community_id;
        console.log(`[communityService] 使用已存在的默认社区: ${default_community_id}`);
    } else {
        // 如果没有有效的默认社区设置，使用第一个社区作为默认
        if (list.length > 0) {
            default_community_id = list[0].community_id;
            console.log(`[communityService] 设置新的默认社区: ${default_community_id}`);

            if (!mainCommunityInfo) {
                // 创建新的默认社区记录
                await model.table('ipms_user_default_community').insert({
                    wechat_mp_user_id: wehcatMpUserId,
                    community_id: default_community_id
                });
                console.log(`[communityService] 创建默认社区记录`);
            } else {
                // 更新现有的默认社区记录
                await model
                    .table('ipms_user_default_community')
                    .update({ community_id: default_community_id })
                    .where({ wechat_mp_user_id: wehcatMpUserId });
                console.log(`[communityService] 更新默认社区记录`);
            }
        } else {
            console.log(`[communityService] 用户没有关联任何社区`);
        }
    }

    // 查找当前默认社区对象
    let current = null;
    if (default_community_id) {
        const currentIndex = list.findIndex(({ community_id }) => community_id === default_community_id);
        if (currentIndex !== -1) {
            current = list[currentIndex];
            console.log(`[communityService] 找到当前默认社区: ${current.name} (ID: ${current.community_id})`);
        } else {
            console.warn(`[communityService] 无法找到默认社区对象, communityId: ${default_community_id}`);
        }
    }

    const result_info = {
        list,
        current
    };

    console.log(`[communityService] 服务完成, 返回社区列表长度: ${result_info.list.length}, 当前社区: ${result_info.current?.name || 'null'}`);

    return result_info;
}

export default communityService;
