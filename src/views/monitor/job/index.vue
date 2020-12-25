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
                    <a-form-item label="任务状态">
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
            <a-button @click="$refs.createModal.show()" type="primary" ghost>新增</a-button>
            <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
            <a-button @click="handleJobLog">日志</a-button>
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item key="export-data" @click="handleExport">导出Excel</a-menu-item>
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
            row-key="jobId"
            :pagination="false"
          >
            <span slot="jobGroup" slot-scope="text, record">
              {{ jobGroupFormat(record) }}
            </span>
            <span slot="status" slot-scope="text, record">
              <a-popconfirm
                ok-text="是"
                cancel-text="否"
                @confirm="confirmHandleStatus(record)"
                @cancel="cancelHandleStatus(record)"
              >
                <span slot="title">确认<b>{{ record.status === '1' ? '启用' : '停用' }}</b>{{ record.jobName }}的任务吗?</span>
                <a-switch checked-children="开" un-checked-children="关" :checked="record.status == 0" />
              </a-popconfirm>
            </span>

            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a-popconfirm
                ok-text="是"
                cancel-text="否"
                @confirm="confirmHandleRun(record)"
                @cancel="cancelHandleRun(record)"
              >
                <span slot="title">确认执行一次{{ record.jobName }}的任务吗?</span>
                <a>执行一次 </a>
              </a-popconfirm>
              <a-divider type="vertical" />
              <a-dropdown>
                <a class="ant-dropdown-link">
                  更多 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;" @click="$refs.createModal.show(record)">编辑</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" @click="$refs.detailDrawer.show(record)">详细</a>
                  </a-menu-item>
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
          <!-- 详细 -->
          <detail-drawer ref="detailDrawer" />
          <!-- 新增/修改 -->
          <create-form
            ref="createModal"
            @handle-success="handleOk"
          />
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { changeJobStatus, delJob, listJob, runJob } from '@/api/monitor/job'
import DetailDrawer from './modules/DetailDrawer'
import CreateForm from './modules/CreateForm'
export default {
  components: { DetailDrawer, CreateForm },
  name: 'Job',
  data () {
    return {
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 表格数据
      list: [],
      // 表格加载
      tableLoading: false,
      // 高级搜索 展开/关闭
      advanced: false,
      columns: [
        {
          title: '任务编号',
          dataIndex: 'jobId',
          align: 'center'
        },
        {
          title: '任务名称',
          dataIndex: 'jobName',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '任务组名',
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
          title: 'cron执行表达式',
          dataIndex: 'cronExpression',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
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
      },
      // 日期范围
      dateRange: [],
      queryParams: {
        current: 1,
        pageSize: 10,
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      },
      // 状态数据字典
      statusOptions: [],
      jobGroupOptions: []
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
    /** 查询定时任务列表 */
    getList () {
      this.tableLoading = true
      listJob(this.queryParams).then(response => {
          this.list = response.rows
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
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    /* 任务状态修改 */
    confirmHandleStatus (row) {
      row.status = row.status === '0' ? '1' : '0'
      const text = row.status === '0' ? '启用' : '停用'
      changeJobStatus(row.jobId, row.status)
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
    },
    /* 立即执行一次 */
    confirmHandleRun (row) {
      runJob(row.jobId, row.jobGroup)
      .then(() => {
        this.$message.success(
          '执行成功',
          3
        )
      }).catch(function () {
        this.$message.error(
          '发生异常',
          3
        )
      })
    },
    cancelHandleRun (row) {
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const jobId = row.jobId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 任务编号为${jobId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delJob(jobId).then(response => {
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
      const jobIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 任务编号为${jobIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delJob(jobIds).then(response => {
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
      this.download('schedule/job/export', {
        ...this.queryParams
      }, `job_${new Date().getTime()}.xlsx`)
    },
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /** 任务日志列表查询 */
    handleJobLog () {
      this.$router.push({ path: '/job/log' })
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
