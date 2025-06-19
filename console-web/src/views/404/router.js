/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: '/*',
    meta: {
        authRequired: true,
        title: '页面不存在',
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./')
};
