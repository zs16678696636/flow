<template>
  <div class="right-ption-content">
    <header>
      <span>分支判断节点</span>
      <i class="el-icon-close" @click.self="no"></i>
    </header>
    <section>
      <div class="itemBox">
        <span class="title">节点标题:</span>
        <el-input v-model="formData.title" autofocus placeholder="请输入节点标题"></el-input>
      </div>
      <div class="Trigger" v-for="(outItem, k) in formData.port.out" :key="k">
        <div class="itemBox">
          <span class="title">端口标题:</span>
          <el-input v-model="outItem.title" autofocus placeholder="请输入"></el-input>
          <el-button style="marginLeft: 20px" type="danger" plain @click="formData.port.out.splice(k, 1)">删除端口</el-button>
        </div>
      </div>
    </section>
    <footer>
      <el-button type="success" plain @click="addPortOut">增加端口</el-button>
      <el-button @click="no">取消</el-button>
      <el-button type="primary" @click="yes">确定</el-button>
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {}
    }
  },
  data () {
    return {
      formData: {}
    }
  },
  methods: {
    yes () {
      this.$emit('yes')
    },
    no () {
      this.$emit('no')
    },
    // 增加端口
    addPortOut () {
      let obj = {
        uuid: this.createUuid(),
        left: this.formData.left,
        top: this.formData.top + 55,
        select: false,
        type: 'out',
        title: ''
      }
      this.formData.port.out.splice(this.formData.port.out.length, 0, obj)

      let outLength = this.formData.port.out.length
      this.formData.port.out.forEach((item, i) => {
        item.left = this.formData.left + 130/(outLength + 1) * (i + 1)
      })
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
    }
  },
  filters: {},
  created () {
    this.formData = this.form
  },
  mounted () {},
  watch: {
    formData: {
      handler (newVal) {
        this.$emit('updata:form', newVal)
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
.right-ption-content {
  height: 100%;
  width: 500px;
  background-color: #fff;
  float: right;
  position: relative;
  padding-bottom: 0;
  header {
    height: 8%;
    box-shadow: 0 1px 0 0 hsla(0,0%,93.3%,.5);
    align-items: center;
    color: #72767b;
    padding: 0 22px;
    margin-bottom: 32px;
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    i {
      cursor: pointer;
    }
  }
  section {
    width: 100%;
    height: 84%;
    padding: 0 20px;
    overflow-y: scroll;
    .itemBox {
      display: flex;
      align-items: center;
      color: #5c6f88;
      margin-bottom: 16px;
      .title {
        width: 98px;
        border: none;
        color: #72767b;
        padding: 0;
        font-size: 12px;
      }
    }
    .Trigger {
      border-top: 1px solid #ddd;
      padding-top: 16px;
      ul {
        margin: 0;
        padding: 0;
        padding: 10px 20px;
        background-color: rgba(0, 133, 255, .4);
        border-radius: 6px;
        margin-bottom: 10px;
        .content {
          list-style: none;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          padding: 6px;
          border-radius: 4px;
          background-color: #fff;
          .option {
            width: 20%;
          }
          .input {
            width: 30%;
          }
          .delete {
            margin-top: 7px;
            cursor: pointer;
          }
          .delete:hover {
            color: #0085ff;
          }
        }
        .add {
          color: #fff;
          cursor: pointer;
          list-style: none;
        }
      }
      .addGroup {
        color: #0085ff;
        padding: 6px 0 16px 0;
        display: inline-block;
        cursor: pointer;
      }
    }
    .dissatisfied {
      .title {
        height: 36px;
        background-color: #fafafa;
        line-height: 36px;
        font-size: 13px;
        color: #72767b;
        margin: 20px -20px;
        padding-left: 20px;
      }
    }
  }
  footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 8%;
    background-color: #f7fafb;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 20px;
    .el-button {
      height: 28px;
    }
  }
}
</style>