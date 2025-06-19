/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <section>
        <Header>
            <span slot="description">
                微信公众号模板消息内设置，此处仅供展示。
            </span>
        </Header>

        <Card dis-hover :bordered="false">
            <Table stripe :columns="columns" :data="list" />
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </section>
</template>

<script>
import { Header } from '@/components';
import { Card, Spin, Table } from 'view-design';
import * as utils from '@/utils';

export default {
    name: 'SettingTpl',
    data() {
        return {
            fetching: true,
            list: [],
            columns: [
                {
                    title: '模板标题',
                    minWidth: 140,
                    key: 'title'
                },
                {
                    title: '模板id',
                    key: 'template_id',
                    minWidth: 120
                },
                {
                    title: '模板示例',
                    minWidth: 320,
                    key: 'content'
                }
            ]
        };
    },
    mounted() {
        this.getListData();
    },
    methods: {
        getListData() {
            this.fetching = true;

            utils.request
                .get('/oa/tpl')
                .then(res => {
                    this.fetching = false;
                    this.list = res.data.list;
                })
                .catch(() => (this.fetching = false));
        }
    },
    components: {
        Header,
        Card,
        Spin,
        Table
    }
};
</script>
