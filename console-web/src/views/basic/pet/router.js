/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'pet',
    meta: {
        title: '宠物档案',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'pet',
        roles: [ROLES.CWDA]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部档案',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CWDA]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '宠物详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.CWDA]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '创建档案',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.CWDA]
            },
            component: () => import('./create')
        }
    ]
};
