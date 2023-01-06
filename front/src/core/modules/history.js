let uid = 0;
/**
 * 历史管理
 */
export default {
    // 初始化属性
    properties: {
        // 默认存储10个动作对象
        historyActions: [],
        // 当前action位置
        currentActionIndex: -1,
    },
    // 初始化方法
    methods: {
        // 创建action
        addAction(action) {
            let {undo, redo} = action || {};
            if (typeof undo != 'function' || typeof redo != "function") {
                console.error("Error: undo redo should be defined as function")
                return;
            }
            action.uid = ++uid;
            // 移除从currentActionIndex开始往后的记录
            this.historyActions.splice(++this.currentActionIndex, this.historyActions.length - this.currentActionIndex, action);
            if (this.historyActions.length > 10) {
                this.historyActions.shift();
                --this.currentActionIndex;
            }
        },
        // 清除历史
        clearHistory() {
            this.historyActions = [];
            this.currentActionIndex = -1;
        },
        // 获取当前的历史记录的action执行undo动作
        undo: function () {
            let action;
            console.log("undo");
            if (action = this.historyActions[this.currentActionIndex]) {
                action.undo();
                --this.currentActionIndex;
            }
        },
        // 获取当前的历史记录下一步的action执行redo动作
        redo: function () {
            let action;
            console.log("redo");
            if (action = this.historyActions[this.currentActionIndex + 1]) {
                ++this.currentActionIndex
                action.redo();
            }
        }
    }
}