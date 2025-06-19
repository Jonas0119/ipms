/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: '',
    meta: {
        title: '物联拓扑',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'dashboard',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index')
};
