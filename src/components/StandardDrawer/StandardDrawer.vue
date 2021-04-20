<template>
  <a-drawer
    :width="600"
    :title="$slots.title ? undefined : title"
    :maskClosable="false"
    :visible="visible"
    @close="close"
  >
    <template v-if="$slots.title" slot="title">
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <div
      :style="{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e8e8e8',
        padding: '10px 16px',
        textAlign: 'right',
        left: 0,
        background: '#fff',
        borderRadius: '0 0 4px 4px',
      }">
      <a-button style="marginRight: 8px" @click="close">
        取消
      </a-button>
      <a-button v-if="editable" type="primary" :loading="confirmLoading" @click="handleOk">
        {{ confirmLoading ? '提交中' : '提交' }}
      </a-button>
    </div>
  </a-drawer>
</template>

<script>
// 标准 drawer 模版
export default {
  name: 'StandardDrawer',
  props: {
    title: {
      type: String,
      default: '操作'
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      visible: false
    }
  },
  methods: {
    show () {
      this.visible = true
    },
    handleOk () {
      this.$emit('confirm')
    },
    close () {
      this.$emit('close')
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
