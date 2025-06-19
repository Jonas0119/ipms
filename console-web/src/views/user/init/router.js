/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'init',
    meta: {
        title: '系统初始化',
        authRequired: false,
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index')
};
