/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <section>
        <SimpleHeader>
            <span slot="title">系统初始化信息</span>
        </SimpleHeader>
        <div class="container" v-if="!success">
            <UserInitProfile ref="profile" />

            <UserInitCommunity ref="community" />

            <div class="cw-form-actions">
                <Button type="primary" :loading="submiting" @click="submit">
                    立即初始化
                </Button>
            </div>
        </div>
        <div v-else class="container">
            <Result title="系统初始化成功">
                <div slot="extra">
                    <p>感谢您的支持和信赖。</p>
                    <p>系统已成功初始化，您可以开始使用了。</p>
                </div>

                <div slot="actions">
                    <Button @click="goLogin" type="success">立即登录</Button>
                </div>
            </Result>
        </div>
        <Copyright />
    </section>
</template>

<script>
import { Copyright, Result, SimpleHeader } from '@/components';
import { Button, Icon } from 'view-design';
import * as utils from '@/utils';
import UserInitProfile from './components/profile';
import UserInitCommunity from './components/community';

export default {
    name: 'UserInit',
    data() {
        return {
            submiting: false,
            success: false
        };
    },
    methods: {
        submit() {
            Promise.all([this.$refs.profile.validate(), this.$refs.community.validate()])
                .then(([profile, community]) => {
                    const data = {
                        ...profile,
                        ...community,
                        province: community.address[0],
                        city: community.address[1],
                        district: community.address[2]
                    };

                    delete data.address;

                    this.submiting = true;

                    utils.request
                        .post('/init/run', data)
                        .then(() => {
                            this.submiting = false;
                            this.success = true;
                        })
                        .catch(() => (this.submiting = false));
                })
                .catch(error => {
                    console.error('Validation failed:', error);
                    this.$Message.error('请检查配置信息是否完整');
                });
        },

        goLogin() {
            this.$router.replace('/user/login');
        }
    },
    components: {
        Button,
        Icon,
        Copyright,
        Result,
        SimpleHeader,
        UserInitProfile,
        UserInitCommunity
    }
};
</script>
