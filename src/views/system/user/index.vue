<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
          <div class="avatar">
          </div>
          <div class="content">
            <div class="content-title">
              <h1></h1>
            </div>
            <div>前端工程师 | 蚂蚁金服 - 某某某事业群 - VUE平台</div>
          </div>
      </div>
    </template>
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
      user: {},
      routes: [
        {
          path: 'index',
          breadcrumbName: 'First-level Menu'
        },
        {
          path: 'first',
          breadcrumbName: 'Second-level Menu'
        },
        {
          path: 'second',
          breadcrumbName: 'Third-level Menu'
        }
      ]
    }
  },
  created () {
    console.log(1)
  }
}
</script>
