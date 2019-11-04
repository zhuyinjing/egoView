<template>
  <div class="wrap">
    <el-container class="wrap">
      <el-aside width="200px">
        <sidebar></sidebar>
      </el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main>
          Main
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import sidebar from './components/sidebar'
export default {
  name: 'App',
  components: {
    sidebar
  },
}
</script>

<style scoped="true">
.wrap {
  width: 100%;
  height: 100%;
}
.el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
    line-height: 200px;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }

  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>
<style media="screen">

</style>
