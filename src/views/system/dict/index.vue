<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
                <a-row :gutter="48">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="字典名称">
                      <a-input placeholder="请输入" v-model="queryParams.dictName"/>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="字典类型">
                      <a-input placeholder="请输入" v-model="queryParams.dictType"/>
                    </a-form-item>
                  </a-col>
                  <template v-if="advanced">
                    <a-col :md="8" :sm="24">
                      <a-form-item label="状态">
                        <a-radio-group button-style="solid" v-model="queryParams.status">
                          <a-radio-button
                            v-for="dict in statusOptions"
                            :key="dict.dictValue"
                            :value="dict.dictValue">
                              {{ dict.dictLabel }}
                          </a-radio-button>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                    <a-col :md="8" :sm="24">
                      <a-form-item label="创建时间">
                          <a-range-picker @change="rangePicker" />
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
            <a-menu-item key="export-data1" @click="handleExport">导出Excel</a-menu-item>
            <a-menu-item key="export-data2" @click="handleClearCache">清理缓存</a-menu-item>
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
        :data-source="typeList"
        :row-selection="rowSelection"
        row-key="dictId"
        :pagination="false"
      >
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
        <!-- 插槽指向状态 -->
        <span slot="status" slot-scope="text, record">
          {{ statusFormat(record) }}
        </span>
        <!-- 插槽指向状态 -->
        <span slot="dictType" slot-scope="text, record">
          <router-link :to="'/dict/type/data/' + record.dictId" class="link-type">
            <span>{{ record.dictType }}</span>
          </router-link>
        </span>
        <!-- 展开子树 -->
        <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
            <sub-data-table :parendDictId="record.dictId" />
        </p>
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
      <!-- 创建/编辑字典,单独封装了组件 -->
      <create-form
        ref="createModal"
        @handle-success="handleOk"
      />
    </template>
  </page-header-wrapper>
</template>

<script>
import { delType, listType, clearCache } from '@/api/system/dict/type'
import CreateForm from './modules/CreateForm'
import SubDataTable from './modules/subDataTable'
export default {
  name: 'Dict',
  components: {
    CreateForm,
    SubDataTable
  },
  data () {
    return {
       // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 控制搜索展开
      advanced: false,
      // 日期选择
      dateRange: [],
      // 查询参数
      queryParams: {
        current: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // 状态字典
      statusOptions: [],
      // 字典表格数据
      typeList: [],
      tableLoading: false,
      // 表格字段
      columns: [
        {
          title: '字典编号',
          dataIndex: 'dictId',
          align: 'center'
        },
        {
          title: '字典名称',
          dataIndex: 'dictName',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '字典类型',
          dataIndex: 'dictType',
          ellipsis: true,
          scopedSlots: { customRender: 'dictType' },
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'status',
          ellipsis: true,
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '备注',
          dataIndex: 'remark',
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
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询字典类型列表 */
    getList () {
      this.tableLoading = true
      listType(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.typeList = response.rows
          this.total = response.total
          this.tableLoading = false
        }
      )
    },
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    // 字典状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.dateRange = dateString
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.current = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = []
      this.queryParams = {
        current: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const dictId = row.dictId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 字典编号为${dictId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delType(dictId).then(response => {
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
      const dictIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 字典编号为${dictIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delType(dictIds).then(response => {
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
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/dict/type/export', {
        ...this.queryParams
      }, `type_${new Date().getTime()}.xlsx`)
    },
    /** 清理缓存按钮操作 */
    handleClearCache () {
      clearCache().then(response => {
        this.$message.success('清除成功!')
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
