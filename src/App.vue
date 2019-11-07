<template>
  <el-container>
  <el-header>egoView</el-header>
  <el-main>
    <router-view />
  </el-main>
</el-container>
</template>

<script>
export default {
  name: 'App',
  components: {
  },
}
</script>

<style scoped="true">
body > .el-container {
    margin: 0 !important;
    height: 100%;
  }
.el-header, .el-footer {
    background-color: #eee;
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
    line-height: 200px;
  }

  .el-main {
    height: calc(100% - 60px);
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
