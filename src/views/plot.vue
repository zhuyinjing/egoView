<template>
  <div>
    <div id="svgTopContainer"></div>
    <div id="svgBottomContainer"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  data () {
    return {
      data: null,
      chrData: null,
    }
  },
  mounted () {
    this.getTopData()
  },
  methods: {
    getTopData () {
      // svg.selectAll(".g")
      //   .data([[1,2],[3,4],[5,6]])
      //   .enter()
      //   .append("g")
      //   .attr("transform", (d, i) => "translate(0," + i * 50  + ")")
      //   .selectAll(".text")
      //   .data(d => d)
      //   .enter()
      //   .append("text")
      //   .text(d => d)
      //   .attr("transform", (d, i) => "translate("+ i * 10 +",0)")
      //   .attr("stroke", "black")
      let data = JSON.parse(sessionStorage.getItem('plot_data'))
      let chromId = data.chromId
      let start = data.start > 1000 ? data.start - 1000 : 0
      let end = data.info.END - 0 + 1000
      this.axios.get('/admin/get_structural_variation_reads?chromId='+ chromId +'&start='+ start +'&end='+ end).then(res => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initD3()
        } else {
          this.$message.error('请求出错！')
        }
      })
    },
    getBottomData () {
      this.axios.get("/admin/get_singel_read?genome=1&start=10482&end=10775&readName=376e2c9d-e6c5-4c01-ac2d-3aed61e774e9").then(res => {
        // this.data = res.data["376e2c9d-e6c5-4c01-ac2d-3aed61e774e9"].sort((a, b) => a.rName - b.rName)
        this.data = res.data["376e2c9d-e6c5-4c01-ac2d-3aed61e774e9"]
        this.chrData = res.data.chormInfo
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
      let svg = d3.selectAll("#svgBottomContainer")
                .append("svg")
                .attr("width", width + padding.left + padding.right)
                .attr("height", height)
                .style("border", "1px solid #d2d2d2")
                .append("g")
                .attr("transform", "translate("+ padding.left + "," + padding.top +")")

      let data = this.data
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      // ref_block 染色体用到的数据
      let chrData = this.chrData
      let ref_block_total = chrData.reduce((pre, {length}) => pre + length, 0)
      let ref_block_temp = 0
      let ref_block_data = chrData.map(({length}) => ref_block_temp += width * (length) / ref_block_total)
      ref_block_data.unshift(0)

      // ref_block 动态比例尺
      chrData.map(( {length, code}, i) => {
        this["ref_block_scale" + code] = d3.scaleLinear().domain([0, length]).range([ref_block_data[i], ref_block_data[i + 1]])
      })

      // rect.ref_block
      let ref_block_height = 10
      let ref_block_y = 20
      svg.selectAll("rect.ref_block")
         .data(chrData)
         .enter()
         .append("rect")
         .attr("x", (d, i) => ref_block_data[i])
         .attr("y", ref_block_y)
         .attr("width", (d, i) => ref_block_data[i + 1] - ref_block_data[i])
         .attr("height", ref_block_height)
         .attr("fill", d => colorScale(d.code))
         .attr("stroke", "black")

       // text.ref_block
       let ref_block_text_y = 5
       svg.selectAll("rect.ref_block")
          .data(chrData)
          .enter()
          .append("text")
          .text(d => d.name.split("chr")[1])
          .attr("transform", (d, i) => "translate(" + (ref_block_data[i] + (ref_block_data[i + 1] - ref_block_data[i]) / 2) + ", " + ref_block_text_y + ")")
          .style("font-size", 12)
          .style('text-anchor',"middle")

      // rect.bottom_bar 和 rect.top_bar 所用到的数据
      let bottom_bar_height = 10
      let bottom_bar_total = data.reduce((pre, {AlignmentStart, AlignmentEnd}) => pre + (AlignmentEnd - AlignmentStart), 0) // bottom_bar 的总和数值
      let bottom_bar_temp = 0
      let bottom_bar_data = data.map(({AlignmentStart, AlignmentEnd}) => bottom_bar_temp += width * (AlignmentEnd - AlignmentStart) / bottom_bar_total)
      bottom_bar_data.unshift(0)

      // rect.top_bar
      let top_bar_height = 100
      let top_bar_y = height / 2 - top_bar_height
      svg.selectAll("rect.top_bar")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", (d, i) => bottom_bar_data[i])
         .attr("y", top_bar_y)
         .attr("width", (d, i) => bottom_bar_data[i + 1] - bottom_bar_data[i])
         .attr("height", top_bar_height)
         .attr("fill", d => colorScale(d.rName))
         .attr("stroke", "black")
         .style("opacity",0.5)

       // path.ref_mapping
       let ref_mapping_y = ref_block_y + ref_block_height
       svg.selectAll("path.ref_mapping")
          .data(data)
          .enter()
          .append("path")
          .attr("d", (d, i) => {
            return "M " + bottom_bar_data[i] + " " + top_bar_y + "L" + this["ref_block_scale" + d.rName](d.AlignmentStart) + " " + ref_mapping_y
                   + "L" + this["ref_block_scale" + d.rName](d.AlignmentEnd) + " " + ref_mapping_y
                   + "L" + bottom_bar_data[i + 1] + " " + top_bar_y + "Z"
          })
          .attr("fill", d => colorScale(d.rName))
          .attr("stroke", "black")
          .attr("stroke-width", "0.5px")

      // rect.bottom_bar
      let bottom_bar_y = height / 2
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

      let queryScale = d3.scaleLinear().domain([0, data[0].ReadLength]).range([0, width]).nice()
      let queryAxis = d3.axisBottom().scale(queryScale).ticks(5).tickSize(0).tickPadding(10).tickFormat(d3.format(".2s"))
      let query = svg.append("g").call(queryAxis).attr("transform","translate("+ 0 +"," + (query_y + bottom_bar_height) +")")
      d3.select("path.domain").remove() // 把 queryAxis 的那条横线删掉


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
