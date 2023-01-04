export default {
  props: {
    // // 当前流程设计实例
    // flowInstance: Object,
    // 当前操作元素
    element: Object,
  },
  data() {
    return {
      responsive: 1
    }
  },
  computed: {

    /***
     * handler
     * @returns {{}}
     */
    handler() {
      let element = this.element;
      if(!element) return null;
      return element.data("handler");
    },

    /**
     * 元素名称绑定（节点和连线）
     */
    elementName: {
      get() {
        let element = this.element;
        return this.responsive ? element && element.data("text") && element.data("text").attr("text") : null;
      },
      set(name) {
        console.log(name);
        let element = this.element;
        if (element && element.data("text")) {
          element.data("text").attr("text", name);
        }
        ++this.responsive;
      },
    },

    /**
     * 是否跳过
     */
    skip: {
      get() {
        let handler = this.handler;
        return this.responsive ? !!handler.skip : null;
      },
      set(skip) {
        let handler = this.handler;
        handler.skip = !!skip;
        ++this.responsive;
      },
    },

    /**
     * 超时设置
     */
    timeout: {
      get() {
        let handler = this.handler;
        return this.responsive ?  handler.timeout : null;
      },
      set(timeout) {
        let handler = this.handler;
        handler.timeout = typeof timeout == "number" ? timeout : Number(timeout);
        ++this.responsive;
      },
    },

    /**
     * 延迟设置
     */
    delay: {
      get() {
        let handler = this.handler;
        return this.responsive ?  handler.delay : null;
      },
      set(delay) {
        let handler = this.handler;
        handler.delay = typeof delay == "number" ? delay : Number(delay);
        ++this.responsive;
      },
    },

    /**
     * 异常是否重试
     */
    retryOnError: {
      get() {
        let handler = this.handler;
        return this.responsive ? (handler.retryOnError || false) : null;
      },
      set(retryOnError) {
        let handler = this.handler;
        handler.retryOnError = !!retryOnError;
        ++this.responsive;
      },
    },

    /**
     * 重试次数
     */
    retryCount: {
      get() {
        let handler = this.handler;
        return this.responsive ? handler.retryCount || 0 : null;
      },
      set(retryCount) {
        let handler = this.handler;
        handler.retryCount = typeof retryCount == "number" ? retryCount : Number(retryCount);
        ++this.responsive;
      },
    },

    /**
     * 失败策略
     */
    policy: {
      get() {
        let handler = this.handler;
        return this.responsive ? handler.policy : null;
      },
      set(policy) {
        let handler = this.handler;
        handler.policy = policy;
        ++this.responsive;
      },
    },

    /**
     * 是否连线
     */
    isConnect() {
      let type = this.element.type;
      return this.responsive ? type == "path" : null;
    },

    /**
     * 是否连线
     */
    isNode() {
      return !this.isConnect;
    },

    /**
     * 是否条件类型
     */
    isCondition() {
      let conditionType = this.element.data("conditionType");
      return this.responsive ? (conditionType == "Script" || conditionType == "HandlerCall") : null;
    },

    /**
     * 连线样式条件类型(默认/条件)
     */
    conditionType: {
      get() {
        let element = this.element;
        return this.responsive ? element.data("conditionType") : null;
      },
      set(conditionType) {
        let element = this.element;
        element.data("conditionType", conditionType);
        let stroke = element.attr("stroke");
        if(conditionType == "Always") {
          element.node.style.markerStart = null;
        } else {
          element.node.style.markerStart = `url(#connect-condition-${stroke})`;
        }
        ++this.responsive;
      },
    },

    /**
     * 连线源名称
     *
     * @returns {string|null|*}
     */
    sourceName() {
      if(!this.isConnect) return null;
      let sourceNode = this.element.data("from");
      if(sourceNode) {
        let textEle = sourceNode.data("text");
        return textEle ? textEle.attr("text") : sourceNode.data("nodeType");
      } else {
        return "";
      }
    },

    /**
     * 连线目的节点名称
     *
     * @returns {string|null|*}
     */
    targetName() {
      if(!this.isConnect) return null;
      let toNode = this.element.data("to");
      if(toNode) {
        let textEle = toNode.data("text");
        return textEle ? textEle.attr("text") : toNode.data("nodeType");
      } else {
        return "";
      }
    },

    /**
     * 判断是否为网关
     * @returns {*|null}
     */
    isGateway() {
      return this.responsive ? this.element.data("nodeType") == "Split": null;
    },

    /**
     * 针对网关节点的绑定
     */
    gatewayType: {
      get() {
        let element = this.element;
        return this.responsive ? element.data("gateway") : null;
      },
      set(gatewayType) {
        let element = this.element;
        if(gatewayType) {
          element.data("gateway", gatewayType);
          element.setHtmlType(gatewayType.toLowerCase());
        }
        ++this.responsive;
      },
    }
  },


};
