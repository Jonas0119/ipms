/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <section>
        <Header />

        <Alert show-icon v-if="msg" type="error">
            {{ msg }}
        </Alert>

        <Editor :onSubmit="submit" />
    </section>
</template>

<script>
import { Message, Alert } from 'view-design';
import { Header } from '@/components';
import Editor from './components/editor';
import * as utils from '@/utils';

export default {
    name: 'OaHrJoin',
    components: {
        Header,
        Editor,
        Message,
        Alert
    },
    data() {
        return {
            msg: null
        };
    },
    methods: {
        submit(data) {
            return new Promise((resolve, reject) => {
                const { code, state } = this.$route.query;

                data.code = code;
                data.state = state;

                utils.request
                    .post('/hr/create', data)
                    .then(res => {
                        Message.success('人事信息创建成功');
                        this.$router.push(`/oa/hr/detail/${res.data.id}`);
                        resolve();
                    })
                    .catch(res => {
                        this.msg = res.message;
                        reject();
                    });
            });
        }
    }
};
</script>
