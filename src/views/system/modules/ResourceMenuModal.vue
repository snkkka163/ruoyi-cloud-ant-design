<template>
  <standard-drawer
    ref="standardDrawer"
    :title="readOnly ? '详情' : (form.id ? '菜单编辑' : '新增操作')"
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
      <a-form-model-item ref="name" label="菜单名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入菜单名称" />
      </a-form-model-item>
      <a-form-model-item label="归属菜单" prop="parentId">
        <a-tree-select
          v-model="form.parentId"
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :tree-data="treeData"
          :replaceFields="{ title: 'name', key: 'id', value: 'id' }"
          placeholder="请选择归属菜单"
          tree-default-expand-all
        ></a-tree-select>
      </a-form-model-item>
      <a-form-model-item label="菜单URL" prop="url">
        <a-input v-model="form.url" placeholder="请输入URL地址" />
      </a-form-model-item>
      <a-form-model-item label="组件地址" required prop="path">
        <a-input v-model="form.path" placeholder="请输入所属组件路径" />
      </a-form-model-item>
      <a-form-model-item label="是否隐藏" prop="hide">
        <a-switch v-model="form.hide" />
      </a-form-model-item>
      <a-form-model-item label="相关权限" prop="permission">
        <a-input v-model="form.permission" placeholder="请输入权限标识"/>
      </a-form-model-item>
      <a-form-model-item label="菜单图标" prop="icon">
        <a-input v-model="form.icon">
          <a-popover title="图标选择" slot="addonAfter" placement="left">
            <template slot="content">
              <icon-selector style="max-width: 1000px;" @change="handleIconChange"/>
            </template>
            <a-icon type="setting" />
          </a-popover>
        </a-input>
      </a-form-model-item>
      <a-form-model-item label="排序序号" prop="sort">
        <a-input-number v-model="form.sort" placeholder="请输入排序序号" style="min-width: 150px;"/>
      </a-form-model-item>
    </a-form-model>
  </standard-drawer>
</template>

<script>
import { axios } from '@/utils/request'
import { StandardDrawer, IconSelector } from '@/components'
// 资源 - 菜单权限 模版
export default {
  name: 'ResourceMenuModal',
  components: { StandardDrawer, IconSelector },
  data () {
    return {
      confirmLoading: false,
      treeData: [],
      readOnly: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      form: {
        type: 1,
        name: '',
        component: undefined,
        url: '',
        hide: false,
        permission: '',
        icon: undefined,
        sort: undefined
      },
      rules: {
        name: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        component: [
          { required: true, message: 'Please select Activity zone', trigger: 'change' },
          { max: 200, message: '最多输入200个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: 'Please pick a date', trigger: 'change' },
          { max: 200, message: '最多输入200个字符', trigger: 'blur' }
        ],
        resource: [
          { required: true, message: 'Please select activity resource', trigger: 'change' }
        ],
        desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }]
      }
    }
  },
  methods: {
    show (data, readOnly) {
      if (data) this.form = Object.assign({}, data) || {}
      this.readOnly = typeof readOnly !== 'undefined' ? readOnly === true : false
      this.loadMenuTree()
      this.$refs.standardDrawer.show()
    },
    confirm () {
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          (this.form.id ? this.$http.put : this.$http.post)('resource', this.form).then(res => {
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
        type: 1,
        name: '',
        component: undefined,
        url: '',
        hide: false,
        permission: '',
        icon: undefined,
        sort: undefined
      }
      this.confirmLoading = false
      this.$refs.ruleForm.resetFields()
    },
    loadMenuTree () {
      axios({
        url: 'resource/tree?type=1',
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
