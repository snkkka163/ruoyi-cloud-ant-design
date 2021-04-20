<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.dictCode ? '字典数据编辑' : '新增操作')"
    :width="640"
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
        <a-form-model-item label="字典类型" prop="dictType">
          <a-input v-model="defaultDictType" :disabled="true" placeholder="请输入字典类型" />
        </a-form-model-item>
        <a-form-model-item label="数据标签" prop="dictLabel">
          <a-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </a-form-model-item>
        <a-form-model-item label="数据键值" prop="dictValue">
          <a-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </a-form-model-item>
        <a-form-model-item label="显示排序" prop="dictSort">
          <a-input v-model="form.dictSort" placeholder="请输入显示排序" />
        </a-form-model-item>

        <a-form-model-item label="状态" prop="status">
          <a-radio-group button-style="solid" v-model="form.status">
            <a-radio-button
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :value="dict.dictValue">
              {{ dict.dictLabel }}
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="备注" prop="remark">
          <a-textarea
            rows="4"
            placeholder="请输入备注"
            v-model="form.remark" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { addData, updateData } from '@/api/system/dict/data'
// 表单字段
export default {
  data () {
    return {
      defaultDictType: '',
      // 状态数据字典
      statusOptions: [],
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
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictLabel: [
          { required: true, message: '数据标签不能为空', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '数据键值不能为空', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '数据顺序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    // 由于要用传进来的值做判断,将显示和隐藏放在内部做处理
    show (data, defaultDictType, readOnly) {
      // 由于传过来的也有可能是新增时要带的字典类型,所以这里通过code判断
      if (data.dictCode) {
        this.defaultDictType = defaultDictType
        // 修改行为
        this.form = Object.assign({}, data) || {}
      } else {
        this.defaultDictType = defaultDictType
        // 新增行为
        this.reset()
      }
      // if (data) this.form = Object.assign({}, data) || {}
      this.readOnly = typeof readOnly !== 'undefined' ? readOnly === true : false
      this.visible = true
    },
    // 关闭模态框
    close () {
      this.visible = false
      this.reset()
    },
    confirm () {
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.form.dictType = this.defaultDictType
          // 进行新增行为:
          if (this.form.dictCode > 0) {
            // 刷新表格
            updateData(this.form).then(response => {
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
            addData(this.form).then(response => {
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
    }
  }
}
</script>
