package io.github.wycst.wast.flow.definition;

import java.util.HashMap;
import java.util.Map;

/**
 * 基本属性（id,name, meta）
 *
 * @Author wangyunchao
 * @Date 2021/12/6 15:12
 */
public class Data {

    // 唯一id
    private String id;
    // 名称
    private String name;
    // 元数据信息
    protected Map<String, Object> meta = new HashMap<String, Object>();
    // 唯一标识
    protected String uuid;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getMeta() {
        return meta;
    }

    public void setMeta(Map<String, Object> meta) {
        this.meta = meta;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}
