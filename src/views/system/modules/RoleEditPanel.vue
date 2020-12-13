<template>
  <standard-drawer
    ref="standardDrawer"
    :title="readOnly ? '详情' : (form.id ? '角色编辑' : '新增操作')"
    @close="close"
    @confirm="confirm"
    :confirmLoading="confirmLoading"
    :editable="!readOnly"
  >
    <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item ref="roleKey" label="唯一识别" prop="roleKey">
        <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.roleKey" placeholder="请输入唯一识别标记" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="角色名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入菜单名称" />
      </a-form-model-item>
      <a-form-model-item label="状态" prop="status">
        <a-radio-group v-model="form.status">
          <a-radio-button v-for="item in roleStatus" :value="item.value" :key="item.value">
            {{ item.label }}
          </a-radio-button>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="角色描述" prop="description">
        <a-input type="textarea" v-model="form.description" placeholder="请输入角色描述"/>
      </a-form-model-item>
      <a-form-model-item label="权限分配" prop="resourceIds">
        <a-tree
          checkable
          :auto-expand-parent="true"
          :default-expand-all="true"
          :multiple="true"
          :check-strictly="true"
          v-model="form.resourceIds"
          :default-expanded-keys="defaultExpandedKeys"
          style="width: 100%"
          :tree-data="treeData"
          :replaceFields="{ title: 'name', key: 'id', value: 'id' }"
        ></a-tree>
      </a-form-model-item>
    </a-form-model>
  </standard-drawer>
</template>

<script>
import { axios } from '@/utils/request'
import { StandardDrawer, IconSelector } from '@/components'
// 角色 - 编辑 模版
export default {
  name: 'RoleEditPanel',
  components: { StandardDrawer, IconSelector },
  data () {
    return {
      roleStatus: this.$dic.query('sys_role_state'),
      confirmLoading: false,
      defaultExpandedKeys: [],
      treeData: [],
      readOnly: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      form: {
        name: '',
        resourceIds: [],
        description: '',
        status: undefined,
        roleKey: undefined
      },
      rules: {
        name: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        roleKey: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 50, message: '最多输入50个字符', trigger: 'change' }
        ],
        status: [
          { required: true, message: '此项为必选项', trigger: 'change' }
        ],
        resourceIds: [{ required: true, message: '此项为必选项', trigger: 'select' }]
      }
    }
  },
  methods: {
    show (data, readOnly) {
      if (data) this.form = Object.assign({}, data) || {}
      this.readOnly = typeof readOnly !== 'undefined' ? readOnly === true : false
      this.defaultExpandedKeys = this.form.resourceIds
      this.loadMenuTree()
      this.$refs.standardDrawer.show()
    },
    confirm () {
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        const params = Object.assign({}, this.form)
        if (!(params.resourceIds instanceof Array) && params.resourceIds.checked) {
          params.resourceIds = params.resourceIds.checked
        }
        if (valid) {
          (this.form.id ? this.$http.put : this.$http.post)('role', params).then(res => {
            this.$message.success('操作成功！')
            this.$emit('handle-success')
            this.$refs.standardDrawer.close()
          }).catch(e => {
            this.confirmLoading = false
          })
        } else {
          return (this.confirmLoading = false)
        }
      })
    },
    close () {
      this.form = {
        name: '',
        resourceIds: [],
        description: '',
        status: undefined,
        roleKey: undefined
      }
      this.confirmLoading = false
      this.$refs.ruleForm.resetFields()
    },
    loadMenuTree () {
      axios({
        url: 'resource/tree?status=1',
        method: 'get'
      }).then(res => {
        this.treeData = res.data || []
      })
    },
    handleIconChange (icon) {
      this.form.icon = icon
    }
  }
}
</script>

<style scoped>

</style>
