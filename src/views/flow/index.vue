<template>
  <div class="Flow">
    <div class="center-option" ref="center" unselectable="on" onselectstart="return false;" style="-moz-user-select:none;">
      <svg width="5000px" height="5000px" ref="svg">
        <pattern id="dots" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="5" height="5" fill="none" stroke="#F0F0F0" stroke-width="1px"></rect>
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
        <!-- 虚线 -->
        <g v-if="seleLines.length">
          <line
          :x1="seleLines[0].left"
          :y1="seleLines[0].top"
          :x2="shadowData.lineEnterLeft"
          :y2="shadowData.lineEnterTop"
          stroke="rgb(109, 120, 150)"
          stroke-width="1px"
          stroke-dasharray="3 2" />
        </g>
        <!-- 实线 -->
        <g v-for="(item, i) in lineArr" :key="i">
          <path
          @click="pathSelect(item)"
          :class="{'selectPath': item[2]}"
          :d="pathPosition(item)" />
        </g>
      </svg>
      <!-- 影子节点 -->
      <div v-if="shadowData.nodeShow" ref="showNode" class="centerItem shadow" :style="{'position': 'absolute', 'left': shadowData.nodeLeft + 'px', 'top': shadowData.nodeTop + 'px'}" />
      <!-- 实际节点 -->
      <div
      v-for="(item, i) in nodeArr" :key="item.uuid"
      class="centerItem"
      :style="{'position': 'absolute', 'left': item.left + 'px', 'top': item.top + 'px'}"
      ref="node">
        <span class="del el-icon-error" @click="delItem(i)"></span>
        <div class="spotBox" style="top: 0;" @mousedown.self="move(item, $event, i)">
          <el-tooltip v-for="enterItem in item.port.enter" :key="enterItem.uuid" class="item" effect="light" :content="portFilter(enterItem, 1)" placement="top-start">
            <div class="spot" @mouseup="portTrigger(enterItem)">
              <span></span>
              <i class="el-icon-arrow-down"></i>
            </div>
          </el-tooltip>
        </div>
        <p @mousedown.self="move(item, $event, i)" unselectable="on" onselectstart="return false;" style="-moz-user-select:none;">
          <span @mousedown.self="move(item, $event, i)">{{item.type | titleFilter}}</span>_{{item.title}}
            <el-tooltip effect="dark" content="点击编辑" placement="bottom-start">
              <i class="el-icon-edit" @click="modifyNode(item)"></i>
            </el-tooltip>
        </p>
        <div class="spotBox" style="bottom: 0;" @mousedown.self="move(item, $event, i)">
          <el-tooltip v-for="outItem in item.port.out" :key="outItem.uuid" class="item" effect="light" :content="portFilter(outItem, 2)" placement="bottom-start">
            <div :class="{'spot': true, 'color': outItem.select}" @mousedown="portTrigger(outItem, $event)">
              <span v-if="!outItem.select"></span>
              <i v-if="!outItem.select" class="el-icon-arrow-down"></i>
              <i v-if="outItem.select" class="el-icon-loading connect"></i>
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="left-option">
      <div
        v-for="(item, i) in optionArr" :key="i"
        class="leftItem"
        @mousedown="moveNewNode(item, i, $event)"
        >
        <i :class="item.icon"></i>
        <div class="bubble">{{item.name}}</div>
      </div>
    </div>
    <transition name="right-option-mobile">
      <div class="righ-option" v-if="rightOptionShow && shadowData.nodeType !== 0" @click.self="no">
        <div @click.self="no">
          <BranchNode
            @no="no"
            @yes="yes"
            :form="form"/>
        </div>
      </div>
    </transition>
    <div class="center-top">
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button type="primary" @click="format">复位</el-button>
    </div>
  </div>
</template>

