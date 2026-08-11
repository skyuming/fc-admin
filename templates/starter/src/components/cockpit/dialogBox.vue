<template>
  <div>
    <el-dialog :width="width" :model-value="dialogVisible" :close-on-click-modal="false" destroy-on-close>
      <div v-if="dialogType == 0" class="dialogTops">
        <img class="closeDialog" src="@/assets/images/cockpit_images/closeDialog.png" alt="" @click="closeDialog" />
        <div class="top-con">
          <div class="left">
            <div class="dialogTitle">{{ title }}</div>
            <div class="dialogTitle-right"></div>
          </div>
          <div class="right"></div>
        </div>
      </div>
      <div v-else class="dialogTops2">
        <img class="closeDialog" src="@/assets/images/cockpit_images/closeDialog.png" alt="" @click="closeDialog" />
        <div class="top-con2">
          <div class="middle"></div>
        </div>
      </div>
      <div class="dialog-content-box">
        <slot name="container"></slot>
      </div>
      <div class="dialog-bottom">
        <div class="line"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// export default {
const emits = defineEmits(['update:dialogVisible'],['close'])

const props = defineProps({
  width: {
    type: String,
    default: "735px",
  },
  title: String,
  dialogVisible: Boolean,

  // 弹窗类型：0是通用 1是
  dialogType: {
    type: Number,
    default: 0,
  },

})

const closeDialog = () => {
  emits('close')
}

