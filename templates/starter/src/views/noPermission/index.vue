<template>
    <div class="contentBox">
        <div class="content">
            <div class="">
                <div class="text">系统建设中</div>
                <div v-if="isZzd && zzdContacts" class="bullshit__info">
                    <div class="flex">
                        <div class="left">应用归属单位：</div>{{ zzdContacts.unit }}
                    </div>
                    <div class="flex">
                        <div class="left">应用管理员：</div>{{ zzdContacts.name }}
                    </div>
                    <div class="flex">
                        <div class="left">联系方式：</div>{{ zzdContacts.phone }}
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { useUserStore } from "@/store/modules/user";


const isZzd = useUserStore().isZzd
const zzdContacts = useUserStore().zzdContacts

onMounted(() => {
    
})
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

.bullshit__info {
    color: #999999;
    font-size: 14px;

    .left {
        width: 100px;
    }
}
</style>