/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: '/oa',
    meta: {
        title: '协同办公',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'oa',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        require('./dashboard/router'),
        require('./party/router'),
        require('./inform/router'),
        require('./mission/router'),
        require('./order/router'),
        require('./meeting/router'),
        require('./finance/router'),
        require('./leave/router'),
        require('./refound/router'),
        require('./material/router'),
        require('./contract/router'),
        require('./hr/router')
    ]
};
