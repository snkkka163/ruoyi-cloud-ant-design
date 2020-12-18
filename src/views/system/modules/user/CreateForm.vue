<template>
  <a-modal
    title="新增/更新用户"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="用户名称">
              <a-input v-decorator="['nickName']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="归属部门">
              <a-tree-select
                v-decorator="['dept']"
                v-model="value"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="treeData"
                placeholder="Please select"
                tree-default-expand-all
              >
              <!-- <span v-if="key === '0-0-1'" slot="title" slot-scope="{ key, value }" style="color: #08c">
                Child Node1 {{ value }}
              </span> -->
              </a-tree-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="手机号码">
              <a-input v-decorator="['phonenumber']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱">
              <a-input v-decorator="['email']" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="用户名称">
              <a-input v-decorator="['phonenumber']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="用户密码">
              <a-input v-decorator="['email',{ rules: [{ required: true, message: '请输入用户密码' }] }]" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="用户性别">
              <a-input v-decorator="['phonenumber']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-decorator="['email']">
                <a-radio :value="1">
                  正常
                </a-radio>
                <a-radio :value="2">
                  停用
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="岗位">
              <a-select
                mode="tags"
                :size="size"
                placeholder="Please select"
                :default-value="['a1', 'b2']"
                style="width: 200px"
                @change="handleChange"
              >
                <a-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
                  {{ (i + 9).toString(36) + i }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色">
              <a-select
                mode="tags"
                :size="size"
                placeholder="Please select"
                :default-value="['a1', 'b2']"
                style="width: 200px"
                @change="handleChange"
              >
                <a-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
                  {{ (i + 9).toString(36) + i }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
            <a-form-item label="备注" width="100%">
              <a-textarea width="100%" placeholder="Basic usage" :rows="4" />
            </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getTreeSelect } from '@/api/system/dept'
// 表单字段
const fields = ['userName', 'nickName']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    return {
      form: this.$form.createForm(this),
      treeData: [],
      value: undefined
    }
  },
  created () {
    console.log('custom modal created')

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })

    // 初始化树菜单
    getTreeSelect()
    .then(res => {
      // 层级遍历赋值给treeData
      this.treeData = res.data
      this.getTreeSelectChildren(this.treeData)
      console.log(this.treeData)
    })
  },
  methods: {
    getTreeSelectChildren (treeData) {
      treeData.forEach(element => {
        element.value = element.id
        element.key = element.label
        if (element.hasOwnProperty('children') === true) {
          this.getTreeSelectChildren(element.children)
        }
      })
    }
  }
}
</script>
