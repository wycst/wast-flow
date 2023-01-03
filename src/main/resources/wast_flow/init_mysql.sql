-- ----------------------------
-- Table structure for `wrf_process_definition`
-- ----------------------------
-- DROP TABLE IF EXISTS `wrf_process_definition`;
CREATE TABLE IF NOT EXISTS `wrf_process_definition`
(
    `id`               varchar(36) NOT NULL,
    `process_id`       varchar(64) UNIQUE DEFAULT NULL,
    `process_name`     varchar(64)        DEFAULT NULL,
    `process_status`   varchar(16)        DEFAULT NULL,
    `process_mode`     varchar(16)        DEFAULT NULL,
    `process_describe` varchar(16)        DEFAULT NULL,
    `resource_kind`    varchar(16)        DEFAULT NULL,
    `resource_content` longtext           DEFAULT NULL,
    `create_date`      datetime           DEFAULT NULL,
    `last_modify_date` datetime           DEFAULT NULL,
    `creator`          varchar(64)        DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for `wrf_process_deploy`
-- ----------------------------
-- DROP TABLE IF EXISTS `wrf_process_deploy`;
CREATE TABLE IF NOT EXISTS `wrf_process_deploy`
(
    `id`               varchar(36) NOT NULL,
    `process_id`       varchar(64) DEFAULT NULL,
    `process_name`     varchar(64) DEFAULT NULL,
    `resource_kind`    varchar(16) DEFAULT NULL,
    `resource_content` longtext    DEFAULT NULL,
    `deploy_date`      datetime    DEFAULT NULL,
    `version`          varchar(64) DEFAULT NULL,
    `creator`          varchar(64) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for `wrf_process_instance`
-- ----------------------------
-- DROP TABLE IF EXISTS `wrf_process_instance`;
CREATE TABLE IF NOT EXISTS `wrf_process_instance`
(
    `id`               varchar(36) NOT NULL,
    `parent_id`        varchar(36) DEFAULT NULL,
    `process_id`       varchar(64) DEFAULT NULL,
    `process_name`     varchar(64) DEFAULT NULL,
    `create_date`      datetime    DEFAULT NULL,
    `completed_date`   datetime    DEFAULT NULL,
    `last_modify_date` datetime    DEFAULT NULL,
    `instance_status`  varchar(16) DEFAULT NULL,
    `process_version`  varchar(64) DEFAULT NULL,
    `creator`          varchar(64) DEFAULT NULL,
    `variables`        longtext    DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for `wrf_node_instance`
-- ----------------------------
-- DROP TABLE IF EXISTS `wrf_node_instance`;
CREATE TABLE IF NOT EXISTS `wrf_node_instance`
(
    `id`                    varchar(36) NOT NULL,
    `node_instance_id`      int(19)     DEFAULT NULL,
    `prev_node_instance_id` int(19)     DEFAULT NULL,
    `node_id`               varchar(36) DEFAULT NULL,
    `node_name`             varchar(64) DEFAULT NULL,
    `node_type`             varchar(32) DEFAULT NULL,
    `node_unique_id`        varchar(36) DEFAULT NULL,
    `process_id`            varchar(64) DEFAULT NULL,
    `process_instance_id`   varchar(36) DEFAULT NULL,
    `process_name`          varchar(64) DEFAULT NULL,
    `in_date`               datetime    DEFAULT NULL,
    `out_date`              datetime    DEFAULT NULL,
    `instance_status`       varchar(16) DEFAULT NULL,
    `handler_status`        varchar(16) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

-- ----------------------------
-- Table structure for `wrf_connect_instance`
-- ----------------------------
-- DROP TABLE IF EXISTS `wrf_connect_instance`;
CREATE TABLE IF NOT EXISTS `wrf_connect_instance`
(
    `id`                  varchar(36) NOT NULL,
    `connect_id`          varchar(36) DEFAULT NULL,
    `process_instance_id` varchar(36) DEFAULT NULL,
    `node_id`             varchar(36) DEFAULT NULL,
    `node_instance_id`    int(19)     DEFAULT NULL,
    `execute_time`        datetime    DEFAULT NULL,
    `condition_type`      varchar(16) DEFAULT NULL,
    `instance_status`     varchar(16) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;