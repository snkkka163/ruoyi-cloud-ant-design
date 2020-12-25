<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.noticeId ? '角色编辑' : '新增操作')"
    :width="780"
    :visible="visible"
    @cancel="close"
    @ok="confirm"
    :confirmLoading="confirmLoading"
  >
    <a-spin :spinning="loading">
      <a-form-model
        ref="ruleForm"
        :model="form"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row>
          <a-col :span="12">
            <a-form-model-item ref="noticeTitle" label="公告标题" prop="noticeTitle">
              <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item ref="noticeType" label="公告类型" prop="noticeType">
              <a-select v-model="form.noticeType">
                <a-select-option
                  v-for="dict in typeOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue">
                  {{ dict.dictLabel }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item ref="status" label="状态" prop="status">
              <a-radio-group v-model="form.status">
                <a-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue">
                  {{ dict.dictLabel }}
                </a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item ref="noticeContent" label="内容" prop="noticeContent">
              <!-- <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.noticeContent" placeholder="请输入内容" /> -->
              <notice-vditor ref="noticeVditor" @mounted="childrenMounted" :contentValue="form.noticeContent" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import IconSelect from '@/components/IconSelect'
import { addNotice, updateNotice } from '@/api/system/notice'
import NoticeVditor from './NoticeVditor'
// 表单字段
export default {
  components: {
    IconSelect,
    NoticeVditor
  },
  data () {
    return {
      // 富文本组件是否初始化完成
      noticeVditorIsInit: false,
      // 类型数据字典
      statusOptions: [],
      // 状态数据字典
      typeOptions: [],
      // 当前控件配置:
      confirmLoading: false,
      readOnly: false,
      visible: false,
      loading: false,
      // form: this.$form.createForm(this),
      // value: undefined,
      labelCol: {
        xs: { span: 12 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      // 表单属性:
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        noticeTitle: [
          { required: true, message: '公告标题不能为空', trigger: 'blur' }
        ],
        noticeType: [
          { required: true, message: '公告类型不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getDicts('sys_notice_status').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_notice_type').then(response => {
      this.typeOptions = response.data
    })
  },
  methods: {
    // 由于要用传进来的值做判断,将显示和隐藏放在内部做处理
    show (data, readOnly) {
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
        if (this.noticeVditorIsInit) {
          this.$refs.noticeVditor.setContent(this.form.noticeContent)
        }
      } else {
        // 新增行为
        this.reset()
      }
      // if (data) this.form = Object.assign({}, data) || {}
      this.readOnly = typeof readOnly !== 'undefined' ? readOnly === true : false
      this.visible = true
    },
    // 关闭模态框
    close () {
      this.$refs.noticeVditor.clear()
      this.visible = false
      this.reset()
    },
    confirm () {
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          // 获取富文本的数据
          this.form.noticeContent = this.$refs.noticeVditor.getContent()
          // 进行新增行为:
          if (this.form.noticeId > 0) {
            // 刷新表格
            updateNotice(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('修改成功')
                // 关闭本组件
                this.visible = false
                // 调用外部刷新列表方法
                this.$emit('handle-success')
                // 刷新表单
                this.reset()
                this.confirmLoading = false
              } else {
                this.$message.error(response.msg)
                this.confirmLoading = false
              }
            })
          } else {
            // 新增
            addNotice(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('新增成功')
                // 关闭本组件
                this.visible = false
                // 调用外部刷新列表方法
                this.$emit('handle-success')
                // 刷新表单
                this.reset()
                this.confirmLoading = false
              } else {
                this.$message.error(response.msg)
                this.confirmLoading = false
              }
            })
          }
        } else {
          return (this.confirmLoading = false)
        }
      })
    },
    // 表单重置
    reset () {
      this.form = {}
    },
    // 表示已经关闭过一次了,所以一定是初始化完成了的
    childrenMounted () {
      this.noticeVditorIsInit = true
    }
  }
}
</script>
