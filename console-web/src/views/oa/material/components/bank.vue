/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <Row class="detail-row">
        <Col :lg="8" :sm="12" :xs="12">
            <span class="detail-label">开户行名称</span>
            <div class="detail-content">{{ row.bank_name ? row.bank_name : '-' }}</div>
        </Col>
        <Col :lg="8" :sm="12" :xs="12">
            <span class="detail-label">银行账号</span>
            <div class="detail-content">{{ row.bank_id ? row.bank_id : '-' }}</div>
        </Col>
        <Col :lg="8" :sm="12" :xs="12">
            <span class="detail-label">开户行地址</span>
            <div class="detail-content">{{ row.bank_address ? row.bank_address : '-' }}</div>
        </Col>
    </Row>
</template>

<script>
import { Row, Col } from 'view-design';

export default {
    name: 'OaSupplierBank',
    props: {
        row: Object
    },
    components: {
        Row,
        Col
    }
};
</script>
