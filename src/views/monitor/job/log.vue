<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
                <a-row :gutter="48">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="任务名称">
                      <a-input placeholder="请输入" v-model="queryParams.jobName"/>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="任务组名">
                      <a-select button-style="solid" v-model="queryParams.jobGroup">
                          <a-select-option
                            v-for="dict in jobGroupOptions"
                            :key="dict.dictValue"
                            :value="dict.dictValue">
                              {{ dict.dictLabel }}
                          </a-select-option>
                        </a-select>
                    </a-form-item>
                  </a-col>
                  <template v-if="advanced">
                    <a-col :md="8" :sm="24">
                      <a-form-item label="执行状态">
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
                      <a-form-item label="执行时间">
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
            <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item key="export-data1" @click="handleExport">导出Excel</a-menu-item>
                <a-menu-item key="export-data2" @click="handleClearCache">清空</a-menu-item>
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
            :data-source="jobLogList"
            :row-selection="rowSelection"
            row-key="jobLogId"
            :pagination="false"
          >
            <span slot="jobGroup" slot-scope="text, record">
              {{ jobGroupFormat(record) }}
            </span>
            <span slot="status" slot-scope="text, record">
              {{ statusFormat(record) }}
            </span>
            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a @click="$refs.logDetailDrawer.show(record)">详细</a>
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
          <log-detail-drawer ref='logDetailDrawer' />
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { cleanJobLog, delJobLog, listJobLog } from '@/api/monitor/jobLog'
import LogDetailDrawer from './modules/LogDetailDrawer'
export default {
  name: 'JobLog',
  components: { LogDetailDrawer },
  data () {
    return {
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 高级搜索 展开/关闭
      advanced: false,
      tableLoading: false,
      // 调度日志表格数据
      jobLogList: [],
      // 执行状态字典
      statusOptions: [],
      // 任务组名字典
      jobGroupOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      },
      // 日期范围
      dateRange: [],
      columns: [
        {
          title: '日志编号',
          dataIndex: 'jobLogId',
          align: 'center'
        },
        {
          title: '系统模块',
          dataIndex: 'jobName',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '操作类型',
          dataIndex: 'jobGroup',
          scopedSlots: { customRender: 'jobGroup' },
          align: 'center'
        },
        {
          title: '调用目标字符串',
          dataIndex: 'invokeTarget',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '日志信息',
          dataIndex: 'jobMessage',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '执行状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '执行时间',
          dataIndex: 'createTime',
          align: 'center'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          align: 'center'
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
    this.getDicts('sys_job_status').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_job_group').then(response => {
      this.jobGroupOptions = response.data
    })
  },
  methods: {
    /** 查询调度日志列表 */
    getList () {
      this.tableLoading = true
      listJobLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.jobLogList = response.rows
          this.total = response.total
          this.tableLoading = false
        }
      )
    },
    // 执行状态字典翻译
    statusFormat (row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 任务组名字典翻译
    jobGroupFormat (row) {
      return this.selectDictLabel(this.jobGroupOptions, row.jobGroup)
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.dateRange = dateString
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
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
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch (ids) {
      const jobLogIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 角色编号为${jobLogIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delJobLog(jobLogIds).then(response => {
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
    /** 清理缓存按钮操作 */
    handleClearCache () {
      cleanJobLog().then(response => {
        this.$message.success('清除成功!')
        this.getList()
      })
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('schedule/job/log/export', {
        ...this.queryParams
      }, `log_${new Date().getTime()}.xlsx`)
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
