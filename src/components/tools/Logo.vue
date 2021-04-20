<template>
  <div class="logo">
    <router-link :to="{name:'dashboard'}">
      <LogoSvg alt="logo" />
      <h1 style="" v-if="showTitle">{{ title }}</h1>
    </router-link>
  </div>
</template>

<script>
import app from '@/store/modules/app'
import LogoSvg from '@/assets/logo2.svg?inline'

export default {
  name: 'Logo',
  components: {
    LogoSvg
  },
  props: {
    title: {
      type: String,
      default: app.state.systemName || '系统名称',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>
