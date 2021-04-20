<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="菜单名称">
                    <a-input placeholder="请输入" v-model="queryParams.menuName"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="状态">
                    <a-select placeholder="请选择" v-model="queryParams.status">
                      <a-select-option value="0">正常</a-select-option>
                      <a-select-option value="1">禁用</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <span class="table-page-search-submitButtons">
                    <a-button @click="handleQuery" type="primary">查询</a-button>
                    <a-button @click="resetQuery" style="margin-left: 8px">重置</a-button>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <div class="table-page-operator-wrapper">
            <a-button @click="$refs.createModal.show()" type="primary" v-hasPermi="['system:menu:add']" ghost>新增</a-button>
          </div>
          <!-- 表格 -->
          <a-table
            ref="table"
            :columns="columns"
            :loading="tableLoading"
            :data-source="menuList"
            :row-selection="rowSelection"
            row-key="menuId"
            :pagination="false"
          >
            <!-- 插槽指向菜单图标 -->
            <span slot="icon" slot-scope="text">
              <a-icon :component="all[text + 'Icon']" :style="{height: '30px', width: '16px', position: 'relative', top: '1px'}" />{{ text }}
            </span>
            <!-- 插槽指向状态 -->
            <span slot="status" slot-scope="text">
              <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
            </span>
            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a @click="$refs.createModal.show(record)" v-hasPermi="['system:menu:edit']">编辑</a>
              <a-divider type="vertical" />
              <a-dropdown>
                <a class="ant-dropdown-link">
                  更多 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;" @click="handleDelete(record)" v-hasPermi="['system:menu:remove']">删除</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </span>
          </a-table>
          <!-- 创建/编辑菜单,单独封装了组件 -->
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
import { delMenu, listMenu } from '@/api/system/menu'
import CreateForm from './modules/CreateForm'
import all from '@/core/icons'
const statusMap = {
  0: {
    status: 'processing',
    text: '正常'
  },
  1: {
    status: 'default',
    text: '停用'
  }
}
export default {
  name: 'Menu',
  components: {
    CreateForm
  },
  data () {
    return {
      // 图标选择器
      all,
      tableLoading: false,
      // 表格树数据:
      menuList: [],
      // 表格属性
      columns: [
        {
          title: '菜单名称',
          dataIndex: 'menuName',
          scopedSlots: { customRender: 'menuName' }
        },
        {
          title: '图标',
          dataIndex: 'icon',
          scopedSlots: { customRender: 'icon' }
        },
        {
          title: '排序',
          dataIndex: 'orderNum'
        },
        {
          title: '权限标识',
          dataIndex: 'perms'
        },
        {
          title: '组件路径',
          dataIndex: 'component'
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        menuName: undefined,
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
  methods: {
    /** 查询菜单列表 */
    getList () {
      this.tableLoading = true
      listMenu(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data, 'menuId')
        this.tableLoading = false
      })
    },
    /** 转换菜单数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect () {
      listMenu().then(response => {
        this.menuOptions = []
        const menu = { menuId: 0, menuName: '主类目', children: [] }
        menu.children = this.handleTree(response.data, 'menuId')
        this.menuOptions.push(menu)
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
        menuName: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const menuId = row.menuId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 菜单编号为${menuId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delMenu(menuId).then(response => {
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
    // 新增/修改框事件
    handleOk () {
      this.getList()
    }
  }
}
</script>
