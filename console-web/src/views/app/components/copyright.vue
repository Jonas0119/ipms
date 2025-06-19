/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <div class="copyright">
        <!-- Copyright content -->
    </div>
</template>

<script>
/** */

export default {
    name: 'Copyright'
};
</script>

<style lang="less">
.copyright {
    padding: 28px 0 24px 0;
    font-size: 12px;
    color: #808695;
    text-align: center;
    line-height: 1.6;

    a {
        color: #808695;

        + a {
            margin-left: 14px;
        }
    }
}

@media screen and (max-width: 576px) {
    .copyright {
        display: flex;
        flex-direction: column;

        a {
            margin-left: 0 !important;
        }
    }
}
</style>
