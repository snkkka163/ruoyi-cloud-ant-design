<template>
  <div id="vditor" :contentValue="contentValue"></div>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
export default {
  name: 'NoticeVditor',
  props: {
    contentValue: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 内容编辑(富文本)
      contentEditor: ''
    }
  },
  mounted () {
    this.contentEditor = new Vditor('vditor', {
      value: this.contentValue ? this.contentValue : '',
      height: 360,
      width: 650,
      toolbarConfig: {
        pin: true
      },
      cache: {
        enable: false
      }
    })
  },
  created () {},
  methods: {
    clear () {
      this.contentEditor.setValue('')
      this.$emit('mounted')
    },
    setContent (value) {
      this.contentEditor.setValue(value)
    },
    getContent () {
      return this.contentEditor.getValue()
    }
  }
}
</script>
