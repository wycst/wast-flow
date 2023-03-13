let uid = 0;
/**
 * 历史管理
 */
export default {
    // 初始化属性
    props: {
        // 默认存储10个动作对象
        actions: [],
        // 当前action位置
        index: -1,
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
            // 移除从index开始往后的记录
            this.actions.splice(++this.index, this.actions.length - this.index, action);
            if (this.actions.length > 20) {
                this.actions.shift();
                --this.index;
            }
        },
        // 清除历史
        clearHistory() {
            this.actions = [];
            this.index = -1;
        },
        // 获取当前的历史记录的action执行undo动作
        undo: function () {
            let action;
            if (action = this.actions[this.index]) {
                action.undo();
                --this.index;
            }
        },
        // 获取当前的历史记录下一步的action执行redo动作
        redo: function () {
            let action;
            if (action = this.actions[this.index + 1]) {
                ++this.index
                action.redo();
            }
        }
    }
}