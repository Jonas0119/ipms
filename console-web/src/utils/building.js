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

export function text(detail, type = true) {
    let typeName = '';

    switch (detail.type) {
        case 1:
            typeName = '住宅';
            break;

        case 2:
            typeName = '车位';
            break;

        case 3:
            typeName = '仓房';
            break;

        case 4:
            typeName = '商户';
            break;

        case 5:
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
