<template>
  <el-container style="height: 500px; border: 1px solid #eee">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu :default-openeds="['1', '3']">
        <!-- 菜单代码保持不变 -->
        <el-submenu index="1">
          <template slot="title"><i class="el-icon-message"></i></template>
          <el-menu-item-group>
            <template slot="title">分组一</template>
            <el-menu-item index="1-1">选项1</el-menu-item>
            <el-menu-item index="1-2">选项2</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="分组2">
            <el-menu-item index="1-3">选项3</el-menu-item>
          </el-menu-item-group>
          <el-submenu index="1-4">
            <template slot="title">选项4</template>
            <el-menu-item index="1-4-1">选项4-1</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-menu"></i>导航二</template>
          <el-menu-item-group>
            <template slot="title">分组一</template>
            <el-menu-item index="2-1">选项1</el-menu-item>
            <el-menu-item index="2-2">选项2</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="分组2">
            <el-menu-item index="2-3">选项3</el-menu-item>
          </el-menu-item-group>
          <el-submenu index="2-4">
            <template slot="title">选项4</template>
            <el-menu-item index="2-4-1">选项4-1</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title"><i class="el-icon-setting"></i>导航三</template>
          <el-menu-item-group>
            <template slot="title">分组一</template>
          </el-menu-item-group>
          <el-menu-item-group title="分组2">
          </el-menu-item-group>
          <el-submenu index="3-4">
          </el-submenu>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
      </el-header>
      <el-main>
        <div class="card-container">
          <el-card v-for="(item, index) in tableData" :key="index" class="card-item">
            <div class="card-content">
              <p><strong>commodity:</strong> {{ item.date }}</p>
              <p><strong>Sellers:</strong> {{ item.name }}</p>
              <p><strong>Detailed description:</strong> {{ item.address }}</p>
              <el-button type="text" @click="handleCardClick(item)">查看更多</el-button>
            </div>
          </el-card>
        </div>

        <!-- 弹出层 -->
        <el-dialog :visible.sync="dialogVisible" title="详细信息">
          <p><strong>commodity:</strong> {{ selectedItem.date }}</p>
          <p><strong>Sellers:</strong> {{ selectedItem.name }}</p>
          <p><strong>Detailed description:</strong> {{ selectedItem.address }}</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleChatClick">聊天</el-button>
          </span>
        </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.card-item {
  width: calc(25% - 20px);
  box-sizing: border-box;
}

.card-content {
  text-align: center;
}
</style>

<script>
export default {
  data() {
    const item = {
      date: '2016-05-02',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄'
    };
    return {
      tableData: Array(20).fill(item),
      dialogVisible: false,  // 控制弹出层显示与隐藏
      selectedItem: {}       // 存储当前选中的卡片数据
    };
  },
  methods: {
    handleCardClick(item) {
      console.log('查看更多按钮被点击:', item); // 调试输出
      this.selectedItem = item;
      this.dialogVisible = true;
      console.log('弹出层状态:', this.dialogVisible); // 调试输出
    },
    handleChatClick() {
      // 处理聊天按钮点击事件的逻辑，例如打开聊天窗口
      this.$message('聊天功能暂未实现');
    }
  }
};
</script>
