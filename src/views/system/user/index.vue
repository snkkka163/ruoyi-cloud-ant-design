<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <a-row :gutter="24">
            <a-col :span="4">
              <!-- 部门树 -->
              <dept-tree
                ref="deptTree"
                :deptOptions="deptOptions"
                @select="clickDeptNode"
              />
            </a-col>
            <a-col :span="20">
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
                        <a-button @click="reset" v-hasPermi="['system:user:resetPwd']" style="margin-left: 8px">重置</a-button>
                        <a @click="toggleAdvanced" style="margin-left: 8px">
                          {{ advanced ? '收起' : '展开' }}
                          <a-icon :type="advanced ? 'up' : 'down'"/>
                        </a>
                      </span>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
              <!-- 新增 -->
              <div class="table-page-operator-wrapper">
                <a-button @click="$refs.createModal.show()" v-hasPermi="['system:user:add']" type="primary" ghost>新增</a-button>
                <a-button @click="batchDelete(selectedRowKeys)" v-hasPermi="['system:user:remove']" :disabled="selectedRowKeys.length === 0">删除</a-button>
                <a-dropdown>
                  <a-menu slot="overlay">
                    <a-menu-item key="export-data1" @click="importTemplate">下载Excel模板</a-menu-item>
                    <a-menu-item key="export-data2" @click="handleExport" v-hasPermi="['system:user:export']">导出Excel</a-menu-item>
                    <a-menu-item key="export-data3" @click="importExcelHandleOpen" v-hasPermi="['system:user:import']">导入Excel</a-menu-item>
                  </a-menu>
                  <a-button>
                    更多操作 <a-icon type="down" />
                  </a-button>
                </a-dropdown>
              </div>
              <!-- 表格 -->
              <a-table
                ref="table"
                :columns="columns"
                :loading="tableLoading"
                :data-source="data"
                :row-selection="rowSelection"
                row-key="userId"
                :pagination="false"
              >
                <span slot="status" slot-scope="text, record">
                  <a-popconfirm
                    ok-text="是"
                    cancel-text="否"
                    @confirm="confirmHandleStatus(record)"
                    @cancel="cancelHandleStatus(record)"
                  >
                    <span slot="title">确认<b>{{ record.status === '1' ? '启用' : '停用' }}</b>名称为:{{ record.nickName }}的用户吗?</span>
                    <a-switch checked-children="开" un-checked-children="关" :checked="record.status == 0" />
                  </a-popconfirm>
                </span>
                <span slot="action" slot-scope="text, record">
                  <a @click="$refs.createModal.show(record)" v-hasPermi="['system:user:edit']">编辑</a>
                  <a-divider type="vertical" />
                  <a-dropdown>
                    <a class="ant-dropdown-link">
                      更多 <a-icon type="down" />
                    </a>
                    <a-menu slot="overlay">
                      <a-menu-item>
                        <a href="javascript:;" @click="resetPwd(record.userId)">重置密码</a>
                      </a-menu-item>
                      <a-menu-item>
                        <a href="javascript:;" v-if="record.userId !== 1" v-hasPermi="['system:user:remove']" @click="deleteRecord(record)">删除</a>
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </span>
              </a-table>
              <!-- 底部分页按钮 -->
              <a-pagination
                class="ant-table-pagination"
                v-model="current"
                :page-size-options="pageSizeOptions"
                :total="total"
                show-size-changer
                :page-size="pageSize"
                @showSizeChange="onShowSizeChange"
                @change="currentPageChange"
              >
                <template slot="buildOptionText" slot-scope="props">
                  <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
                  <span v-if="props.value === '50'">全部</span>
                </template>
              </a-pagination>
              <!-- 创建/编辑用户,单独封装了组件 -->
              <create-form
                ref="createModal"
                @handle-success="handleOk"
              />
              <!-- 修改密码抽屉 -->
              <reset-password
                ref="resetPassword"
                :visible="resetPasswordVisible"
                :loading="resetPasswordConfirmLoading"
                :model="resetPasswordmdl"
                @cancel="resetPasswordHandleCancel"
                @ok="resetPasswordHandleOk"
              />
              <!-- 上传文件 -->
              <a-modal
                :title="upload.title"
                :visible="excelVisible"
                @cancel="importExcelHandleCancel"
              >
                <a-upload-dragger
                  name="file"
                  accept=".xlsx, .xls"
                  :multiple="true"
                  :headers="upload.headers"
                  :action="upload.url + '?updateSupport=' + upload.updateSupport"
                  @change="importExcelHandleChange"
                >
                  <p class="ant-upload-drag-icon">
                    <a-icon type="inbox" />
                  </p>
                  <p class="ant-upload-text">
                    请将文件拖拽到此处上传❥(^_-)
                  </p>
                  <p class="ant-upload-hint">
                    支持单个或批量上传，也可以点击后选择文件上传
                  </p>
                </a-upload-dragger>
              </a-modal>
            </a-col>
          </a-row>
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import { listUser, resetPwd, delUser, changeUserStatus } from '@/api/system/user'
import { STable } from '@/components'
import CreateForm from './modules/CreateForm'
import DeptTree from './modules/DeptTree'
import ResetPassword from './modules/ResetPassword'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { treeselect } from '@/api/system/dept'

