<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <template>
          <a-result title="该功能正在开发中...">
            <template #icon>
              <a-icon type="smile" theme="twoTone" />
            </template>
            <template #extra>
              <a-button type="primary" @click="returnIndex">
                返回工作台
              </a-button>
            </template>
          </a-result>
        </template>
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
  },
  methods: {
    returnIndex () {
      this.$router.push({ path: '/dashboard/workplace' })
    }
  }
}
</script>
