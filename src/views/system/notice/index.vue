<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
                <a-row :gutter="48">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="公告标题">
                      <a-input placeholder="请输入" v-model="queryParams.noticeTitle"/>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="操作人员">
                      <a-input placeholder="请输入" v-model="queryParams.createBy"/>
                    </a-form-item>
                  </a-col>
                  <template v-if="advanced">
                    <a-col :md="8" :sm="24">
                      <a-form-item label="类型">
                        <a-radio-group button-style="solid" v-model="queryParams.noticeType">
                          <a-radio-button
                            v-for="dict in typeOptions"
                            :key="dict.dictValue"
                            :value="dict.dictValue">
                              {{ dict.dictLabel }}
                          </a-radio-button>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                  </template>
                  <a-col :md="8" :sm="24">
                    <span class="table-page-search-submitButtons">
                      <a-button @click="handleQuery" type="primary">查询</a-button>
                      <a-button @click="resetQuery" style="margin-left: 8px">重置</a-button>
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
        <a-button @click="$refs.createModal.show()" type="primary" ghost>新增</a-button>
        <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="export-data">暂无更多操作</a-menu-item>
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
        :data-source="noticeList"
        :row-selection="rowSelection"
        row-key="noticeId"
        :pagination="false"
      >
        <span slot="noticeType" slot-scope="text, record">
          {{ typeFormat(record) }}
        </span>
        <span slot="status" slot-scope="text, record">
          {{ statusFormat(record) }}
        </span>

        <!-- 更多选择 -->
        <span slot="action" slot-scope="text, record">
          <a @click="$refs.createModal.show(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDelete(record)">删除</a>
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
      <!-- 创建/编辑公告,单独封装了组件 -->
      <create-form
        ref="createModal"
        @handle-success="handleOk"
      />
    </template>
  </page-header-wrapper>
</template>

<script>
import { delNotice, listNotice } from '@/api/system/notice'
import CreateForm from './modules/CreateForm'
// import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
export default {
  name: 'Notice',
  components: {
    CreateForm
  },
  data () {
    return {
      // 高级搜索 展开/关闭
      advanced: false,
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 公告表格数据
      noticeList: [],
      // 类型数据字典
      statusOptions: [],
      // 状态数据字典
      typeOptions: [],
      // 表格等待
      tableLoading: false,
      columns: [
        {
          title: '公告编号',
          dataIndex: 'noticeId',
          align: 'center'
        },
        {
          title: '公告标题',
          dataIndex: 'noticeTitle',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '公告类型',
          dataIndex: 'noticeType',
          scopedSlots: { customRender: 'noticeType' },
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '创建者',
          dataIndex: 'createBy',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          scopedSlots: { customRender: 'createTime' },
          align: 'center'
        },
        {
          title: '操作',
          width: '150',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        createBy: undefined,
        status: undefined
      },
      // 表格多选
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
    this.getDicts('sys_notice_status').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_notice_type').then(response => {
      this.typeOptions = response.data
    })
  },
  methods: {
    /** 查询公告列表 */
    getList () {
      this.tableLoading = true
      listNotice(this.queryParams).then(response => {
        this.noticeList = response.rows
        this.total = response.total
        this.tableLoading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        createBy: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    // 公告状态字典翻译
    statusFormat (row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 公告类型字典翻译
    typeFormat (row) {
      return this.selectDictLabel(this.typeOptions, row.noticeType)
    },
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const noticeId = row.noticeId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 角色编号为${noticeId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delNotice(noticeId).then(response => {
            if (response.code === 200) {
              that.$message.success('删除成功!')
              that.getList()
            } else {
              that.$message.error(response.msg)
            }
          })
        }
      })
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch (ids) {
      const noticeIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 角色编号为${noticeIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delNotice(noticeIds).then(response => {
            if (response.code === 200) {
              that.$message.success('删除成功!')
              that.getList()
            } else {
              that.$message.error(response.msg)
            }
          })
        }
      })
    },
    /** pageSize 变化的回调 */
    onShowSizeChange (current, pageSize) {
      this.current = current
      this.pageSize = pageSize
      this.queryParams.pageSize = pageSize
      this.queryParams.pageNum = current
      this.getList()
    },
    /** 页码改变的回调 */
    currentPageChange (current, pageSize) {
      this.current = current
      this.pageSize = pageSize
      this.queryParams.pageSize = pageSize
      this.queryParams.pageNum = current
      this.getList()
    }
  }
}
</script>
