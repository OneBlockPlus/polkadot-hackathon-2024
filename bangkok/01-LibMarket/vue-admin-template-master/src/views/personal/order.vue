<template>
  <div>
    <el-table
      :data="tableData.filter(data => !search || data.user.toLowerCase().includes(search.toLowerCase()))"
      style="width: 100%">
      <el-table-column
        label="OrderNumber"
        prop="OrderNumber">
      </el-table-column>
      <el-table-column
        label="price"
        prop="price">
      </el-table-column>
      <el-table-column
        label="user"
        prop="user">
      </el-table-column>
      <el-table-column
        label="address"
        prop="address">
      </el-table-column>
      <el-table-column
        align="right">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="search"
            size="mini"
            placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">View</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹出层 -->
    <el-dialog :visible.sync="dialogVisible" title="订单详细信息">
      <p><strong>Order Number:</strong> {{ selectedItem.OrderNumber }}</p>
      <p><strong>Price:</strong> {{ selectedItem.price }}</p>
      <p><strong>User:</strong> {{ selectedItem.user }}</p>
      <p><strong>Address:</strong> {{ selectedItem.address }}</p>

      <el-button type="primary" @click="modifyAddress">修改地址</el-button>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [{
        OrderNumber: '2016-05-02',
        price: '100',
        user: '李四',
        address: '上海市普陀区金沙江路 1518 弄'
      },{
        OrderNumber: '2016-05-02',
        price: '100',
        user: '李四',
        address: '上海市普陀区金沙江路 1518 弄'
      },{
        OrderNumber: '2016-05-02',
        price: '100',
        user: '李四',
        address: '上海市普陀区金沙江路 1518 弄'
      },{
        OrderNumber: '2016-05-02',
        price: '100',
        user: '李四',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        OrderNumber: '2016-05-02',
        price: '200',
        user: '王小虎',
        address: '北京市海淀区中关村大街 123 号'
      }],
      search: '',
      dialogVisible: false,  // 控制弹出层显示与隐藏
      selectedItem: {}       // 存储当前选中的订单数据
    };
  },
  methods: {
    handleEdit(index, row) {
      this.selectedItem = row;
      this.dialogVisible = true;
    },
    modifyAddress() {
      // 处理修改地址的逻辑，例如打开一个输入框让用户输入新地址
      this.$prompt('请输入新的地址', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '地址不能为空'
      }).then(({ value }) => {
        this.selectedItem.address = value;
        this.$message({
          type: 'success',
          message: '地址已更新'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改'
        });
      });
    }
  }
}
</script>
