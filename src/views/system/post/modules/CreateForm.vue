<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.postId ? '岗位编辑' : '新增操作')"
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
        <a-form-model-item ref="postName" label="岗位名称" prop="postName">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.postName" placeholder="请输入岗位名称" />
        </a-form-model-item>
        <a-form-model-item ref="postName" label="岗位编码" prop="postCode">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.postCode" placeholder="请输入岗位编码" />
        </a-form-model-item>
        <a-form-model-item ref="postSort" label="岗位顺序" prop="postSort">
          <a-input-number v-model="form.postSort" :min="0" :max="100" />
        </a-form-model-item>
        <a-form-model-item ref="status" label="岗位状态" prop="status">
          <a-radio-group button-style="solid" v-model="form.status">
            <a-radio-button
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :value="dict.dictValue">
              {{ dict.dictLabel }}
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="remark" label="备注" prop="remark">
          <a-textarea
            rows="4"
            placeholder="备注"
            v-model="form.remark" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import IconSelect from '@/components/IconSelect'
import { updatePost, addPost } from '@/api/system/post'
// 表单字段
export default {
  components: {
    IconSelect
  },
  data () {
    return {
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 显示状态数据字典
      visibleOptions: [],
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
        postName: [
          { required: true, message: '岗位名称不能为空', trigger: 'blur' }
        ],
        postCode: [
          { required: true, message: '岗位编码不能为空', trigger: 'blur' }
        ],
        postSort: [
          { required: true, message: '岗位顺序不能为空', trigger: 'blur' }
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
    show (data, readOnly) {
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
      } else {
        // 新增行为
        // 刷新表单,查询角色树
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
          // 进行新增行为:
          if (this.form.postId > 0) {
            // 刷新表格
            updatePost(this.form).then(response => {
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
            addPost(this.form).then(response => {
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
