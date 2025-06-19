/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <header class="simple-header">
        <div class="container">
            <img src="../../assets/logo.svg" alt="logo" class="img-logo" />
            <img src="../../assets/logo_txt.svg" alt="logo" class="text-logo" />

            <h2 class="title" v-if="$slots.title">
                <slot name="title" />
            </h2>
        </div>
    </header>
</template>

<script>
export default {
    name: 'SimpleHeader'
};
</script>

<style lang="less">
.simple-header {
    background: #fff;
    height: 62px;
    margin-bottom: 26px;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.15);

    .img-logo {
        width: 42px;
    }

    .text-logo {
        height: 20px;
        margin-left: 12px;
    }

    .title {
        font-size: 16px;
        color: #434343;
        font-weight: 500;
        margin-left: 12px;
    }

    .container {
        display: flex;
        align-items: center;
        height: 100%;
    }
}
</style>
