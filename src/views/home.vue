<template>
  <div>
    <el-button type="danger" size="small" round @click="getData()">draw</el-button>
    <div id="svgContainer"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  data () {
    return {
      data: null,
    }
  },
  mounted () {
  },
  methods: {
    getData () {
      this.axios.get("/admin/get_singel_read?genome=1&start=10482&end=10775&readName=376e2c9d-e6c5-4c01-ac2d-3aed61e774e9").then(res => {
        this.data = Object.values(res.data)[0]
        this.initD3()
      })
    },
    initD3 () {
      var self = this

      d3.selectAll('svg').remove()
      let width = 1000, // read 的长度
          height = 400
      let padding = {
        top: 50,
        left: 50,
        right: 50,
        bottom: 50
      }
      let svg = d3.selectAll("#svgContainer")
                .append("svg")
                .attr("width", width + padding.left + padding.right)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate("+ padding.left + "," + padding.top +")")
      let data = this.data
      let colorScale = d3.scaleOrdinal(d3.schemeCategory20)

      // rect.bottom_bar 所用到的数据
      let bottom_bar_y = 0
      let bottom_bar_height = 10
      let bottom_bar_total = data.reduce((pre, {AlignmentStart, AlignmentEnd}) => pre + (AlignmentEnd - AlignmentStart), 0) // bottom_bar 的总和数值
      let bottom_bar_temp = 0
      let bottom_bar_data = data.map(({AlignmentStart, AlignmentEnd}) => bottom_bar_temp += width * (AlignmentEnd - AlignmentStart) / bottom_bar_total)
      bottom_bar_data.unshift(0)
      svg.selectAll("rect.bottom_bar")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", (d, i) => bottom_bar_data[i])
         .attr("y", bottom_bar_y)
         .attr("width", (d, i) => bottom_bar_data[i + 1] - bottom_bar_data[i])
         .attr("height", bottom_bar_height)
         .attr("fill", d => colorScale(d.rName))
         .attr("stroke", "black")
         // .attr("stroke-width", "0.5")

      // bottom_bar 动态比例尺
      data.map(( {AlignmentStart, AlignmentEnd, rName}, i) => {
        this["bottom_bar_scale" + rName] = d3.scaleLinear().domain([AlignmentStart, AlignmentEnd]).range([bottom_bar_data[i], bottom_bar_data[i + 1]])
      })

      // rect.query
      let query_margin = 100,
          query_y = bottom_bar_y + bottom_bar_height + query_margin,
          ref_y = bottom_bar_y + bottom_bar_height + 0.9
      svg.append("rect")
         .attr("x", 0)
         .attr("y", query_y)
         .attr("width", width)
         .attr("height", bottom_bar_height)

      let queryScale = d3.scaleLinear().domain([0, data[0].ReadLength]).range([0, width])


      for (let i = 0;i < data.length;i++) {
        var item = data[i]
        var refScale = this["bottom_bar_scale" + item.rName]
        var qs = 0, qe = 0, rs = refScale(item.POSTION), re = refScale(item.POSTION)
        var refLengthFlag = item.POSTION // 记录 reference 上每次叠加后的实际值

        svg.selectAll(".path")
         // .data([{operator:'S',length:255},{operator:'M',length:2},{operator:'M',length:9}])
         .data(item.CIGAR.cigarElements)
         .enter()
         .append("path")
         .attr("d", drawPath)
         .attr("fill", colorScale(item.rName))
         .attr("fill-opacity", 0.5)

         function drawPath (d) {
           let flag = d.operator
           let length = d.length
           let minPixel = 0 // 在图上小于 minPixel 的 path 默认不画
           if (flag === 'S' || flag === 'I') {
             qs = qe
             qe = qs + queryScale(length)
             // console.log('s' + rs + "," +re);
             if (qe - qs > minPixel) {
               return 'M' + qs + ' ' + query_y + ' L '+ qe + ' ' + query_y
             }
           } else if (flag === 'M' || flag === '=' || flag === 'X') {
             qs = qe
             qe = qs + queryScale(length)
             rs = re
             refLengthFlag += length
             re = refScale(refLengthFlag)
             // console.log('m' + rs + "," +re);
             if (qe - qs > minPixel) {
               return 'M' + qs + ' ' + query_y + ' L ' + rs + ' ' + ref_y + ' L ' + re + ' ' + ref_y +   ' L '+ qe + ' ' + query_y
             }
           } else if (flag === 'D' || flag === 'N'){
             rs = re
             refLengthFlag += length
             re = refScale(refLengthFlag)
             if (qe - qs > minPixel) {
               return 'M' + rs + ' ' + query_y + ' L '+ re + ' ' + query_y
             }
           }
         }
      }




    },
  }
}
</script>

<style scoped="true">
</style>
