/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'movecar',
    meta: {
        title: '小区挪车',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'movecar',
        roles: [ROLES.XQNC]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '挪车请求',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XQNC]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '挪车详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.XQNC]
            },
            component: () => import('./detail')
        }
    ]
};
