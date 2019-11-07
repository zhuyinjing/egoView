<template>
  <div class="">
      <div class="">
        <!-- <a :href="fileUrl" download ref="downloadA"></a>

        <el-button size="mini" type="primary" icon="el-icon-download" plain @click="exportTable()">导出</el-button> <br><br> -->

        <div class="">
          <table id="patients" width="100%" cellspacing="0" class="display table table-striped table-bordered">
              <thead>
              <tr>
                <th>start</th>
                <th>end</th>
                <th>vcfId</th>
                <th>操作</th>
              </tr>
              </thead>
          </table>
        </div>
      </div>
      <div class="clear">

      </div>

      </div>
</template>

<script>

export default {
  data () {
    return {
      fileUrl: '',
    }
  },
  components: {
  },
  mounted () {
    this.initTable()
  },
  methods: {
    initTable () {
      let self = this
      $(document).ready(function() {
          self.table = $('#patients').DataTable({
              "pageLength": 25,
              "bPaginate" : true,//分页工具条显示
              //"sPaginationType" : "full_numbers",//分页工具条样式
              "bStateSave" : true, //是否打开客户端状态记录功能,此功能在ajax刷新纪录的时候不会将个性化设定回复为初始化状态
              "bScrollCollapse" : true, //当显示的数据不足以支撑表格的默认的高度
              "bLengthChange" : true, //每页显示的记录数
              "bFilter" : false, //搜索栏
              "bSort" : false, //是否支持排序功能
              "bInfo" : true, //显示表格信息
              "bAutoWidth" : true, //自适应宽度
              "bJQueryUI" : false,//是否开启主题
              "bDestroy" : true,
              "bProcessing" : true, //开启读取服务器数据时显示正在加载中……特别是大数据量的时候，开启此功能比较好
              "bServerSide" : true,//服务器处理分页，默认是false，需要服务器处理，必须true
              "sAjaxDataProp" : "aData",
              //通过ajax实现分页的url路径
              "sAjaxSource" : "/admin/get_VCF_list?p=" + 1,
              "aoColumns" : [{
                  "mDataProp" : "start"
              }, {
                  "mDataProp" : "info.END"
              }, {
                  "mDataProp" : "vcfId"
              }, {
                  "mDataProp" : "start",
                  "mRender" : function(data, type, full) {
                    return '<button id="plotBtn" class="el-button el-button--primary el-button--mini">svg</button>'
                  }
              }],
          });

          $('#patients tbody').on( 'click', '#plotBtn', function () {
            var row = $(this).parents('tr')[0]
            var data = $("#patients").dataTable().fnGetData(row)
            sessionStorage.setItem('plot_data', JSON.stringify(data))
            self.$router.push({'name': 'plot'})
          })

        })
      },
      exportTable () {
        this.axios.get("/server/export_gene_counts?p=" + this.$store.state.projectId + "&username=" + this.$store.state.username +  "&geneName=" + this.textareaGeneName.replace(/\s/g,'') +  "&geneId=" + this.textareaGeneId.replace(/\s/g,'')).then(res => {
          this.fileUrl = res.data.filePath
          setTimeout(() => {
            this.$refs.downloadA.click()
          }, 0)
        })
      },
  }
}
</script>

<style scoped="true">
.clear {
  clear: both;
}
.labelStyle {
  display: inline-block;
  width: 95px;
  text-align: end;
}
.label-font {
  font-size: 14px;
}
</style>
