<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="用户名/昵称">
                    <a-input placeholder="请输入" v-model="queryParam.userName"/>
                  </a-form-item>
                </a-col>
               <a-col :md="8" :sm="24">
                  <a-form-item label="手机号码">
                    <a-input placeholder="请输入" v-model="queryParam.phonenumber"/>
                  </a-form-item>
                </a-col>
                <template v-if="advanced">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="状态">
                      <a-select placeholder="请选择" v-model="queryParam.status">
                        <a-select-option value="0">正常</a-select-option>
                        <a-select-option value="1">禁用</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="创建时间">
                      <!--  @change="onChange" -->
                         <a-range-picker @change="rangePicker" />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="8" :sm="24">
                  <span class="table-page-search-submitButtons">
                    <a-button @click="search" type="primary">查询</a-button>
                    <a-button @click="reset" style="margin-left: 8px">重置</a-button>
                    <a @click="toggleAdvanced" style="margin-left: 8px">
                      {{ advanced ? '收起' : '展开' }}
                      <a-icon :type="advanced ? 'up' : 'down'"/>
                    </a>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-card>
      </div>
      <div class="table-page-operator-wrapper">
        <a-button @click="handleAdd" type="primary" ghost>新增</a-button>
        <a-button @click="batchDelete(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="export-data" @click="exprotExcel">导出Excel</a-menu-item>
          </a-menu>
          <a-button>
            更多操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :loading="tableLoading"
        :data-source="data"
        :row-selection="rowSelection"
        row-key="userId"
        :pagination="false"
      >
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <!-- <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
          <role-panel @add-action="$refs.editPanel.show(record)" :role-ids="record.roleIds || []" action-name="sys:user:update"/>
          <a-divider type="horizontal" :dashed="true" style="margin-bottom: 6px; margin-top: 6px;"/>
          <resource-panel @add-action="$refs.editPanel.show(record)" :resourceIds="record.resourceIds || []" action-name="sys:user:update"/>
        </div> -->
        <span slot="action" slot-scope="text, record">
          <a >编辑</a><!-- @click="$refs.editPanel.show(record)" -->
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="resetPwd(record.userId)">重置密码</a>
              </a-menu-item>
              <!-- <a-menu-item>
                <a href="javascript:;" @click="deleteRecord(record)">删除</a>
              </a-menu-item> -->
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
      <a-pagination
          class="ant-table-pagination"
          v-model="current"
          :page-size-options="pageSizeOptions"
          :total="total"
          show-size-changer
          :page-size="pageSize"
          @showSizeChange="onShowSizeChange"
        >
        <template slot="buildOptionText" slot-scope="props">
          <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
          <span v-if="props.value === '50'">全部</span>
        </template>
      </a-pagination>
      <create-form
        ref="createModal"
        :visible="visible"
        :columns="columns"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />

      <reset-password
        ref="resetPassword"
        :visible="resetPasswordVisible"
        :loading="resetPasswordConfirmLoading"
        :model="resetPasswordmdl"
        @cancel="resetPasswordHandleCancel"
        @ok="resetPasswordHandleOk"
      />
      <!-- <user-edit-panel ref="editPanel" @handle-success="formHandleSuccess"/> -->
    </template>
  </page-header-wrapper>
</template>

<script>
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import { getUserList, resetPwd } from '@/api/system/user'
import { STable, DescriptionList } from '@/components'
import CreateForm from './modules/CreateForm'
import ResetPassword from './modules/ResetPassword'
const statusMap = {
  0: {
    status: 'success',
    text: '正常'
  },
  1: {
    status: 'error',
    text: '停用'
  }
}

