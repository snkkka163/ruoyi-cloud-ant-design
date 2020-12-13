<template>
  <standard-drawer
    ref="standardDrawer"
    @close="close"
    @confirm="confirm"
    :title="readOnly ? '详情' : (form.id ? '用户编辑' : '新增操作')"
    :confirmLoading="confirmLoading"
    :editable="!readOnly"
  >
    <!-- <template slot="title">
      {{form.id ? '用户编辑' : '新增操作'}} <a-icon style="margin-left: 6px;" size="small" type="question-circle" theme="twoTone" two-tone-color="orange"/>
    </template> -->
    <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item ref="username" label="用户名" prop="username">
        <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.username" placeholder="请输入菜单名称" />
      </a-form-model-item>
      <a-form-model-item label="昵称" prop="nickname">
        <a-input v-model="form.nickname" placeholder="请输入昵称或真实姓名" />
      </a-form-model-item>
      <a-form-model-item label="邮箱地址" prop="email">
        <a-auto-complete
          :data-source="emailDataSource"
          v-model="form.email"
          placeholder="请输入邮箱地址"
          @change="handleEmailChange"
        />
      </a-form-model-item>
      <a-form-model-item label="手机号" prop="mobile">
        <a-input v-model="form.mobile" placeholder="请输入手机号" />
      </a-form-model-item>
      <a-form-model-item label="状态" prop="status">
        <a-radio-group v-model="form.status">
          <a-radio-button v-for="item in userStatus" :value="item.value" :key="item.value">
            {{ item.label }}
          </a-radio-button>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="角色分配" prop="description">
        <a-select mode="multiple" placeholder="请选择角色" v-model="form.roleIds" allowClear>
          <a-select-option v-for="role in allRoles" :key="role.value" :value="role.value">
            {{ role.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="独立权限" prop="resourceIds">
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
// 用户 - 编辑 模版
export default {
  name: 'UserEditPanel',
  components: { StandardDrawer, IconSelector },
  data () {
    return {
      userStatus: this.$dic.query('sys_user_state'),
      emailDataSource: [],
      confirmLoading: false,
      defaultExpandedKeys: [],
      treeData: [],
      readOnly: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      form: {
        username: '',
        nickname: '',
        resourceIds: [],
        status: undefined,
        roleIds: []
      },
      rules: {
        username: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        nickname: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 50, message: '最多输入50个字符', trigger: 'change' }
        ],
        status: [
          { required: true, message: '此项为必选项', trigger: 'change' }
        ],
        mobile: [{ pattern: new RegExp('^[1][3-8][0-9]{9}$'), message: '格式不合法', trigger: 'change' }],
        email: [{ type: 'email', message: '格式不合法', trigger: 'change' }]
        // pattern: new RegExp('^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\\.[a-zA-Z0-9_-]{2,3}){1,2})$')
        // ,resourceIds: [{ required: true, message: '此项为必选项', trigger: 'select' }]
      }
    }
  },
  computed: {
    allRoles () {
      return this.$store.getters.allRoles
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
          (this.form.id ? this.$http.put : this.$http.post)('user', params).then(res => {
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
        nickname: '',
        status: undefined,
        roleIds: []
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
    handleEmailChange (value) {
      this.emailDataSource =
        !value || value.indexOf('@') >= 0
          ? []
          : [`${value}@gmail.com`, `${value}@163.com`, `${value}@qq.com`]
    }
  }
}
</script>

<style scoped>

</style>
