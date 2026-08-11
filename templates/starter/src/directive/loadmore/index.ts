import { useUserStoreHook } from '@/store/modules/user';
import { Directive, DirectiveBinding } from 'vue';

/**
 * 下拉加载
 */
export const loadmore: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const SELECTWRAP_DOM = el.querySelector('.el-popper .el-select-dropdown .el-scrollbar .el-select-dropdown__wrap')
    SELECTWRAP_DOM?.addEventListener('scroll', function () {
      const { scrollTop, scrollHeight, clientHeight } = SELECTWRAP_DOM
      const condition = scrollHeight - scrollTop <= clientHeight;
      if (condition) {
        binding.value();
      }
    });
  }
};
