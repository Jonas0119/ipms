/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: '/basic',
    meta: {
        title: '物业服务',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'service',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        require('./dashboard/router'),
        // removed obsolete module
        require('./notice/router'),
        require('./pet/router'),
        require('./fitment/router'),
        require('./repair/router'),
        require('./complain/router'),
        require('./car/router'),
        require('./movecar/router'),
        require('./vistor/router'),
        require('./questionnaire/router'),
        require('./topic/router'),
        require('./building/router'),
        require('./owner/router')
    ]
};
