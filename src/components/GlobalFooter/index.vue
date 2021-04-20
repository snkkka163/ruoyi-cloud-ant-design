<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      <a href="https://gitee.com/y_project/RuoYi-Cloud" target="_blank">RuoYi-Cloud</a>
      <a href="https://gitee.com/xuezipeng/ruoyi-cloud-ant-design" target="_blank">Gitee</a>
      <a href="https://gitee.com/xuezipeng" target="_blank">@xuezipeng</a>
    </template>
    <template v-slot:copyright>
      <a href="http://ruoyi.vip/" target="_blank">若依管理系统</a>
    </template>
  </global-footer>
</template>

<script>
import { GlobalFooter } from '@ant-design-vue/pro-layout'

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  }
}
</script>
