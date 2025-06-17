# 修复总结

## 修复的问题

### 1. 上传组件 404 错误修复

**问题描述**：
在上传小区图片时，网络请求会有一个 `http://localhost:8080/ 404` 的错误。

**根本原因**：
iView 的 `Upload` 组件的 `action` 属性被设置为 `"/"`，导致组件在某些情况下会向前端开发服务器的根路径发送请求，从而产生 404 错误。

**修复方案**：
将所有上传组件的 `action` 属性从 `"/"` 改为 `"#"`，避免向无效地址发送请求。

**修复的文件**：
- `console-web/src/components/image-upload/index.vue`
- `console-web/src/components/multiple-image-upload/index.vue`
- `console-web/src/views/basic/building/import.vue`

### 2. 建筑导入模板下载功能实现

**问题描述**：
`building/import` 页面中的模板文件下载功能缺失，无法正常下载导入模板。

**解决方案**：
1. **后端**：创建了新的模板下载接口 `/building/template`
2. **前端**：实现了基于统一存储方法的模板下载功能

**新增/修改的文件**：

#### 后端
- **新增**：`api-server/src/module/pc/controller/building/template.ts`
  - 创建模板下载接口
  - 支持文件流下载
  - 设置正确的响应头
- **修改**：`api-server/src/module/pc/router.ts`
  - 添加模板下载路由导出

#### 前端
- **修改**：`console-web/src/views/basic/building/import.vue`
  - 修复 Upload 组件的 action 属性
  - 实现 `downloadTemplate` 方法
  - 使用 Blob 和 URL.createObjectURL 实现文件下载

## 技术实现细节

### 后端模板下载接口

```typescript
const PcBuildingTemplateAction = <Action>{
    router: {
        path: '/building/template',
        method: 'get',
        authRequired: true,
        roles: [ROLE.FCDA]
    },
    response: async ctx => {
        const templatePath = path.join(__dirname, '../../../../../uploads/template/固定资产导入模板.xlsx');
        
        if (!fs.existsSync(templatePath)) {
            ctx.status = 404;
            ctx.body = { code: 404, message: '模板文件不存在' };
            return;
        }

        ctx.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="固定资产导入模板.xlsx"'
        });

        ctx.body = fs.createReadStream(templatePath) as any;
    }
};
```

### 前端下载实现

```javascript
async downloadTemplate() {
    try {
        const response = await utils.request({
            url: '/building/template',
            method: 'get',
            responseType: 'blob'
        });

        const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '固定资产导入模板.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        Message.error('模板下载失败: ' + (error.message || '未知错误'));
    }
}
```

## 验证结果

- ✅ 前端代码通过 lint 检查
- ✅ 后端代码通过 lint 检查
- ✅ 上传组件不再产生 404 错误
- ✅ 模板下载功能正常工作
- ✅ 统一存储方法得到正确应用

## 注意事项

1. 模板文件位于 `api-server/uploads/template/固定资产导入模板.xlsx`
2. 下载接口需要用户认证和 FCDA 角色权限
3. 前端使用 Blob API 实现文件下载，兼容现代浏览器
4. 所有上传组件现在都使用统一的上传服务，确保存储配置的一致性 