export default {
  name: 'User',
  components: {
    PageHeaderWrapper,
    STable,
    CreateForm,
    ResetPassword,
    DeptTree
  },
  data () {
    return {
      // 部门树选项
      deptOptions: [{
        id: 0,
        label: '暂无部门',
        children: []
      }],
      // 导入excel
      excelVisible: false,
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '导入Excel',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + storage.get(ACCESS_TOKEN) },
        // 上传的地址
        url: process.env.VUE_APP_API_BASE_URL + '/system/user/importData'
      },
      // 重置密码
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
        // status: '0'
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
  created () {
    this.getList()
    this.getTreeselect()
  },
  methods: {
    /** pageSize 变化的回调 */
    onShowSizeChange (current, pageSize) {
      this.pageSize = pageSize
      this.current = current
      this.getList()
    },
    /** 页码改变的回调 */
    currentPageChange (current, pageSize) {
      this.pageSize = pageSize
      this.current = current
      this.getList()
    },
    /** 查询用户列表 */
    getList () {
      this.tableLoading = true
      const params = Object.assign({}, this.queryParam)
      // 与分页绑定
      params.pageNum = this.current
      params.pageSize = this.pageSize
      if (params.status === '-1') {
        delete params.status
      }
      listUser(Object.assign(params))
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
      this.queryParam = {}
      this.getList()
    },
    // 删除
    deleteRecord (record) {
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${record.nickName} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          that.handleDelete([record.userId], {
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
    // 发送删除行为
    handleDelete (ids, callback) {
      if (ids.length > 0) {
        delUser(ids).then(response => {
          if (response.code === 200) {
            this.$message.success('删除成功!')
            this.getList()
          } else {
            this.$$message.error(response.msg)
          }
        })
      }
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    // 显示新增/修改框
    showCreateForm (data, readOnly) {
      this.$refs.createModal.show(data, readOnly)
      // this.visible = true
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.queryParam.params = {}
      this.queryParam.params['beginTime'] = dateString[0]
      this.queryParam.params['endTime'] = dateString[1]
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
      this.resetPasswordConfirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
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
          this.resetPasswordConfirmLoading = false
        }
      })
    },
    // 导入导出excel
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/user/export', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    /** 下载模板操作 */
    importTemplate () {
      this.download('system/user/importTemplate', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    /** 导入excel窗体关闭 */
    importExcelHandleCancel (e) {
      console.log('Clicked cancel button')
      this.excelVisible = false
      // 关闭后刷新列表
      this.getList()
    },
    /** 导入excel窗体开启 */
    importExcelHandleOpen (e) {
      console.log('Clicked cancel button')
      this.excelVisible = true
    },
    /** 导入excel */
    importExcelHandleChange (info) {
      const status = info.file.status
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        this.$message.success(`${info.file.name}: ${info.file.response.msg}`)
      } else if (status === 'error') {
        this.$message.error(`${info.file.name}: ${info.file.response.msg}`)
      }
    },
    clickDeptNode (deptId) {
      this.queryParam.deptId = deptId
      this.getList()
    },
    /** 查询部门下拉树结构 */
    getTreeselect () {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    /* 任务状态修改 */
    confirmHandleStatus (row) {
      row.status = row.status === '0' ? '1' : '0'
      const text = row.status === '0' ? '启用' : '停用'
      changeUserStatus(row.userId, row.status)
      .then(() => {
        this.$message.success(
          text + '成功',
          3
        )
      }).catch(function () {
        this.$message.error(
          text + '发生异常',
          3
        )
      })
    },
    cancelHandleStatus (row) {
    }
  }
}
</script>