export default {
  name: 'User',
  components: {
    PageHeaderWrapper,
    STable,
    DescriptionList,
    CreateForm,
    ResetPassword
    // ResourcePanel
  },
  data () {
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // resetPassword model
      resetPasswordVisible: false,
      resetPasswordConfirmLoading: false,
      resetPasswordmdl: null,
      resetPassswordUserId: 0,
      user: {},
      routes: [
        {
          path: 'index',
          breadcrumbName: 'First-level Menu'
        },
        {
          path: 'first',
          breadcrumbName: 'Second-level Menu'
        },
        {
          path: 'second',
          breadcrumbName: 'Third-level Menu'
        }
      ],
      // table/搜索框
      tableLoading: false,
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 50,
      // 表格数据
      data: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      form: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        status: '0'
      },
      // 表头
      columns: [
        {
          title: '用户编号',
          dataIndex: 'userId',
          scopedSlots: { customRender: 'userId' }
        },
        {
          title: '用户名',
          dataIndex: 'userName'
        },
        {
          title: '用户名称',
          dataIndex: 'nickName'
        },
        {
          title: '部门',
          dataIndex: 'dept.deptName'
        },
        {
          title: '手机号码',
          dataIndex: 'phonenumber'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '创建时间',
          width: '150',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          width: '150',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      // loadData: parameter => {
      //   const params = Object.assign({}, this.queryParam)
      //   console.log('加载数据的方法')
      //   console.log(params)
      //   if (params.status === '-1') {
      //     delete params.status
      //   }
      //   return getUserList(Object.assign(parameter, params))
      //     .then(res => {
      //       return {
      //         data: res.rows,
      //         pageSize: 20,
      //         pageNo: res.rows.size / 20,
      //         totalCount: res.total
      //       }
      //     })
      // },

      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        onSelect: (record, selected, selectedRows) => {},
        onSelectAll: (selected, selectedRows, changeRows) => {}
      }
    }
  },
  // 状态过滤
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    setTimeout(() => {
      this.loading = !this.loading
    }, 1000)
    this.getList()
  },
  methods: {
    onShowSizeChange (current, pageSize) {
      this.pageSize = pageSize
      this.current = current
      this.getList()
    },
    /** 查询用户列表 */
    getList () {
      this.tableLoading = true
      const params = Object.assign({}, this.queryParam)
      console.log('加载数据的方法')
      console.log(params)
      // 与分页绑定
      params.pageNum = this.current
      params.pageSize = this.pageSize
      if (params.status === '-1') {
        delete params.status
      }
      getUserList(Object.assign(params))
            .then(res => {
              this.data = res.rows
              this.total = res.total
              this.tableLoading = false
            })
    },
    /** 搜索行为 */
    search () {
      this.getList()
    },
    // 刷新搜索框
    reset () {
      this.queryParam = {
        status: '0'
      }
      this.getList()
    },
    // 更新
    updateStatus (record, status) {
      console.log('更新操作')
      console.log(record)
      this.$http.put('/user/updateStatus', {
        id: record.id,
        status: status
      }).then(res => {
        console.log(res)
        if (res.data) {
          this.getList()
        }
      })
    },
    // 删除
    deleteRecord (record) {
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${record.nickname} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          that.handleDelete([record.id], {
            success () {},
            done () {}
          })
        }
      })
    },
    // 批量删除
    batchDelete (ids) {
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除这 ${ids.length} 位用户吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          that.handleDelete(ids, {
            success () {},
            done () {}
          })
        }
      })
    },
    // handleDelete (ids, callback) {
    //   if (ids.length > 0) {
    //     this.$http.delete('user/' + ids.join(',')).then(res => {
    //       this.$message.success('已成功删除')
    //       this.$refs.table.refresh()
    //       if (callback) {
    //         (typeof callback.done === 'function') && callback.done.call(this)
    //         if (typeof callback.success === 'function') { callback.success.call(this, res) }
    //       }
    //     }).catch(e => {
    //       if (callback) {
    //         (typeof callback.done === 'function') && callback.done.call(this)

    //         if (typeof callback.fail === 'function') { callback.fail.call(this, e) }
    //       }
    //     })
    //   }
    // },
    // excel导出
    exprotExcel () {
       console.log('导出excel')
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    formHandleSuccess () {
      console.log('1')
      this.$refs.table.refresh()
    },
    // 动态操作(打开模态框)
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    // 新增/修改框事件
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.queryParam.beginTime = dateString[0]
      this.queryParam.endTime = dateString[1]
    },
    resetPasswordHandleCancel () {
      this.resetPasswordVisible = false
    },
    // 动态操作(打开重置密码)
    resetPwd (id) {
      this.resetPassswordUserId = id
      this.resetPasswordmdl = null
      this.resetPasswordVisible = true
    },
    // 重置密码提交事件
    resetPasswordHandleOk () {
      const form = this.$refs.resetPassword.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
            console.log('values', values)
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              resetPwd(Object.assign({
                'userId': this.resetPassswordUserId,
                'password': values.password
              })).then(res => {
                if (res.code === 200) {
                  this.$message.success(res.msg)
                  // 重置表单数据
                  form.resetFields()
                  this.resetPasswordVisible = false
                  this.resetPasswordConfirmLoading = false
                } else {
                  this.$message.error(res.msg)
                }
              })
            })
        } else {
          this.confirmLoading = false
        }
      })
    }
  }
}
</script>
