package io.github.wycst.wast.flow.definition;

import io.github.wycst.wast.flow.entitys.IEntity;
import io.github.wycst.wast.flow.entitys.TaskEntity;
import io.github.wycst.wast.jdbc.executer.OqlQuery;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 实体管理接口
 */
public interface FlowEntityManager {

    /**
     * 初始化
     *
     * @throws Exception
     */
    public void init();

    /**
     * 保存实体信息
     *
     * @param entity 实体参数
     */
    public void insert(IEntity entity);

    /**
     * 根据id更新实体信息
     *
     * @param entity 更新sql
     * @param fields 更新参数
     */
    public void update(IEntity entity, String... fields);

    /**
     * 删除实体信息
     *
     * @param entityCLs
     * @param id
     */
    public void deleteEntity(Class<? extends IEntity> entityCLs, Serializable id);

    /**
     * 根据id获取实体
     *
     * @param entityCls
     * @param id
     * @param <E>
     * @return
     */
    public <E> E getEntity(Class<E> entityCls, Serializable id);

    /***
     * 执行map条件查询实体列表
     * 使用场景：加载流程节点实例列表；
     *
     * @param cls
     * @param params
     * @return
     */
    public <E> List<E> queryBy(Class<E> cls, Map<String, Object> params);

    /***
     * 执行map条件查询实体列表
     * 使用场景：加载流程节点实例列表；
     *
     * @param cls
     * @param params
     * @return
     */
    public <E> List<E> queryList(Class<E> cls, OqlQuery oqlQuery, Map<String, Object> params);

    /**
     * 批量插入
     *
     * @param entities
     */
    void insertAll(List<? extends IEntity> entities);

    /**
     * 开启事务
     */
    public void beginTransaction();

    /**
     * 提交事务
     */
    public void commitTransaction();

    /**
     * 回滚事务
     */
    public void rollbackTransaction();

    /**
     * 结束事务
     */
    public void endTransaction();

    /**
     * 销毁处理
     */
    public void close();

    /**
     * 是否开启事务
     *
     * @param enableTransaction
     */
    void setEnableTransaction(boolean enableTransaction);
}
