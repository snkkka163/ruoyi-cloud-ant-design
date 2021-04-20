<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="系统模块">
                    <a-input placeholder="请输入" v-model="queryParams.title"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="操作人员">
                    <a-input placeholder="请输入" v-model="queryParams.operName"/>
                  </a-form-item>
                </a-col>
                <template v-if="advanced">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="类型">
                      <a-select button-style="solid" v-model="queryParams.businessType">
                        <a-select-option
                          v-for="dict in typeOptions"
                          :key="dict.dictValue"
                          :value="dict.dictValue">
                          {{ dict.dictLabel }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="状态">
                      <a-select button-style="solid" v-model="queryParams.status">
                        <a-select-option
                          v-for="dict in statusOptions"
                          :key="dict.dictValue"
                          :value="dict.dictValue">
                          {{ dict.dictLabel }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="操作时间">
                      <!--  @change="onChange" -->
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
          <div class="table-page-operator-wrapper">
            <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0" v-hasPermi="['system:operlog:remove']">删除</a-button>
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item key="export-data" @click="handleExport" v-hasPermi="['system:config:export']">导出Excel</a-menu-item>
                <a-menu-item key="clear-data" @click="handleClean" v-hasPermi="['system:operlog:remove']">清除</a-menu-item>
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
            :data-source="list"
            :row-selection="rowSelection"
            row-key="operId"
            :pagination="false"
          >
            <span slot="businessType" slot-scope="text, record">
              {{ typeFormat(record) }}
            </span>
            <span slot="status" slot-scope="text, record">
              {{ statusFormat(record) }}
            </span>

            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a @click="$refs.detailDrawer.show(record)" v-hasPermi="['system:operlog:query']">详细</a>
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
          <!-- 详细 -->
          <detail-drawer ref="detailDrawer" />
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { cleanOperlog, delOperlog, list } from '@/api/system/operlog'
import DetailDrawer from './modules/DetailDrawer'
export default {
  components: { DetailDrawer },
  name: 'Operlog',
  data () {
    return {
      // 高级搜索 展开/关闭
      advanced: false,
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 表格数据
      list: [],
      // 类型数据字典
      typeOptions: [],
      // 类型数据字典
      statusOptions: [],
      // 表格等待
      tableLoading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        operName: undefined,
        businessType: undefined,
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
      },
      // 日期范围
      dateRange: [],
      // 表格属性
      columns: [
        {
          title: '日志编号',
          dataIndex: 'operId',
          align: 'center'
        },
        {
          title: '系统模块',
          dataIndex: 'title',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '操作类型',
          dataIndex: 'businessType',
          scopedSlots: { customRender: 'businessType' },
          align: 'center'
        },
        {
          title: '请求方式',
          dataIndex: 'requestMethod',
          scopedSlots: { customRender: 'requestMethod' },
          align: 'center'
        },
        {
          title: '操作人员',
          dataIndex: 'operName',
          align: 'center'
        },
        {
          title: '主机',
          dataIndex: 'operIp',
          align: 'center'
        },
        {
          title: '操作状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '操作日期',
          dataIndex: 'operTime',
          scopedSlots: { customRender: 'operTime' },
          align: 'center'
        },
        {
          title: '操作',
          width: '150',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  created () {
    this.getList()
    this.getDicts('sys_oper_type').then(response => {
      this.typeOptions = response.data
    })
    this.getDicts('sys_common_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询登录日志 */
    getList () {
      this.tableLoading = true
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.list = response.rows
          this.total = response.total
          this.tableLoading = false
        }
      )
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    // 操作日志状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 操作日志类型字典翻译
    typeFormat (row, column) {
      return this.selectDictLabel(this.typeOptions, row.businessType)
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        operName: undefined,
        businessType: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.dateRange = dateString
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch (ids) {
      const operIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 操作日志编号为${operIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delOperlog(operIds).then(response => {
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
    /** 清空按钮操作 */
    handleClean () {
      const that = this
      this.$confirm({
        title: '警告',
        content: `是否确认清空所有操作日志数据项?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          cleanOperlog().then(response => {
            if (response.code === 200) {
              that.$message.success('清空成功!')
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
      this.download('system/operlog/export', {
        ...this.queryParams
      }, `operlog_${new Date().getTime()}.xlsx`)
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