<script>
import BranchNode from '@/components/BranchNode.vue'
export default {
  data () {
    return {
      nodeArr: [],
      lineArr: [],
      form: {},
      seleLines: [], // 暂时选中的两个端点
      rightOptionShow: false, // 右侧表单栏显示隐藏
      optionArr: [
        {
          name: '节点A',
          icon: 'el-icon-location',
          type: 1
        },
        {
          name: '节点B',
          icon: 'el-icon-edit-outline',
          type: 2
        },
        {
          name: '节点C',
          icon: 'el-icon-edit',
          type: 3
        },
        {
          name: '节点D',
          icon: 'el-icon-share',
          type: 4
        },
        {
          name: '节点E',
          icon: 'el-icon-info',
          type: 5
        }
      ],
      selectObj: {}, // 点击修改时临时备份
      shadowData: {
        nodeShow: false,
        nodeText: '',
        nodeType: 0,
        nodeLeft: 0,
        nodeTop: 0,
        lineEnterLeft: 0,
        lineEnterTop: 0,
      }, // 影子数据
      timeout: null
    }
  },
  methods: {
    submit () {
      console.log('node', this.nodeArr);
      console.log('line', this.lineArr);
    },
    // 创建新节点
    createNode (type) {
      let left = this.shadowData.nodeLeft
      let top = this.shadowData.nodeTop
      let obj = {
        left,
        top,
        type,
        uuid: this.createUuid(),
        title: '',
        endNode: false,
        port: {
          enter: [{
            uuid: this.createUuid(),
            left,
            top,
            type: 'enter',
            title: ''
          }],
          out: [{
            uuid: this.createUuid(),
            left,
            top: top + 55,
            select: false,
            type: 'out',
            title: ''
          }]
        }
      }
      if (type === 1) {
        console.log('单独处理');
      } else if (type === 2) {
        console.log('单独处理');
      }
      let enterLength = obj.port.enter.length
      obj.port.enter.forEach((item, i) => {
        item.left = left + 130/(enterLength + 1) * (i + 1)
      })
      let outLength = obj.port.out.length
      obj.port.out.forEach((item, i) => {
        item.left = left + 130/(outLength + 1) * (i + 1)
      })
      this.form = obj
    },
    // 左边按下拖动
    moveNewNode (item, i, e) {
      if (e && e.preventDefault) {
        e.preventDefault();//防止浏览器默认行为(W3C) 
      } else {
        window.event.returnValue = false;//IE中阻止浏览器行为 
      }
      this.shadowData.nodeText = item.name
      this.shadowData.nodeType = item.type
      
      let odiv = e.target //获取目标元素
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft
      let disY = e.clientY - odiv.offsetTop
      // 滚动条宽度
      let scrollLeft = this.$refs.center.scrollLeft
      let scrollTop = this.$refs.center.scrollTop
      // 差
      let diffTop = 400 / this.optionArr.length * (i+1)

      let flagLeft = this.shadowData.nodeLeft
      //鼠标按下并移动的事件
      document.onmousemove = (e)=>{
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX
        let top = e.clientY - disY + diffTop
        left = left <=0 ? 0 : left
        top = top <=0 ? 0 : top
        this.shadowData.nodeLeft = left + scrollLeft
        this.shadowData.nodeTop = top + scrollTop
        if (!this.shadowData.nodeShow) {
          this.shadowData.nodeShow = true
        }
      }
      // 鼠标弹起
      document.onmouseup = () => {
        // 判断是否已有触发节点
        if (this.shadowData.nodeLeft !== flagLeft) {
          if (item.type === 1) {
            let flag = false
            this.nodeArr.forEach(item => {
              if (item.type === 1) {
                flag = true
              }
            })
            if (flag) {
              this.shadowData.nodeShow = false
              this.$message.warning('请勿重复创建触发节点');
            } else {
              this.createNode(item.type)
              this.rightOptionShow = true
            }
          } else {
            this.createNode(item.type)
            this.rightOptionShow = true
          }
        }
        document.onmousemove = null;
        document.onmouseup = null;
      }
    },
    // 线点击选中
    pathSelect (item) {
      item[2] = !item[2]
      this.$forceUpdate()
    },
    // 计算贝塞尔曲线值
    pathPosition (item) {
      return `M${item[0].left} ${item[0].top+5} C${item[0].left} ${item[0].top+50} ${item[1].left} ${item[1].top-50} ${item[1].left} ${item[1].top}`
    },
    // 删除某个节点
    delItem (i) {
      let deletedObj = this.nodeArr[i]
      this.nodeArr.splice(i, 1)
      let deleIndex = []
      this.lineArr.forEach((lineItem, j) => {
        deletedObj.port.out.forEach(outItem => {
          if (outItem.uuid === lineItem[0].uuid) {
            deleIndex.push(j)
          }
        })
        deletedObj.port.enter.forEach(enterItem => {
          if (enterItem.uuid === lineItem[1].uuid) {
            deleIndex.push(j)
          }
        })
      })
      var newDeleIndex = [...new Set(deleIndex)]
      newDeleIndex.sort(function(a, b) {
          return b - a
      })
      newDeleIndex.forEach(i => {
        this.lineArr.splice(i, 1)
      })
    },
    // 过滤端口名
    portFilter (val, flag) {
      if(val.title && val.title !== '') {
        return val.title
      } else {
        if (flag === 1) {
          return '输入端口'
        }
        if (flag === 2) {
          return '输出端口'
        }
      }
    },
    // 创建uuid
    createUuid () {
      let dateFormat = require('dateformat');
      let randomstring = require("randomstring");
      let d = new Date()
      let pcs = []
      pcs.push(dateFormat(d, 'yyyymmdd'))
      pcs.push(dateFormat(d, 'hhMM'))
      pcs.push(dateFormat(d, 'ssL'))
      pcs.push(randomstring.generate({
          length: 12,
          charset: 'hex'
      }))
      return pcs.join('-')
    },
    // 修改节点信息
    modifyNode (item) {
      this.form = item
      this.shadowData.nodeType = item.type
      this.rightOptionShow = true
      this.selectObj = JSON.parse(JSON.stringify(this.form))
    },
    // 端口触发事件
    portTrigger (obj, e) {
      if (obj.type === 'out') {
        if (e && e.preventDefault) {
            e.preventDefault();//防止浏览器默认行为(W3C) 
        } else {
          window.event.returnValue = false;//IE中阻止浏览器行为 
        }
        obj.select = true
        this.shadowData.lineEnterLeft = obj.left;
        this.shadowData.lineEnterTop = obj.top;
        this.seleLines = []
        this.seleLines.push(obj)
        //算出鼠标移动位置
        let disX = e.clientX - obj.left
        let disY = e.clientY - obj.top
        document.onmousemove = (e)=>{
          let left = e.clientX - disX
          let top = e.clientY - disY
          left = left <=0 ? 0 : left
          top = top <=0 ? 0 : top
          this.shadowData.lineEnterLeft = left;
          this.shadowData.lineEnterTop = top;
        }
        document.onmouseup = () => {
          obj.select = false
          this.seleLines = []
          document.onmousemove = null;
          document.onmouseup = null;
        }
      } else {
        if (this.seleLines.length > 0) {
          this.seleLines.push(obj)
          let newArr = [...this.seleLines, false]
          this.lineArr.push(newArr)
          this.seleLines = []
        }
      }
    },
    // 拖拽节点
    move (node, e, i) {
      if (e && e.preventDefault) {
        e.preventDefault();//防止浏览器默认行为(W3C) 
      } else {
        window.event.returnValue = false;//IE中阻止浏览器行为 
      }
      let odiv = this.$refs.node[i]
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft
      let disY = e.clientY - odiv.offsetTop

      let flagLeft = this.shadowData.nodeLeft
      //鼠标按下并移动的事件
      document.onmousemove = (e)=>{
          //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
          let left = e.clientX - disX  
          let top = e.clientY - disY
          left = left <=0 ? 0 : left
          top = top <=0 ? 0 : top
          //移动当前元素
          this.shadowData.nodeLeft = left;
          this.shadowData.nodeTop = top;
          if (!this.shadowData.nodeShow) {
            this.shadowData.nodeShow = true
          }
      }
      document.onmouseup = () => {
        this.shadowData.nodeShow = false
        if (this.shadowData.nodeLeft !== flagLeft) {
          node.left = this.shadowData.nodeLeft
          node.top = this.shadowData.nodeTop
          let enterLength = node.port.enter.length
          node.port.enter.forEach((item, i) => {
            item.left = node.left + 130/(enterLength + 1) * (i + 1)
            item.top = node.top
          })
          let outLength = node.port.out.length
          node.port.out.forEach((item, i) => {
            item.left = node.left + 130/(outLength + 1) * (i + 1)
            item.top = node.top + 55
          })
        }
        document.onmousemove = null;
        document.onmouseup = null;
      }
    },
    yes () {
      if (this.shadowData.nodeShow) {
        let node = JSON.parse(JSON.stringify(this.form))
        this.nodeArr.push(node)
      }
      this.rightOptionShow = false // 右侧表单框隐藏
      this.shadowData.nodeShow = false // 影子节点隐藏
      this.form = {}
      this.selectObj = null // 临时节点信息置为null
    },
    no () {
      this.rightOptionShow = false // 右侧表单框隐藏
      this.shadowData.nodeShow = false // 影子节点隐藏
      if (this.selectObj) {
        for (const key in this.form) {
          this.form[key] = this.selectObj[key]
        }
      }
      this.form = {}
      this.selectObj = null // 临时节点信息置为null
    },
    // 复位
    format () {
      this.$refs.center.scrollLeft = 2000
      this.$refs.center.scrollTop = 100
    },
  },
  components: {
    BranchNode
  },
  filters: {
    titleFilter (val) {
      switch (val) {
        case 1:
          return '节点A'
        case 2:
          return '节点B'
        case 3:
          return '节点C'
        case 4:
          return '节点D'
        case 5:
          return '节点E'
      }
    }
  },
  created () {
    document.onkeydown = (e) => {
			if((e.code === 'Delete') || (e.code === 'Backspace')) {
        this.lineArr = this.lineArr.filter(item => {
          return !item[2]
        })
      }
      if((e.code === 'Enter') && this.rightOptionShow){
				this.yes()
			}
    }
  },
  mounted () {
    this.timeout = setTimeout(() => {
      this.format()
      clearTimeout(this.timeout)
    }, 500)
  }
}
</script>

