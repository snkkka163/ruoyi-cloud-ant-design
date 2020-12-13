<template>
  <standard-drawer
    ref="standardDrawer"
    :title="readOnly ? '详情' : (form.id ? '按钮编辑' : '新增操作')"
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
      <a-form-model-item ref="name" label="按钮名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入按钮名称" />
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
      <a-form-model-item label="相关权限" prop="permission">
        <a-input v-model="form.permission" placeholder="请输入权限标识"/>
      </a-form-model-item>
    </a-form-model>
  </standard-drawer>
</template>

<script>
import { axios } from '@/utils/request'
import { StandardDrawer } from '@/components'
// 资源 - 按钮权限 模版
export default {
  name: 'ResourceButtonModal',
  components: { StandardDrawer },
  data () {
    return {
      confirmLoading: false,
      treeData: [],
      readOnly: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      form: {
        name: '',
        permission: '',
        type: 2,
        parentId: undefined
      },
      rules: {
        name: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        parentId: [{ required: true, message: '此项为必选项', trigger: 'change' }]
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
        name: '',
        permission: '',
        type: 2,
        parentId: undefined
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
    }
  }
}
</script>

<style scoped>

</style>
