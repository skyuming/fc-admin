<template>
    <el-table :data="data" :border="border" :showSummary="showSummary" :stripe="stripe" :table-layout="tableLayout"
        @selection-change="getSelection" :tooltip-effect="tooltipEffect">
        <template v-for="(item, index) in columData" :key="index">
            <el-table-column type="index" v-if="item.type == 'index'" :fixed="item.fixed" :width="item.width"
                :min-width="item.minWidth" :align="item.align ? item.align : 'center'"></el-table-column>
            <el-table-column type="selection" v-else-if="item.type == 'selection'" :fixed="item.fixed" :width="item.width"
                :min-width="item.minWidth" :align="item.align ? item.align : 'center'"></el-table-column>
            <el-table-column v-else :prop="item.prop" :label="item.lable" :fixed="item.fixed" :width="item.width"
                :min-width="item.minWidth" :align="item.align ? item.align : 'center'"
                :show-overflow-tooltip="item.showOverflowTooltip" :formatter="item.formatter">
                <template v-if="item.slot" v-slot:default="scope">
                    <slot :name="item.slot" :row="scope.row"></slot>
                </template>
            </el-table-column>
        </template>
    </el-table>
    <div class="table-pagination">
        <el-pagination :current-page="index" v-model:page-size="sizeModel" :disabled="disabledPage"
            :background="paginationBackground" :layout="paginationLayout" :total="total"
            @current-change="handleCurrentChange" :page-sizes="pageSize" @size-change="handleSizeChange" />

    </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { ref, reactive, defineProps, defineEmits } from "vue";
import type { tableItemType } from "@/components/myTable/tableItem";

const emits = defineEmits(["getSelection", 'handleCurrentChange', 'update:size', 'sizeChange'])
const props = defineProps({
    data: {
        type: Array as PropType<any[]>,
        required: true
    },
    columData: {
        type: Array as PropType<tableItemType[]>,
        required: true
    },
    tooltipEffect: {
        type: String as PropType<'dark' | 'light'>,
        default: 'light'
    },
    tableLayout: {
        type: String as PropType<'auto' | 'fixed'>,
        default: 'auto'
    },
    stripe: {
        type: Boolean,
        default: false
    },
    showSummary: {
        type: Boolean,
        default: false
    },
    border: {
        type: Boolean,
        default: true
    },
    pageSize: {
        type: Array as PropType<number[]>,
        default: [10, 20, 30, 50]
    },
    total: {
        type: Number
    },
    paginationLayout: {
        type: String,
        default: 'total,sizes, prev, pager, next, jumper'
    },
    paginationBackground: {
        type: Boolean,
        default: true
    },
    disabledPage: {
        type: Boolean,
        default: false
    },
    size: {
        type: Number,
        default: 20
    },
    index: {
        type: Number,
        default: 0
    }
})
const sizeModel = useVModel(props, 'size', emits);



const getSelection = (e: any[]) => {
    emits('getSelection', e)
}
const handleCurrentChange = (e: any) => {
    emits('handleCurrentChange', e)
}

const handleSizeChange = (e: number) => {
    emits("sizeChange", e)
}

</script>

<style lang="scss" scoped>
.table-pagination {
    display: flex;
    justify-content: flex-start;
    margin-top: 10px;
}
</style>