<style lang="less">
.Flow {
  width: 100%;
  height: 100%;
  position: relative;
  .center-top {
    display: flex;
    position: absolute;
    left: 20px;
    top: 10px;
  }
  .center-option {
    width: 100%;
    height: 100%;
    overflow: scroll;
    position: relative;
    svg  {
      position: absolute;
      path {
        fill: none;
        stroke: rgba(172, 183, 195, .7);
        stroke-width: 3px;
      }
      path:hover {
        cursor: pointer;
        stroke: #6b9be8;
      }
      .selectPath {
        stroke: #6b9be8;
      }
    }
    .centerItem {
      width: 130px;
      height: 60px;
      background-color: rgba(107, 155, 232, .5);
      border-radius: 6px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
      position: absolute;
      >p {
        width: 100%;
        position: absolute;
        top: 20px;
        text-align: center;
        font-size: 12px;
        color: #fff;
        padding: 0 15px 0 10px;
        overflow: hidden;
        text-overflow: ellipsis; 
        -o-text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        cursor: move;
        span {
          font-size: 14px;
        }
        i {
          font-size: 18px;
          cursor: pointer;
          position: absolute;
          right: 0;
          opacity: 0;
          display: inline-block;
          height: 20px;
          border-radius: 4px 0 0 4px;
        }
        i:hover {
          background-color: rgba(107, 155, 232, .8);
        }
      }
      .del {
        position: absolute;
        top: -7px;
        right: -9px;
        color: #ff493d;
        cursor: pointer;
        opacity: 0;
      }
      .spotBox {
        width: 100%;
        height: 15px;
        position: absolute;
        display: flex;
        justify-content: space-around;
        cursor: move;
        .spot {
          width: 28px;
          height: 15px;
          display: flex;
          justify-content: center;
          position: relative;
          border-radius: 0 0 6px 6px;
          cursor: crosshair;
          span {
            display: block;
            width: 6px;
            height: 6px;
            border-radius: 100%;
            background-color: #fff;
            position: absolute;
            top: 0;
            left: 10px;
          }
          i {
            font-size: 12px;
            color: #fff;
            position: absolute;
            bottom: -4px;
            left: 7px;
          }
          .connect {
            position: absolute;
            bottom: 1px;
            left: 7px;
          }
        }
        .color {
          background-color: rgba(107, 155, 232, .8);
        }
        .spot:hover {
          transition : all .5s;
          background-color: rgba(107, 155, 232, .8);
        }
      }
    }
    .shadow {
      background-color: rgba(107, 155, 232, .3);
    }
    .centerItem:hover {
      transition : all .5s;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.4);
      .del {
        transition : all .5s;
        opacity: 1;
      }
      >p {
        i {
          transition : all .5s;
          opacity: 1;
        }
      }
    }
  }
  .left-option {
    width: 50px;
    height: 400px;
    position: absolute;
    left: 20px;
    top: 66px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.2);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    .leftItem {
      width: 32px;
      height: 32px;
      background-color: #e2e2e2;
      border-radius: 6px;
      text-align: center;
      line-height: 32px;
      color: #fff;
      cursor: pointer;
      font-size: 30px;
      position: relative;
      .bubble {
        width: 104px;
        text-align: center;
        padding: 5px 0;
        border-radius: 6px;
        background-color: rgba(0, 0, 0, .3);
        position: absolute;
        top: -20px;
        right: -105px;
        font-size: 14px;
        display: none;
      }
    }
    .leftItem:hover {
      background-color: #adadad;
      .bubble {
        display: block;
      }
    }
    .isSlect {
      background-color: #adadad;
    }
  }
  .righ-option {
      position: fixed;
      top: 0;
      left: -400px;
      bottom: 0;
      right: 0;
      background-color: rgba(0, 0, 0, .3);
      z-index: 99;
      >div {
        position: relative;
        height: 100%;
        width: 100%;
      }
    }
    @keyframes mobile {
      0% {
        opacity: 0;
        transform: translateX(400px);
      }
      100% {
        opacity: 1;
        transform: translateX(0px);
      }
    }
    .right-option-mobile-enter-active {
      animation: mobile .3s;
    }
    .right-option-mobile-leave-active {
      animation: mobile .3s reverse;
    }
}
</style>