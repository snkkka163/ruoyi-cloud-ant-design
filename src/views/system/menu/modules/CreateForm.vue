<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.menuId ? '菜单编辑' : '新增操作')"
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
        <a-row>
          <a-col :span="24" :pull="3">
            <a-form-model-item ref="parentId" label="上级菜单" prop="parentId">
              <a-tree-select
                :tree-data="menuOptions"
                v-model="form.parentId"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="Please select"
                :replaceFields="treeReplaceFields"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item ref="menuType" label="菜单类型" prop="menuType">
              <a-radio-group v-model="form.menuType" :default-value="1">
                <a-radio :value="'M'">目录</a-radio>
                <a-radio :value="'C'">菜单</a-radio>
                <a-radio :value="'F'">按钮</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item v-if="form.menuType != 'F'" label="菜单图标">
              <a-popover
                placement="bottom"
                width="460"
                trigger="click"
              >
                <IconSelect slot="content" ref="iconSelect" @selected="selected" />
                <a-input v-model="form.icon" placeholder="点击选择图标" read-only>
                  <a-icon slot="prefix" :component="all[form.icon + 'Icon']" :style="{height: '30px', width: '16px', position: 'relative', top: '8px'}" />
                </a-input>
              </a-popover>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item ref="menuName" label="菜单名称" prop="menuName">
              <a-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item ref="orderNum" label="显示排序" prop="orderNum">
              <a-input v-model="form.orderNum" placeholder="请输入显示排序" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item v-if="form.menuType != 'F'" label="是否外链">
              <a-radio-group v-model="form.isFrame">
                <a-radio :value="'0'">是</a-radio>
                <a-radio :value="'1'">否</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item v-if="form.menuType != 'F'" label="路由地址" prop="path">
              <a-input v-model="form.path" placeholder="请输入路由地址" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3" v-if="form.menuType == 'C'">
            <a-form-model-item label="组件路径" prop="component">
              <a-input v-model="form.component" placeholder="请输入组件路径" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item v-if="form.menuType != 'M'" label="权限标识">
              <a-input v-model="form.perms" placeholder="请权限标识" maxlength="50" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item v-if="form.menuType != 'F'" label="显示状态">
              <a-radio-group v-model="form.visible">
                <a-radio
                  v-for="dict in visibleOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue"
                >{{ dict.dictLabel }}</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item v-if="form.menuType != 'F'" label="菜单状态">
              <a-radio-group v-model="form.status">
                <a-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue"
                >{{ dict.dictLabel }}</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3" v-if="form.menuType == 'C'">
            <a-form-model-item v-if="form.menuType == 'C'" label="是否缓存">
              <a-radio-group v-model="form.isCache">
                <a-radio :value="'0'">缓存</a-radio>
                <a-radio :value="'1'">不缓存</a-radio>
              </a-radio-group>
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
import { addMenu, listMenu, updateMenu } from '@/api/system/menu'
import all from '@/core/icons'
// 表单字段
export default {
  components: {
    IconSelect
  },
  data () {
    return {
      // 图标选择器
      all,
      // 菜单列表
      menuOptions: [],
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
      form: {
        icon: ''
      },
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        orderNum: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '路由地址不能为空', trigger: 'blur' }
        ]
      },
      treeReplaceFields: {
        children: 'children',
        title: 'menuName',
        key: 'menuId',
        value: 'menuId'
      }
    }
  },
  created () {
    this.getDicts('sys_show_hide').then(response => {
      this.visibleOptions = response.data
    })
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    this.refreshMenu()
  },
  methods: {
    refreshMenu () {
      listMenu().then(response => {
        this.menuOptions = this.handleTree(response.data, 'menuId')
        const menu = { menuId: 0, menuName: '主类目', children: [] }
        this.menuOptions.push(menu)
      })
    },
    // 由于要用传进来的值做判断,将显示和隐藏放在内部做处理
    show (data, readOnly) {
      // 给类型选择框赋值:
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
        this.form.menuType = data.menuType
      } else {
        // 新增行为
        // 默认将类型设置为目录
        this.reset()
      }
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
          if (this.form.menuId > 0) {
            // 暂时在本处处理若依最高级菜单下无子菜单情况下children是个字符串的bug
            if (this.form.children === '') {
              this.form.children = []
            }
            this.filterStrArrary(this.form.children)
            updateMenu(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('修改成功')
                // 关闭本组件
                this.visible = false
                // 调用外部刷新列表方法
                this.$emit('handle-success')
                // 刷新表单
                this.reset()
              } else {
                this.$message.error(response.msg)
                this.confirmLoading = false
              }
            })
          } else {
            // 新增
            addMenu(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('新增成功')
                // 关闭本组件
                this.visible = false
                // 调用外部刷新列表方法
                this.$emit('handle-success')
                // 刷新表单
                this.reset()
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
      this.form = {
        icon: 'code',
        menuType: 'M'
      }
    },
    // 选择图标
    selected (name) {
      this.form.icon = name
    },
    filterStrArrary (list) {
      for (let index = 0; index < list.length; index++) {
        if (list[index].children === '') {
          list[index].children = []
        }
        if (list[index].children) {
          this.filterStrArrary(list[index].children)
        }
      }
    }
  }
}
</script>
