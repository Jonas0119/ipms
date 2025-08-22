/**
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2025 IPMS
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Author: support@ipms.local
 * +----------------------------------------------------------------------
 */

import { EjyyBuildingInfo } from '~/types/model';
import { HOUSE, WAREHOUSE, CARPORT, MERCHANT, GARAGE } from '~/constant/building';

export function name(
    detail: Pick<EjyyBuildingInfo, 'type' | 'area' | 'building' | 'unit' | 'number' | 'construction_area'>,
    type = false
) {
    let typeName = '';

    switch (detail.type) {
        case HOUSE:
            typeName = '住宅';
            break;

        case CARPORT:
            typeName = '车位';
            break;

        case WAREHOUSE:
            typeName = '仓房';
            break;

        case MERCHANT:
            typeName = '商户';
            break;

        case GARAGE:
            typeName = '车库';
            break;
    }

    return (
        (detail.area ? detail.area : '') +
        ' ' +
        (detail.building ? detail.building : '') +
        (detail.unit ? detail.unit : '') +
        detail.number +
        (type ? '（' + typeName + '）' : '')
    );
}
