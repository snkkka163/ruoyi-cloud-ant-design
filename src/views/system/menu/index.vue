<template>
  <page-header-wrapper>
    <template v-slot:content>
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
      </a-table>
    </template>
  </page-header-wrapper>
</template>

<script>
import { listMenu } from '@/api/system/menu'
export default {
  name: 'Menu',
  data () {
    return {
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
          dataIndex: 'icon'
        },
        {
          title: '排序',
          dataIndex: 'roleKey'
        },
        {
          title: '权限标识',
          dataIndex: 'orderNum'
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
    }
  }
}
</script>
