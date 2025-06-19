/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <section>
        <Header back>
            <span slot="description">
                公司整体设置，请谨慎操作，如有疑问请发信至 咨询。
            </span>
        </Header>

        <CommunityEditor :onSubmit="submit" />
    </section>
</template>

<script>
/** */

import { Header } from '@/components';
import { Message } from 'view-design';
import CommunityEditor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'SettingCommunityCreate',
    methods: {
        submit(data) {
            return new Promise((resolve, reject) => {
                utils.request
                    .post('/community_manage/create', data)
                    .then(res => {
                        Message.success('添加小区成功');
                        this.$router.push(`/setting/community/detail/${res.data.id}`);
                        resolve();
                    })
                    .catch(() => reject());
            });
        }
    },
    components: {
        Header,
        CommunityEditor
    }
};
</script>
