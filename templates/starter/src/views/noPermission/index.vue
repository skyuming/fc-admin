<template>
    <div class="contentBox">
        <div class="content">
            <div class="">
                <div class="text">系统建设中</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.contentBox {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .content {
        width: 450px;
        background: url('../../assets/images/noPermission.png') no-repeat;
        background-size: 100% 100%;
        display: flex;
        align-items: end;
        justify-content: center;
        height: 450px;

        .text {
            text-align: center;
            font-weight: 500;
            font-size: 18px;
            color: #999999;
            margin-bottom: 20px;
            user-select: none;
        }
    }
}
</style>
