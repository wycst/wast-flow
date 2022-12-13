package io.github.wycst.wast.flow.defaults;

import io.github.wycst.wast.flow.definition.FlowEntityManager;
import io.github.wycst.wast.flow.entitys.IEntity;
import io.github.wycst.wast.jdbc.executer.DefaultSqlExecuter;
import io.github.wycst.wast.jdbc.executer.EntityManagementFactory;

import javax.sql.DataSource;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 实体类管理缺省实现
 *
 * @Author wangyunchao
 * @Date 2022/12/2 10:39
 */
public class DefaultFlowEntityManager implements FlowEntityManager {

    private final DefaultSqlExecuter sqlExecuter;
    private boolean enableTransaction;

    public DefaultFlowEntityManager(DataSource dataSource) {
        DefaultSqlExecuter sqlExecuter = new DefaultSqlExecuter();
        sqlExecuter.setDataSource(dataSource);
        this.sqlExecuter = sqlExecuter;
    }

    public void setEnableTransaction(boolean enableTransaction) {
        this.enableTransaction = enableTransaction;
    }

    public void setShowSql(boolean showSql) {
        sqlExecuter.setShowSql(showSql);
    }

    public void setShowSqlParameters(boolean showSqlParameters) {
        sqlExecuter.setShowSqlParameters(showSqlParameters);
    }

    @Override
    public void init() {
        // scan entitys
        EntityManagementFactory.defaultManagementFactory().scanPackages(IEntity.class.getPackage().getName());
        try {
            sqlExecuter.executeScript(this.getClass().getResourceAsStream("/wast_flow/init.sql"));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
    }

    @Override
    public void insert(IEntity entity) {
        sqlExecuter.getEntityExecuter().insert(entity);
    }

    @Override
    public void update(IEntity entity, String... fields) {
        if(fields.length > 0) {
            sqlExecuter.getEntityExecuter().updateFields(entity, fields);
        } else {
            sqlExecuter.getEntityExecuter().update(entity);
        }
    }

    @Override
    public void deleteEntity(Class<? extends IEntity> entityCLs, Serializable id) {
        sqlExecuter.getEntityExecuter().delete(entityCLs, id);
    }

    @Override
    public <E> E getEntity(Class<E> entityCls, Serializable id) {
        return sqlExecuter.getEntityExecuter().get(entityCls, id);
    }

    @Override
    public <E> List<E> queryBy(Class<E> cls, Map<String, Object> params) {
        return sqlExecuter.getEntityExecuter().queryBy(cls, params);
    }

    public void beginTransaction() {
        if(enableTransaction) {
            sqlExecuter.beginTransaction();
        }
    }

    public void commitTransaction() {
        if(enableTransaction) {
            sqlExecuter.commitTransaction();
        }
    }

    public void rollbackTransaction() {
        if(enableTransaction) {
            sqlExecuter.rollbackTransaction();
        }
    }

    public void endTransaction() {
        if(enableTransaction) {
            sqlExecuter.endTransaction();
        }
    }

    @Override
    public void close() {
        sqlExecuter.close();
    }
}
