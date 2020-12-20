<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
// import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
export default {
  name: 'Build',
  data () {
    return {

    }
  },
  created () {
    setTimeout(() => {
      this.loading = !this.loading
    }, 1000)
  }
}
</script>
