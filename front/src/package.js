import {wf} from "./core/index"
import {version} from "../package.json"
// 输出版本号信息
try {
    Object.assign(window, {
        'wastflow-version': version
    })
} catch (e) {
    console.warn(e);
}

export default wf;