// };
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  // background: url('@/assets/images/cockpit_images/dialogBg.png') no-repeat;
  // background-size: 100% 100%;
  background: none;
  box-shadow: none;
  // padding-bottom: 20px;
  // padding-top: 30px;
  margin-top: 0 !important;
  top: 50% !important;
  transform: translateY(-50%);

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0;
  }

  .dialogTops {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      z-index: 0;
      width: 10px;
      height: 34px;
      background: url(@/assets/images/cockpit_images/pop_top01.png) no-repeat 0 0;
    }

    &::after {
      content: "";
      position: absolute;
      right: 0;
      top: 0;
      z-index: 0;
      width: 10px;
      height: 34px;
      background: url(@/assets/images/cockpit_images/pop_top05.png) no-repeat 0 0;
    }

    .top-con {
      display: flex;
      width: calc(100% - 20px);
      height: 34px;
      margin: 0 auto;

      .left {
        display: flex;
        height: 34px;

        .dialogTitle-right {
          width: 48px;
          height: 34px;
          background: url(@/assets/images/cockpit_images/pop_top03.png) no-repeat 0 0;
        }

        .dialogTitle {
          padding: 10px 30px 0 15px;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          background: url(@/assets/images/cockpit_images/pop_top02.png) repeat-x 0 0;
        }
      }

      .right {
        flex: 1;
        background: url(@/assets/images/cockpit_images/pop_top04.png) repeat-x 0 0;
      }
    }

    .closeDialog {
      width: 23px;
      height: 23px;
      position: absolute;
      right: 1px;
      top: 10px;
      z-index: 1;
      cursor: pointer;
    }
  }

  .dialogTops2 {
    position: relative;

    .top-con2 {
      display: flex;
      width: calc(100% - 20px);
      height: 10px;
      margin: 0 auto;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: -1px;
        z-index: 0;
        width: 10px;
        height: 35px;
        background: url(@/assets/images/cockpit_images/pop_top_left.png) no-repeat 0 0;
      }

      .middle {
        flex: 1;
        background: url(@/assets/images/cockpit_images/pop_top_middle.png) repeat-x 0 0;
      }

      &::after {
        content: "";
        position: absolute;
        right: 0px;
        top: 1px;
        z-index: 0;
        width: 10px;
        height: 35px;
        background: url(@/assets/images/cockpit_images/pop_top_right.png) no-repeat 0 0;
      }
    }

    // background: url(@/assets/images/cockpit_images/dialog_top_border.png) no-repeat 0 0;
    // background-size:100% 100%;

    .closeDialog {
      width: 23px;
      height: 23px;
      position: absolute;
      right: 3px;
      top: 3px;
      z-index: 1;
      cursor: pointer;
    }
  }

  .dialog-content-box {
    position: relative;
    background-color: rgba(0, 31, 55, 0.9);
    max-height: 85vh;
    overflow-y: auto;

    &::before {
      content: "";
      position: fixed;
      left: 0;
      top: 30px;
      bottom: 10px;
      z-index: 0;
      width: 2px;
      background: url(@/assets/images/cockpit_images/pop_left.png) repeat-y 0 0;
    }

    &::after {
      content: "";
      position: fixed;
      right: 0;
      top: 30px;
      bottom: 10px;
      z-index: 0;
      width: 2px;
      background: url(@/assets/images/cockpit_images/pop_right.png) repeat-y 0 0;
    }
  }

  .table-box {
    position: relative;
    padding: 20px 25px 0;
    min-height: 460px;

    margin: 0 auto;
  }

  // .el-checkbox__inner {
  //     background: url('@/assets/images/cockpit_images/checkedNo.png') no-repeat;
  //     background-size: 100% 100%;
  //     border: none;

  //     &::after {
  //         display: none;
  //     }
  // }

  // .is-checked {
  //     .el-checkbox__inner {
  //         background: url('@/assets/images/cockpit_images/checked.png') no-repeat;
  //         background-size: 100% 100%;
  //     }
  // }

  .el-table {
    background: unset !important;
    border: 1px solid rgba($color: #2bddff, $alpha: 0.1);
    .el-loading-mask{
      background-color: rgba($color: #2bddff, $alpha: 0.1);
    }
    .el-table__inner-wrapper::before{
      background-color: unset ;
      
    }
    // border-bottom: none;
    &::before {
      width: 0;
    }

    tbody {
      font-size: 12px;
      font-weight: 500;
      color: #ffffff;

      tr:hover>td {
        background-color: unset !important;
      }
    }

    tr {
      background: unset !important;

      th {
        background: unset !important;
        text-align: center;
        border-bottom: 1px solid rgba($color: #2bddff, $alpha: 0.1);
      }

      td {
        border-bottom: 1px solid rgba($color: #2bddff, $alpha: 0.1);
        text-align: center;
      }
    }

    .el-table__cell {
      padding: 6px 0;
    }

    thead {
      font-size: 14px;
      font-weight: 500;
      color: #11B4FF;
    }


  }
}

::v-deep.el-dialog__wrapper {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 20, 47, 0.3);
  backdrop-filter: blur(5px);
  overflow: hidden;
}

.text_btn {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #2bddff;
  }
}

::v-deep {
  .submit_row {
    width: 710px;
    margin: 0 auto;
    padding-top: 15px;

    .el-textarea {
      width: 630px;
    }

    .el-input {
      width: 300px;
    }
  }

  .submit_label {
    width: 80px;
    font-size: 14px;
    font-weight: 500;
    color: #2bddff;
  }

  .el-input__inner,
  .el-textarea__inner {
    color: #fff;
    border: none;
    background-color: rgba(43, 221, 255, 0.1);
  }

  .el-button--primary.is-plain {
    width: 80px;
    color: #ffffff;
    background: rgba(43, 221, 255, 0.5);
    border: 1px solid #2bddff;
  }

  .el-button {
    color: #fff;
    border: none !important;
    line-height: 30px;
    background: transparent;
    padding: 0;
  }

  .el-button--primary.is-plain:focus,
  .el-button--primary.is-plain:hover {
    background: #409eff;
    border-color: #409eff;
    color: #fff;
  }
}

::v-deep .accept {
  width: 735px;
}

.dialog-bottom {
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 43px;
    height: 15px;
    background: url(@/assets/images/cockpit_images/pop_btm01.png) no-repeat 0 0;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 43px;
    height: 15px;
    background: url(@/assets/images/cockpit_images/pop_btm01.png) no-repeat 0 0;
  }

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    width: 43px;
    height: 15px;
    background: url(@/assets/images/cockpit_images/pop_btm03.png) no-repeat 0 0;
  }

  .line {
    margin-left: 43px;
    width: calc(100% - 86px);
    height: 15px;
    background: url(@/assets/images/cockpit_images/pop_btm02.png) repeat-x 0 0;
  }
}
</style>