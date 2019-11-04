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
      d3.selectAll('svg').remove()
      let width = 1000, height = 400
      let padding = {
        top: 50,
        left: 50,
        right: 50,
        bottom: 50
      }
      let svg = d3.selectAll("#svgContainer")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate("+ padding.left + "," + padding.top +")")
      let data = this.data
      let colorScale = d3.scaleOrdinal(d3.schemeCategory20)
      let bottom_bar_total = 0
      let bottom_bar_y = 0
      let bottom_bar_height = 10
      data.map(item => bottom_bar_total += (item.AlignmentEnd - item.AlignmentStart)) // 计算出 rect.bottom_bar 所对应的总数值
      let bottom_bar_scale = d3.scaleLinear().domain([0, bottom_bar_total]).range([padding.left, width - padding.right])
      let bottom_bar_temp = 0 // 临时变量，为了方便计算 rect.bottom_bar 每一个 rect 所占 width 比例的叠加总值
      svg.selectAll("rect.bottom_bar")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", (d, i) => {
           if (i === 0) {
             return 0
           } else {
             bottom_bar_temp += (data[i - 1].AlignmentEnd - data[i - 1].AlignmentStart) / bottom_bar_total
             return bottom_bar_temp * width
           }
         })
         .attr("y", bottom_bar_y)
         .attr("width", d => width * (d.AlignmentEnd - d.AlignmentStart) / bottom_bar_total)
         .attr("height", bottom_bar_height)
         .attr("fill", d => colorScale(d.rName))

      return

      let rectHeight = 10
      let yRef = rectHeight, yQuery = height - rectHeight
      let cigarArr = this.data
      let refScale = d3.scaleLinear().domain([cigarArr[0].AlignmentStart, cigarArr[0].AlignmentEnd]).range([0, width])
      let queryScale = d3.scaleLinear().domain([0, cigarArr[0].ReadLength]).range([0, width])

      // ref rect
      g.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", rectHeight).attr("fill", "#f7d448")
      // query rect
      g.append("rect").attr("x", 0).attr("y", height - rectHeight).attr("width", width).attr("height", rectHeight).attr("fill", "#f7d448")

      let qs , qe , rs , re
      var refLengthFlag = cigarArr[0].POSTION // 记录 reference 上每次叠加后的实际值

      for (let i = 0;i < cigarArr.length;i++) {
        let item = cigarArr[i]
        qs = 0, qe = 0, rs = refScale(item.POSTION), re = refScale(item.POSTION)

        g.selectAll(".path")
         // .data([{operator:'S',length:255},{operator:'M',length:2},{operator:'M',length:9}])
         .data(item.CIGAR.cigarElements)
         .enter()
         .append("path")
         .attr("d", drawPath)
         // .attr("stroke", "blue")
         // .attr("stroke-width", "none")
         .attr("fill", "lightblue")
         // .on("mouseover", function () {
         //   console.log(d3.select(this).data()[0]);
         // })
      }

      function drawPath (d) {
        let flag = d.operator
        let length = d.length
        let minPixel = 0 // 在图上小于 minPixel 的 path 默认不画
        if (flag === 'S' || flag === 'I') {
          qs = qe
          qe = qs + queryScale(length)
          if (qe - qs > minPixel) {
            return 'M' + qs + ' ' + yQuery + ' L '+ qe + ' ' + yQuery
          }
        } else if (flag === 'M' || flag === '=' || flag === 'X') {
          qs = qe
          qe = qs + queryScale(length)
          rs = re
          re = refScale(refLengthFlag)
          refLengthFlag += length
          if (qe - qs > minPixel) {
            return 'M' + qs + ' ' + yQuery + ' L ' + rs + ' ' + yRef + ' L ' + re + ' ' + yRef +   ' L '+ qe + ' ' + yQuery
          }
        } else if (flag === 'D' || flag === 'N'){
          rs = re
          re = refScale(refLengthFlag)
          refLengthFlag += length
          if (qe - qs > minPixel) {
            return 'M' + rs + ' ' + yQuery + ' L '+ re + ' ' + yQuery
          }
        }
      }
    },
  }
}
</script>

<style scoped="true">
</style>
