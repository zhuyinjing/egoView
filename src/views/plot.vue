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
      readsData: null,
      chromId: null, // get value from sessionStorage
      blockList: null, // 映射的染色体的顺序
    }
  },
  mounted () {
    this.getTopData()
  },
  methods: {
    getTopData () {
      let data = JSON.parse(sessionStorage.getItem('plot_data'))
      let chromId = data.chromId
      this.chromId = chromId
      let start = data.start > 1000 ? data.start - 1000 : 0
      let end = data.info.END ? data.info.END - 0 + 1000 : start + 1000
      this.axios.get('/admin/get_structural_variation_reads?chromId='+ chromId +'&start='+ start +'&end='+ end).then(res => {
          this.chrData = res.data.chromInfo
          this.readsData = res.data.blockMap
          this.blockList = res.data.blockMap.blockList
          this.initTopSvg()
      })
    },
    initTopSvg () {
      let self = this

      let blockList = this.blockList
      let data = blockList.map(item => this.readsData[item])
      let chrData = this.chrData
      let chromId = this.chromId

      // 画图用到的数据初始化
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      let ref_block_height = 10 // 染色体 rect 的高度
      let ref_block_y = 20 // 染色体 rect 距离 svg 顶部的距离

      let ref_interval_margin = 30 // 染色体与矩形之间的 path 所占的高度
      let ref_interval_y = ref_block_y + ref_block_height + ref_interval_margin // 矩形的起点

      let lineHeight = 15 // 每个 line.alignment 所占用的高度 （ line 本身的高度 + 与下一条 line 的间距）
      let line_h = 5 // line 的高度
      let ref_interval_padding = 10 // 矩形内部的上下 padding
      let ref_interval_height = this.readsData[this.chromId + '.1'].readsMap.length * lineHeight + ref_interval_padding * 2

      let padding = {
        top: 60,
        left: 50,
        right: 50,
        bottom: 150
      }

      let width = 1200, // read 的长度
          height = ref_interval_y + ref_interval_height + padding.bottom

      let svgContainer = d3.selectAll("#svgTopContainer")
                .append("svg")
                .attr("width", width + padding.left + padding.right)
                .attr("height", height)
                // .style("border", "1px solid #d2d2d2")
                .attr("id", "topSvg")

      let svg = svgContainer.append("g")
                .attr("transform", "translate("+ padding.left + "," + padding.top +")")

      // text.reference
      let reference_text_y = 25
      let reference_text_size = 16
      svgContainer.append("text")
         .text("Reference")
         .attr("transform", (d, i) => "translate(" + ((width + padding.left + padding.right) / 2) + ", " + reference_text_y + ")")
         .style("font-size", reference_text_size)
         .style('text-anchor',"middle")

      // ref_block 染色体用到的数据
      let ref_block_total = chrData.reduce((pre, {length}) => pre + length, 0)
      let ref_block_temp = 0
      let ref_block_data = chrData.map(({length}) => ref_block_temp += width * (length) / ref_block_total)
      ref_block_data.unshift(0)

      // ref_block 动态比例尺
      chrData.map(( {length, name}, i) => {
        this["ref_block_scale" + name.split("chr")[1]] = d3.scaleLinear().domain([0, length]).range([ref_block_data[i], ref_block_data[i + 1]])
      })

      // rect.ref_block
      svg.selectAll("rect.ref_block")
         .data(chrData)
         .enter()
         .append("rect")
         .attr("x", (d, i) => ref_block_data[i])
         .attr("y", ref_block_y)
         .attr("width", (d, i) => ref_block_data[i + 1] - ref_block_data[i])
         .attr("height", ref_block_height)
         .attr("fill", d => colorScale(d.name.split("chr")[1]))
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

      // rect.ref_interval 和 rect.ref_interval 所用到的数据
      let ref_interval_total = data.reduce((pre, {length}) => pre + (length[1] - length[0]), 0) // ref_interval 的总和数值
      let ref_interval_temp = 0
      let ref_interval_data = data.map(({length}) => ref_interval_temp += width * (length[1] - length[0]) / ref_interval_total)

      ref_interval_data.unshift(0)

      // rect.ref_interval
      svg.selectAll("rect.ref_interval")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", (d, i) => ref_interval_data[i])
         .attr("y", ref_interval_y)
         .attr("width", (d, i) => ref_interval_data[i + 1] - ref_interval_data[i])
         .attr("height", ref_interval_height)
         .attr("fill", "#fff")
         .attr("stroke", "black")
         .attr("stroke-width", "1")

      // path.ref_mapping
      let ref_mapping_y = ref_block_y + ref_block_height
      svg.selectAll("path.ref_mapping")
         .data(data)
         .enter()
         .append("path")
         .attr("d", (d, i) => {
           return "M " + ref_interval_data[i] + " " + ref_interval_y + "L" + this["ref_block_scale" + d.readsMap[0].rName](d.length[0]) + " " + ref_mapping_y
                  + "L" + this["ref_block_scale" + d.readsMap[0].rName](d.length[1]) + " " + ref_mapping_y + "L" + ref_interval_data[i + 1] + " " + ref_interval_y + "Z"

         })
         .attr("fill", d => colorScale(d.readsMap[0].rName))
         .attr("stroke", "black")
         .attr("stroke-width", "0.5px")

      // line.alignment 所用到的动态比例尺
      data.map(({length}, i) => {
        this["alignment_scale" + blockList[i]] = d3.scaleLinear().domain([length[0], length[1]]).range([ref_interval_data[i], ref_interval_data[i + 1]])
      })

      // line.alignment 的 y 值基准
      let lineIndexArr = data[0].readsMap.map(d => d.QName)
      let line_alignment_top_y = ref_interval_padding + ref_interval_y // line.alignment 第一个 line 距离矩形上边框的距离


      // 初始化 鼠标点击 reads 时的辅助线
      svg.append("rect").attr("id", "guide_line").attr("width", width).attr("height", line_h).attr("fill", "none").style("visibility", "hidden").attr("stroke","#ff0000")

      // line.alignment
      for (let i = 0;i < blockList.length;i++) {
        let item = blockList[i]
        svg.selectAll("line.alignment")
           .data(data[i].readsMap)
           .enter()
           .append("line")
           .attr("x1", d => this["alignment_scale" + item](d.AlignmentStart))
           .attr("x2", d => this["alignment_scale" + item](d.AlignmentEnd))
           .attr("y1", d => line_alignment_top_y + lineIndexArr.indexOf(d.QName) * lineHeight)
           .attr("y2", d => line_alignment_top_y + lineIndexArr.indexOf(d.QName) * lineHeight)
           .attr("stroke-width", line_h)
           .attr("stroke", d => d.readStrand ? "blue" : "red")
           .attr("stroke-opacity", 0.5)
           .attr("stroke-linecap", "round")
           .attr("cursor", "pointer")
           .on("click", function (d) {
             let y = d3.select(this).attr("y1")
             svg.select("rect#guide_line").attr("x",  0).attr("y", y - line_h / 2).style("visibility", "visible")
             let read = data[0].readsMap.find(item => item.QName === d.QName)
             self.getBottomData(read)
           })
      }
    },
    getBottomData (read) {
      this.axios.get("/admin/get_singel_read?chromId="+ read.rName +"&start="+ read.AlignmentStart +"&end="+ read.AlignmentEnd +"&readName=" + read.QName).then(res => {
        this.data = res.data[read.QName]
        this.initBottomSvg()
      })
    },
    initBottomSvg () {
      var self = this
      d3.selectAll('#bottomSvg').remove()

      let width = 1200, // read 的长度
          height = 500
      let padding = {
        top: 50,
        left: 50,
        right: 50,
        bottom: 50
      }

      let svgContainer = d3.selectAll("#svgBottomContainer")
                .append("svg")
                .attr("width", width + padding.left + padding.right)
                .attr("height", height)
                // .style("border", "1px solid #d2d2d2")
                .attr("id", "bottomSvg")

      let svg = svgContainer.append("g")
                .attr("transform", "translate("+ padding.left + "," + padding.top +")")

      // text.reference
      let reference_text_y = 25
      let reference_text_size = 16
      svgContainer.append("text")
         .text("Reference")
         .attr("transform", (d, i) => "translate(" + ((width + padding.left + padding.right) / 2) + ", " + reference_text_y + ")")
         .style("font-size", reference_text_size)
         .style('text-anchor',"middle")

      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      let data = this.data.sort((pre, cur) => this.blockList.indexOf(pre.blockName) - this.blockList.indexOf(cur.blockName))

      // ref_block 染色体用到的数据
      let chrData = this.chrData
      let ref_block_total = chrData.reduce((pre, {length}) => pre + length, 0)
      let ref_block_temp = 0
      let ref_block_data = chrData.map(({length}) => ref_block_temp += width * (length) / ref_block_total)
      ref_block_data.unshift(0)

      // ref_block 动态比例尺
      chrData.map(( {length, name}, i) => {
        this["ref_block_scale" + name.split("chr")[1]] = d3.scaleLinear().domain([0, length]).range([ref_block_data[i], ref_block_data[i + 1]])
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
         .attr("fill", d => colorScale(d.name.split("chr")[1]))
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
      let top_bar_height = 80
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
      data.map(( {AlignmentStart, AlignmentEnd, blockName}, i) => {
        this["bottom_bar_scale" + blockName + "_" + i] = d3.scaleLinear().domain([AlignmentStart, AlignmentEnd]).range([bottom_bar_data[i], bottom_bar_data[i + 1]])
      })

      // rect.query
      let query_margin = 100,
          ref_y = bottom_bar_y + bottom_bar_height + 0.9,
          query_y = bottom_bar_y + bottom_bar_height + query_margin
      svg.append("rect")
         .attr("x", 0)
         .attr("y", query_y)
         .attr("width", width)
         .attr("height", bottom_bar_height)

      let queryScale = d3.scaleLinear().domain([0, data[0].ReadLength]).range([0, width]).nice()
      let queryAxis = d3.axisBottom().scale(queryScale).ticks(5).tickSize(0).tickPadding(10).tickFormat(d3.format(".2s"))
      let query = svg.append("g").call(queryAxis).attr("transform","translate("+ 0 +"," + (query_y + bottom_bar_height) +")") // query 的 横坐标显示需要的比例尺
      d3.select("path.domain").remove() // 把 queryAxis 的那条横线删掉

      for (let i = 0;i < data.length;i++) {
        var item = data[i]
        var refScale = this["bottom_bar_scale" + item.blockName + "_" + i]
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
             if (qe - qs > minPixel) {
               return 'M' + qs + ' ' + query_y + ' L '+ qe + ' ' + query_y
             }
           } else if (flag === 'M' || flag === '=' || flag === 'X') {
             qs = qe
             qe = qs + queryScale(length)
             rs = re
             refLengthFlag += length
             re = refScale(refLengthFlag)
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

      // text.Read / Query
      let read_text_y = query_y + bottom_bar_height + 50
      svg.append("text")
         .text("Read / Query")
         .attr("transform", (d, i) => "translate(" + (width / 2) + ", " + read_text_y + ")")
         .style("font-size", reference_text_size)
         .style('text-anchor',"middle")



    },
  }
}
</script>

<style scoped="true">
</style>
