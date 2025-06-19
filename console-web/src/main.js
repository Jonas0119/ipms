/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Vue from 'vue';
import App from '@/views/app';
import VueLazyload from 'vue-lazyload';
import VueDND from 'awe-dnd';
import moment from 'moment';
import router from '@/router';
import store from '@/store';
import * as utils from '@/utils';
import '@/styles/theme.less';

Vue.config.productionTip = false;

moment.updateLocale('en', {
    invalidDate: '未知日期'
});

Vue.filter('mom_format', (mom, withTime = true) => {
    if (!withTime) {
        return moment(mom).format('YYYY-MM-DD');
    }

    return moment(mom).format('YYYY-MM-DD HH:mm:ss');
});

Vue.filter('file_format', size => {
    return utils.file.size(size);
});

Vue.filter('building', (obj, withType = true) => {
    return utils.building.text(obj, withType);
});

Vue.filter('yuan', num => {
    return utils.payment.yuan(num);
});

Vue.use(VueLazyload, {
    preLoad: 1.3,
    loading: require('@/assets/loading.svg'),
    attempt: 1
});

Vue.use(VueDND);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
