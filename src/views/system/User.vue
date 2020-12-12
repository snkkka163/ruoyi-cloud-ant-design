<template>
  <page-header-wrapper>
  </page-header-wrapper>
</template>

<script>
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
export default {
  name: 'User',
  components: {
    PageHeaderWrapper
  },
  data () {
    return {
      user: {}
    }
  },
  created () {
    console.log(1)
  }
}
</script>
