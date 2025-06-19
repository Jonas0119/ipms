/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'complain',
    meta: {
        title: '投诉建议',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'report',
        roles: [ROLES.TSJY]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部工单',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.TSJY]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '创建工单',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.TSJY]
            },
            component: () => import('./create')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '工单详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.TSJY]
            },
            component: () => import('./detail')
        }
    ]
};
