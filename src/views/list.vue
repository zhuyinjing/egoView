<template>
  <div class="">
      <div class="">
        <!-- <a :href="fileUrl" download ref="downloadA"></a>

        <el-button size="mini" type="primary" icon="el-icon-download" plain @click="exportTable()">导出</el-button> <br><br> -->

        <div class="">
          <table id="patients" width="100%" cellspacing="0" class="display table table-striped table-bordered">
              <thead>
              <tr>
                <th></th>
                <th>alt</th>
                <th>chromId</th>
                <th>filter</th>
                <th>start</th>
                <th>qual</th>
                <th>reference</th>
                <th>sampleName</th>
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
          var table = $('#patients').DataTable({
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
                  "class": "details-control",
                  "orderable": false,
                  "mDataProp": 1,
                  "defaultContent": ""
              },{
                  "mDataProp" : "alt",
                  "mRender" : function(data, type, full) {
                    return '<xmp>' + data + '</xmp>'
                  }
              }, {
                  "mDataProp" : "chromId"
              }, {
                  "mDataProp" : "filter"
              }, {
                  "mDataProp" : "start"
              }, {
                  "mDataProp" : "qual"
              }, {
                  "mDataProp" : "reference"
              }, {
                  "mDataProp" : "sampleName"
              }, {
                  "mDataProp" : "vcfId"
              }, {
                  "mDataProp" : "start",
                  "mRender" : function(data, type, full) {
                    return '<button id="plotBtn" class="el-button el-button--primary el-button--mini">svg</button>'
                  }
              }],
          });

          function format ( d ) {
            delete d.info.RNAMES  // 不需要显示此字段
            let keys = Object.keys(d.info)
            // let str = keys.reduce((pre, cur) => pre.concat(`<div class='detailDiv'>${cur}: ${d.info[cur]}</div>`), "")
            let str = keys.reduce((pre, cur) => pre.concat(`<td class='bgColor'>${cur}</td>`), "<table class='gridtable'><tr>")
            str = str.concat(keys.reduce((pre, cur) => pre.concat(`<td>${d.info[cur]}</td>`), "<tr>"))
            str = str.concat("</tr></table>")
            return str
          }

        var detailRows = [];
        // 防止报 _detailsShow undefined 错误
        $('#patients tbody').off('click', 'tr td.details-control');
        $('#patients tbody').on( 'click', 'tr td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = table.row( tr );
            var idx = $.inArray( tr.attr('id'), detailRows );

            if ( row.child.isShown() ) {
                tr.removeClass( 'details' );
                row.child.hide();

                // Remove from the 'open' array
                detailRows.splice( idx, 1 );
            }
            else {
                tr.addClass( 'details' );
                row.child( format( row.data() ) ).show();

                // Add to the 'open' array
                if ( idx === -1 ) {
                    detailRows.push( tr.attr('id') );
                }
            }
        });

        table.on( 'draw', function () {
            $.each( detailRows, function ( i, id ) {
                $('#'+id+' td.details-control').trigger( 'click' );
            } );
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
</style>
<style>
td.details-control {
    background: url('../assets/img/details_open.png') no-repeat center center;
    cursor: pointer;
}
tr.details td.details-control {
    background: url('../assets/img/details_close.png') no-repeat center center;
}
.detailDiv {
  padding: 5px 35px;
  text-align: left;
}
table.gridtable {
    width: 100%;
    text-align: center;
    font-size:14px;
    color:#333333;
    border-width: 1px;
    border-color: #ebeef5;
    border-collapse: collapse;
    table-layout:fixed;
}
.bgColor {
  background-color: #f9f9f9 !important;
}
table.gridtable td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #ebeef5;
    background-color: #ffffff;
    word-break: break-all;  /* 超出换行 */
    word-wrap: break-word;
}
</style>
