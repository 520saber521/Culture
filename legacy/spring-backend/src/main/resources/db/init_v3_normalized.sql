-- =====================================================
-- 文化遗产管理系统 - 数据库设计规范 V2.0
-- 符合数据库第三范式（3NF）
-- 支持高性能查询与未来扩展
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS cultural_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cultural_db;

-- 设置时区
SET TIME_ZONE = '+08:00';

-- =====================================================
-- 第一部分：基础配置表（符合第一范式）
-- =====================================================

-- 1.1 分类配置表
-- 满足：原子性、主键唯一、无重复组
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `code` VARCHAR(50) NOT NULL COMMENT '分类编码（唯一标识）',
    `type` VARCHAR(30) NOT NULL COMMENT '分类类型：heritage/art/news/work',
    `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    `level` TINYINT UNSIGNED DEFAULT 1 COMMENT '分类层级：1-一级，2-二级，3-三级',
    `path` VARCHAR(255) DEFAULT NULL COMMENT '分类路径：如 1,5,12',
    `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序序号（同级别排序）',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '分类图标URL',
    `color` VARCHAR(20) DEFAULT NULL COMMENT '分类颜色（十六进制）',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
    `seo_keywords` VARCHAR(100) DEFAULT NULL COMMENT 'SEO关键词',
    `seo_description` VARCHAR(200) DEFAULT NULL COMMENT 'SEO描述',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_type_code` (`type`, `code`, `deleted`),
    UNIQUE KEY `uk_type_name` (`type`, `name`, `deleted`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_type_status` (`type`, `status`),
    KEY `idx_path` (`path`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类配置表';

-- 1.2 城市配置表
CREATE TABLE IF NOT EXISTS `city` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '城市ID',
    `name` VARCHAR(50) NOT NULL COMMENT '城市名称',
    `code` VARCHAR(20) NOT NULL COMMENT '城市编码（行政区划代码）',
    `province` VARCHAR(50) DEFAULT '江苏省' COMMENT '所属省份',
    `pinyin` VARCHAR(100) DEFAULT NULL COMMENT '城市拼音（用于排序）',
    `initial` CHAR(1) DEFAULT NULL COMMENT '首字母（大写）',
    `area_code` VARCHAR(10) DEFAULT NULL COMMENT '区号',
    `zip_code` VARCHAR(10) DEFAULT NULL COMMENT '邮编',
    `longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '经度',
    `latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '纬度',
    `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序序号',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '城市简介',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '城市封面图',
    `heritage_count` INT UNSIGNED DEFAULT 0 COMMENT '非遗数量（冗余统计）',
    `art_count` INT UNSIGNED DEFAULT 0 COMMENT '艺术数量（冗余统计）',
    `celebrity_count` INT UNSIGNED DEFAULT 0 COMMENT '名人数量（冗余统计）',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`, `deleted`),
    UNIQUE KEY `uk_name` (`name`, `deleted`),
    KEY `idx_initial` (`initial`),
    KEY `idx_pinyin` (`pinyin`),
    KEY `idx_location` (`longitude`, `latitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='城市配置表';

-- 1.3 标签表（新增：解决标签多对多关系）
CREATE TABLE IF NOT EXISTS `tag` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    `name` VARCHAR(30) NOT NULL COMMENT '标签名称',
    `type` VARCHAR(30) DEFAULT 'common' COMMENT '标签类型：common-通用，heritage-非遗，art-艺术',
    `color` VARCHAR(20) DEFAULT NULL COMMENT '标签颜色',
    `use_count` INT UNSIGNED DEFAULT 0 COMMENT '使用次数',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name_type` (`name`, `type`),
    KEY `idx_use_count` (`use_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- =====================================================
-- 第二部分：核心业务表（符合第二范式）
-- =====================================================

-- 2.1 用户表
-- 满足：所有非主键属性完全依赖于主键
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名（登录账号）',
    `password` VARCHAR(100) NOT NULL COMMENT '密码（BCrypt加密存储）',
    `salt` VARCHAR(32) DEFAULT NULL COMMENT '密码盐值',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
    `email_verified` TINYINT UNSIGNED DEFAULT 0 COMMENT '邮箱验证：0-未验证，1-已验证',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号码',
    `phone_verified` TINYINT UNSIGNED DEFAULT 0 COMMENT '手机验证：0-未验证，1-已验证',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `gender` TINYINT UNSIGNED DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    `birthday` DATE DEFAULT NULL COMMENT '出生日期',
    `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
    `city_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '城市ID',
    `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
    `signature` VARCHAR(100) DEFAULT NULL COMMENT '个性签名',
    `website` VARCHAR(255) DEFAULT NULL COMMENT '个人网站',
    `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色：user-普通用户，admin-管理员，editor-编辑',
    `level` TINYINT UNSIGNED DEFAULT 1 COMMENT '用户等级：1-10',
    `experience` INT UNSIGNED DEFAULT 0 COMMENT '经验值',
    `coin` INT UNSIGNED DEFAULT 0 COMMENT '虚拟币',
    `work_count` INT UNSIGNED DEFAULT 0 COMMENT '作品数量（冗余统计）',
    `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏数量（冗余统计）',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '获赞数量（冗余统计）',
    `follow_count` INT UNSIGNED DEFAULT 0 COMMENT '关注数量（冗余统计）',
    `follower_count` INT UNSIGNED DEFAULT 0 COMMENT '粉丝数量（冗余统计）',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-正常，2-封禁',
    `last_login_time` DATETIME(3) DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
    `last_login_device` VARCHAR(100) DEFAULT NULL COMMENT '最后登录设备',
    `login_count` INT UNSIGNED DEFAULT 0 COMMENT '登录次数',
    `password_update_time` DATETIME(3) DEFAULT NULL COMMENT '密码修改时间',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`, `deleted`),
    UNIQUE KEY `uk_phone` (`phone`, `deleted`),
    UNIQUE KEY `uk_email` (`email`, `deleted`),
    KEY `idx_nickname` (`nickname`),
    KEY `idx_city_id` (`city_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time` DESC),
    KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2.2 非物质文化遗产表
CREATE TABLE IF NOT EXISTS `heritage` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `name` VARCHAR(100) NOT NULL COMMENT '名称',
    `alias` VARCHAR(200) DEFAULT NULL COMMENT '别名（多个用逗号分隔）',
    `category_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分类ID',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类名称（冗余字段，便于查询）',
    `city_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '城市ID',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '城市名称（冗余字段）',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '简介',
    `content` LONGTEXT COMMENT '详细内容（富文本HTML）',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
    `images` JSON DEFAULT NULL COMMENT '图片列表（JSON数组）',
    `video_url` VARCHAR(255) DEFAULT NULL COMMENT '视频链接',
    `audio_url` VARCHAR(255) DEFAULT NULL COMMENT '音频链接',
    `level` TINYINT UNSIGNED DEFAULT 1 COMMENT '级别：1-国家级，2-省级，3-市级，4-县级',
    `heritage_year` VARCHAR(20) DEFAULT NULL COMMENT '入选年份',
    `declarer` VARCHAR(100) DEFAULT NULL COMMENT '申报单位/地区',
    `inheritor` VARCHAR(100) DEFAULT NULL COMMENT '代表性传承人',
    `inheritor_count` INT UNSIGNED DEFAULT 0 COMMENT '传承人数量',
    `origin_period` VARCHAR(100) DEFAULT NULL COMMENT '起源时期',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-下架，1-上架，2-审核中',
    `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞次数',
    `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏次数',
    `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论次数',
    `share_count` INT UNSIGNED DEFAULT 0 COMMENT '分享次数',
    `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序序号',
    `is_recommend` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
    `is_hot` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否热门：0-否，1-是',
    `seo_keywords` VARCHAR(100) DEFAULT NULL COMMENT 'SEO关键词',
    `seo_description` VARCHAR(200) DEFAULT NULL COMMENT 'SEO描述',
    `create_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_city_id` (`city_id`),
    KEY `idx_level` (`level`),
    KEY `idx_status` (`status`),
    KEY `idx_view_count` (`view_count` DESC),
    KEY `idx_like_count` (`like_count` DESC),
    KEY `idx_create_time` (`create_time` DESC),
    KEY `idx_recommend` (`is_recommend`, `status`),
    KEY `idx_hot` (`is_hot`, `status`),
    FULLTEXT KEY `ft_name_desc` (`name`, `description`) WITH PARSER ngram,
    CONSTRAINT `fk_heritage_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_heritage_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='非物质文化遗产表';

-- 2.3 传统艺术表
CREATE TABLE IF NOT EXISTS `traditional_art` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `name` VARCHAR(100) NOT NULL COMMENT '名称',
    `alias` VARCHAR(200) DEFAULT NULL COMMENT '别名',
    `category_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分类ID',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类名称（冗余字段）',
    `city_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '城市ID',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '城市名称（冗余字段）',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '简介',
    `content` LONGTEXT COMMENT '详细介绍（富文本）',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `images` JSON DEFAULT NULL COMMENT '图片列表（JSON数组）',
    `video_url` VARCHAR(255) DEFAULT NULL COMMENT '视频链接',
    `audio_url` VARCHAR(255) DEFAULT NULL COMMENT '音频链接',
    `origin_period` VARCHAR(100) DEFAULT NULL COMMENT '起源时期',
    `artist` VARCHAR(100) DEFAULT NULL COMMENT '代表艺术家',
    `art_form` VARCHAR(50) DEFAULT NULL COMMENT '艺术形式',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞次数',
    `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏次数',
    `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论次数',
    `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序序号',
    `is_recommend` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否推荐',
    `create_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_city_id` (`city_id`),
    KEY `idx_status` (`status`),
    KEY `idx_view_count` (`view_count` DESC),
    KEY `idx_create_time` (`create_time` DESC),
    FULLTEXT KEY `ft_name_desc` (`name`, `description`) WITH PARSER ngram,
    CONSTRAINT `fk_art_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_art_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传统艺术表';

-- 2.4 历史名人表
CREATE TABLE IF NOT EXISTS `celebrity` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `alias` VARCHAR(100) DEFAULT NULL COMMENT '别名/字号',
    `dynasty` VARCHAR(50) DEFAULT NULL COMMENT '朝代',
    `dynasty_order` INT UNSIGNED DEFAULT 0 COMMENT '朝代排序序号（用于排序）',
    `city_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '籍贯城市ID',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '籍贯城市（冗余字段）',
    `title` VARCHAR(100) DEFAULT NULL COMMENT '头衔/称号',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '简介',
    `content` LONGTEXT COMMENT '详细介绍（富文本）',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `images` JSON DEFAULT NULL COMMENT '图片列表（JSON数组）',
    `birth_year` INT DEFAULT NULL COMMENT '出生年份',
    `death_year` INT DEFAULT NULL COMMENT '逝世年份',
    `birth_place` VARCHAR(100) DEFAULT NULL COMMENT '出生地',
    `death_place` VARCHAR(100) DEFAULT NULL COMMENT '逝世地',
    `achievements` JSON DEFAULT NULL COMMENT '主要成就（JSON数组）',
    `works` JSON DEFAULT NULL COMMENT '代表作品（JSON数组）',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞次数',
    `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏次数',
    `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论次数',
    `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序序号',
    `create_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_dynasty` (`dynasty`),
    KEY `idx_dynasty_order` (`dynasty_order`),
    KEY `idx_city_id` (`city_id`),
    KEY `idx_status` (`status`),
    KEY `idx_view_count` (`view_count` DESC),
    KEY `idx_birth_year` (`birth_year`),
    FULLTEXT KEY `ft_name_desc` (`name`, `description`) WITH PARSER ngram,
    CONSTRAINT `fk_celebrity_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='历史名人表';

-- 2.5 新闻资讯表
CREATE TABLE IF NOT EXISTS `news` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `subtitle` VARCHAR(200) DEFAULT NULL COMMENT '副标题',
    `category_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分类ID',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类名称（冗余字段）',
    `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
    `content` LONGTEXT COMMENT '内容（富文本）',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `images` JSON DEFAULT NULL COMMENT '图片列表（JSON数组）',
    `author` VARCHAR(50) DEFAULT NULL COMMENT '作者名称',
    `author_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '作者ID',
    `source` VARCHAR(100) DEFAULT NULL COMMENT '来源',
    `source_url` VARCHAR(255) DEFAULT NULL COMMENT '来源链接',
    `status` TINYINT UNSIGNED DEFAULT 0 COMMENT '状态：0-草稿，1-发布，2-审核中',
    `is_top` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
    `is_hot` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否热门：0-否，1-是',
    `is_original` TINYINT UNSIGNED DEFAULT 1 COMMENT '是否原创：0-转载，1-原创',
    `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞次数',
    `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏次数',
    `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论次数',
    `publish_time` DATETIME(3) DEFAULT NULL COMMENT '发布时间',
    `seo_keywords` VARCHAR(100) DEFAULT NULL COMMENT 'SEO关键词',
    `seo_description` VARCHAR(200) DEFAULT NULL COMMENT 'SEO描述',
    `create_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_author_id` (`author_id`),
    KEY `idx_status` (`status`),
    KEY `idx_publish_time` (`publish_time` DESC),
    KEY `idx_is_top` (`is_top`, `status`),
    KEY `idx_is_hot` (`is_hot`, `status`),
    KEY `idx_view_count` (`view_count` DESC),
    FULLTEXT KEY `ft_title_summary` (`title`, `summary`) WITH PARSER ngram,
    CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻资讯表';

-- 2.6 用户作品表
CREATE TABLE IF NOT EXISTS `user_work` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
    `thumbnail_url` VARCHAR(255) DEFAULT NULL COMMENT '缩略图URL',
    `prompt` VARCHAR(1000) DEFAULT NULL COMMENT 'AI生成提示词',
    `negative_prompt` VARCHAR(500) DEFAULT NULL COMMENT '反向提示词',
    `style` VARCHAR(50) DEFAULT NULL COMMENT '风格',
    `cultural_element` VARCHAR(100) DEFAULT NULL COMMENT '文化元素',
    `heritage_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联非遗ID',
    `art_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联艺术ID',
    `ai_model` VARCHAR(50) DEFAULT NULL COMMENT 'AI模型名称',
    `ai_params` JSON DEFAULT NULL COMMENT 'AI生成参数（JSON）',
    `generation_time` INT UNSIGNED DEFAULT NULL COMMENT '生成耗时（毫秒）',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-删除，1-正常，2-审核中',
    `is_public` TINYINT UNSIGNED DEFAULT 1 COMMENT '是否公开：0-私密，1-公开',
    `is_featured` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否精选：0-否，1-是',
    `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞次数',
    `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏次数',
    `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论次数',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_heritage_id` (`heritage_id`),
    KEY `idx_art_id` (`art_id`),
    KEY `idx_cultural_element` (`cultural_element`),
    KEY `idx_status_public` (`status`, `is_public`),
    KEY `idx_create_time` (`create_time` DESC),
    KEY `idx_view_count` (`view_count` DESC),
    KEY `idx_like_count` (`like_count` DESC),
    KEY `idx_featured` (`is_featured`, `is_public`),
    FULLTEXT KEY `ft_title_desc` (`title`, `description`) WITH PARSER ngram,
    CONSTRAINT `fk_work_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_work_heritage` FOREIGN KEY (`heritage_id`) REFERENCES `heritage` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_work_art` FOREIGN KEY (`art_id`) REFERENCES `traditional_art` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户作品表';

-- =====================================================
-- 第三部分：关系表（符合第三范式）
-- =====================================================

-- 3.1 标签关联表（多对多关系）
CREATE TABLE IF NOT EXISTS `tag_relation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tag_id` BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
    `target_type` VARCHAR(30) NOT NULL COMMENT '目标类型：heritage/art/celebrity/news/work',
    `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tag_target` (`tag_id`, `target_type`, `target_id`),
    KEY `idx_target` (`target_type`, `target_id`),
    CONSTRAINT `fk_tag_relation_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签关联表';

-- 3.2 收藏表
CREATE TABLE IF NOT EXISTS `collection` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `target_type` VARCHAR(30) NOT NULL COMMENT '目标类型：heritage/art/celebrity/news/work',
    `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    `folder_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '收藏夹ID',
    `note` VARCHAR(200) DEFAULT NULL COMMENT '收藏备注',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-取消，1-收藏',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`),
    KEY `idx_target` (`target_type`, `target_id`),
    KEY `idx_folder_id` (`folder_id`),
    CONSTRAINT `fk_collection_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 3.3 点赞记录表
CREATE TABLE IF NOT EXISTS `like_record` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `target_type` VARCHAR(30) NOT NULL COMMENT '目标类型：heritage/art/celebrity/news/work/comment',
    `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-取消，1-点赞',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`),
    KEY `idx_target` (`target_type`, `target_id`),
    CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞记录表';

-- 3.4 评论表
CREATE TABLE IF NOT EXISTS `comment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `target_type` VARCHAR(30) NOT NULL COMMENT '目标类型：heritage/art/celebrity/news/work',
    `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    `parent_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '父评论ID，0表示顶级评论',
    `root_id` BIGINT UNSIGNED DEFAULT 0 COMMENT '根评论ID，0表示顶级评论',
    `reply_user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '回复用户ID',
    `content` VARCHAR(1000) NOT NULL COMMENT '评论内容',
    `images` JSON DEFAULT NULL COMMENT '评论图片（JSON数组）',
    `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
    `reply_count` INT UNSIGNED DEFAULT 0 COMMENT '回复数',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-删除，1-正常，2-审核中',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `device` VARCHAR(100) DEFAULT NULL COMMENT '设备信息',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted` TINYINT UNSIGNED DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_target` (`target_type`, `target_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_root_id` (`root_id`),
    KEY `idx_create_time` (`create_time` DESC),
    KEY `idx_status` (`status`),
    FULLTEXT KEY `ft_content` (`content`) WITH PARSER ngram,
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_reply_user` FOREIGN KEY (`reply_user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 3.5 用户关注表（新增）
CREATE TABLE IF NOT EXISTS `user_follow` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID（关注者）',
    `follow_user_id` BIGINT UNSIGNED NOT NULL COMMENT '被关注用户ID',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-取消，1-关注',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_follow` (`user_id`, `follow_user_id`),
    KEY `idx_follow_user_id` (`follow_user_id`),
    CONSTRAINT `fk_follow_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_follow_target` FOREIGN KEY (`follow_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注表';

-- =====================================================
-- 第四部分：系统辅助表
-- =====================================================

-- 4.1 搜索历史表
CREATE TABLE IF NOT EXISTS `search_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID，NULL表示游客',
    `session_id` VARCHAR(64) DEFAULT NULL COMMENT '会话ID（游客使用）',
    `keyword` VARCHAR(100) NOT NULL COMMENT '搜索关键词',
    `search_type` VARCHAR(30) DEFAULT 'all' COMMENT '搜索类型：all/heritage/art/celebrity/news/work',
    `result_count` INT UNSIGNED DEFAULT 0 COMMENT '结果数量',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `device` VARCHAR(100) DEFAULT NULL COMMENT '设备信息',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_keyword` (`keyword`),
    KEY `idx_create_time` (`create_time` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索历史表';

-- 4.2 操作日志表
CREATE TABLE IF NOT EXISTS `operation_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
    `module` VARCHAR(50) DEFAULT NULL COMMENT '模块名称',
    `operation` VARCHAR(100) DEFAULT NULL COMMENT '操作描述',
    `method` VARCHAR(200) DEFAULT NULL COMMENT '请求方法',
    `request_url` VARCHAR(255) DEFAULT NULL COMMENT '请求URL',
    `request_method` VARCHAR(10) DEFAULT NULL COMMENT 'HTTP方法',
    `request_params` TEXT COMMENT '请求参数',
    `response_result` TEXT COMMENT '响应结果',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '操作状态：0-失败，1-成功',
    `error_msg` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `location` VARCHAR(100) DEFAULT NULL COMMENT '操作地点',
    `device` VARCHAR(200) DEFAULT NULL COMMENT '设备信息',
    `duration` INT UNSIGNED DEFAULT NULL COMMENT '执行时长（毫秒）',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_module` (`module`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 4.3 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` VARCHAR(500) DEFAULT NULL COMMENT '配置值',
    `config_type` VARCHAR(50) DEFAULT 'string' COMMENT '配置类型：string/number/boolean/json',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '配置描述',
    `group` VARCHAR(50) DEFAULT 'default' COMMENT '配置分组',
    `is_public` TINYINT UNSIGNED DEFAULT 0 COMMENT '是否公开：0-否，1-是',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`),
    KEY `idx_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 4.4 文件管理表（新增）
CREATE TABLE IF NOT EXISTS `file` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件ID',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '上传用户ID',
    `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
    `stored_name` VARCHAR(100) NOT NULL COMMENT '存储文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_size` BIGINT UNSIGNED NOT NULL COMMENT '文件大小（字节）',
    `file_type` VARCHAR(50) NOT NULL COMMENT '文件类型：image/video/audio/document',
    `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
    `extension` VARCHAR(20) DEFAULT NULL COMMENT '文件扩展名',
    `width` INT UNSIGNED DEFAULT NULL COMMENT '图片宽度',
    `height` INT UNSIGNED DEFAULT NULL COMMENT '图片高度',
    `duration` INT UNSIGNED DEFAULT NULL COMMENT '音视频时长（秒）',
    `md5` VARCHAR(32) DEFAULT NULL COMMENT '文件MD5值',
    `use_count` INT UNSIGNED DEFAULT 0 COMMENT '使用次数',
    `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-删除，1-正常',
    `create_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `update_time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_file_type` (`file_type`),
    KEY `idx_md5` (`md5`),
    KEY `idx_create_time` (`create_time` DESC),
    CONSTRAINT `fk_file_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件管理表';

-- =====================================================
-- 第五部分：触发器（自动更新统计字段）
-- =====================================================

DELIMITER //

-- 用户作品数量统计触发器
CREATE TRIGGER `trg_work_insert_count` 
AFTER INSERT ON `user_work` 
FOR EACH ROW
BEGIN
    IF NEW.status = 1 AND NEW.is_public = 1 AND NEW.deleted = 0 THEN
        UPDATE `user` SET work_count = work_count + 1 WHERE id = NEW.user_id;
    END IF;
END//

CREATE TRIGGER `trg_work_delete_count` 
AFTER UPDATE ON `user_work` 
FOR EACH ROW
BEGIN
    IF OLD.status = 1 AND OLD.is_public = 1 AND OLD.deleted = 0 
       AND (NEW.status = 0 OR NEW.deleted = 1) THEN
        UPDATE `user` SET work_count = GREATEST(0, work_count - 1) WHERE id = NEW.user_id;
    END IF;
END//

-- 收藏数量统计触发器
CREATE TRIGGER `trg_collection_insert` 
AFTER INSERT ON `collection` 
FOR EACH ROW
BEGIN
    IF NEW.status = 1 THEN
        UPDATE `user` SET collect_count = collect_count + 1 WHERE id = NEW.user_id;
        CASE NEW.target_type
            WHEN 'heritage' THEN UPDATE `heritage` SET collect_count = collect_count + 1 WHERE id = NEW.target_id;
            WHEN 'art' THEN UPDATE `traditional_art` SET collect_count = collect_count + 1 WHERE id = NEW.target_id;
            WHEN 'work' THEN UPDATE `user_work` SET collect_count = collect_count + 1 WHERE id = NEW.target_id;
            WHEN 'news' THEN UPDATE `news` SET collect_count = collect_count + 1 WHERE id = NEW.target_id;
        END CASE;
    END IF;
END//

CREATE TRIGGER `trg_collection_update` 
AFTER UPDATE ON `collection` 
FOR EACH ROW
BEGIN
    IF OLD.status = 1 AND NEW.status = 0 THEN
        UPDATE `user` SET collect_count = GREATEST(0, collect_count - 1) WHERE id = NEW.user_id;
        CASE NEW.target_type
            WHEN 'heritage' THEN UPDATE `heritage` SET collect_count = GREATEST(0, collect_count - 1) WHERE id = NEW.target_id;
            WHEN 'art' THEN UPDATE `traditional_art` SET collect_count = GREATEST(0, collect_count - 1) WHERE id = NEW.target_id;
            WHEN 'work' THEN UPDATE `user_work` SET collect_count = GREATEST(0, collect_count - 1) WHERE id = NEW.target_id;
            WHEN 'news' THEN UPDATE `news` SET collect_count = GREATEST(0, collect_count - 1) WHERE id = NEW.target_id;
        END CASE;
    END IF;
END//

-- 点赞数量统计触发器
CREATE TRIGGER `trg_like_insert` 
AFTER INSERT ON `like_record` 
FOR EACH ROW
BEGIN
    IF NEW.status = 1 THEN
        CASE NEW.target_type
            WHEN 'heritage' THEN UPDATE `heritage` SET like_count = like_count + 1 WHERE id = NEW.target_id;
            WHEN 'art' THEN UPDATE `traditional_art` SET like_count = like_count + 1 WHERE id = NEW.target_id;
            WHEN 'work' THEN 
                BEGIN
                    UPDATE `user_work` SET like_count = like_count + 1 WHERE id = NEW.target_id;
                    UPDATE `user` u JOIN `user_work` w ON w.user_id = u.id SET u.like_count = u.like_count + 1 WHERE w.id = NEW.target_id;
                END;
            WHEN 'comment' THEN UPDATE `comment` SET like_count = like_count + 1 WHERE id = NEW.target_id;
        END CASE;
    END IF;
END//

CREATE TRIGGER `trg_like_update` 
AFTER UPDATE ON `like_record` 
FOR EACH ROW
BEGIN
    IF OLD.status = 1 AND NEW.status = 0 THEN
        CASE NEW.target_type
            WHEN 'heritage' THEN UPDATE `heritage` SET like_count = GREATEST(0, like_count - 1) WHERE id = NEW.target_id;
            WHEN 'art' THEN UPDATE `traditional_art` SET like_count = GREATEST(0, like_count - 1) WHERE id = NEW.target_id;
            WHEN 'work' THEN 
                BEGIN
                    UPDATE `user_work` SET like_count = GREATEST(0, like_count - 1) WHERE id = NEW.target_id;
                    UPDATE `user` u JOIN `user_work` w ON w.user_id = u.id SET u.like_count = GREATEST(0, u.like_count - 1) WHERE w.id = NEW.target_id;
                END;
            WHEN 'comment' THEN UPDATE `comment` SET like_count = GREATEST(0, like_count - 1) WHERE id = NEW.target_id;
        END CASE;
    END IF;
END//

-- 评论数量统计触发器
CREATE TRIGGER `trg_comment_insert` 
AFTER INSERT ON `comment` 
FOR EACH ROW
BEGIN
    IF NEW.status = 1 AND NEW.deleted = 0 THEN
        CASE NEW.target_type
            WHEN 'heritage' THEN UPDATE `heritage` SET comment_count = comment_count + 1 WHERE id = NEW.target_id;
            WHEN 'art' THEN UPDATE `traditional_art` SET comment_count = comment_count + 1 WHERE id = NEW.target_id;
            WHEN 'work' THEN UPDATE `user_work` SET comment_count = comment_count + 1 WHERE id = NEW.target_id;
            WHEN 'news' THEN UPDATE `news` SET comment_count = comment_count + 1 WHERE id = NEW.target_id;
        END CASE;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- 第六部分：存储过程
-- =====================================================

DELIMITER //

-- 分页查询存储过程
CREATE PROCEDURE `sp_page_query`(
    IN p_table VARCHAR(50),
    IN p_fields VARCHAR(500),
    IN p_where VARCHAR(1000),
    IN p_order VARCHAR(100),
    IN p_page_num INT,
    IN p_page_size INT,
    OUT p_total INT
)
BEGIN
    DECLARE v_offset INT;
    DECLARE v_sql_count VARCHAR(2000);
    DECLARE v_sql_data VARCHAR(4000);
    
    SET v_offset = (p_page_num - 1) * p_page_size;
    
    SET v_sql_count = CONCAT('SELECT COUNT(*) INTO @total FROM ', p_table);
    IF p_where IS NOT NULL AND p_where != '' THEN
        SET v_sql_count = CONCAT(v_sql_count, ' WHERE ', p_where);
    END IF;
    
    SET @sql_count = v_sql_count;
    PREPARE stmt_count FROM @sql_count;
    EXECUTE stmt_count;
    DEALLOCATE PREPARE stmt_count;
    
    SET p_total = @total;
    
    SET v_sql_data = CONCAT('SELECT ', p_fields, ' FROM ', p_table);
    IF p_where IS NOT NULL AND p_where != '' THEN
        SET v_sql_data = CONCAT(v_sql_data, ' WHERE ', p_where);
    END IF;
    IF p_order IS NOT NULL AND p_order != '' THEN
        SET v_sql_data = CONCAT(v_sql_data, ' ORDER BY ', p_order);
    END IF;
    SET v_sql_data = CONCAT(v_sql_data, ' LIMIT ', v_offset, ', ', p_page_size);
    
    SET @sql_data = v_sql_data;
    PREPARE stmt_data FROM @sql_data;
    EXECUTE stmt_data;
    DEALLOCATE PREPARE stmt_data;
END//

-- 批量更新浏览次数
CREATE PROCEDURE `sp_batch_increment_view`(
    IN p_target_type VARCHAR(30),
    IN p_ids TEXT
)
BEGIN
    DECLARE v_sql VARCHAR(4000);
    
    SET v_sql = CONCAT('UPDATE ', 
        CASE p_target_type
            WHEN 'heritage' THEN '`heritage`'
            WHEN 'art' THEN '`traditional_art`'
            WHEN 'celebrity' THEN '`celebrity`'
            WHEN 'work' THEN '`user_work`'
            WHEN 'news' THEN '`news`'
        END,
        ' SET view_count = view_count + 1 WHERE id IN (', p_ids, ')');
    
    SET @sql = v_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//

DELIMITER ;

-- =====================================================
-- 第七部分：视图
-- =====================================================

-- 热门非遗视图
CREATE OR REPLACE VIEW `v_hot_heritage` AS
SELECT 
    h.id, h.name, h.category, h.city, h.description, h.cover_image, h.level,
    h.view_count, h.like_count, h.collect_count, h.create_time
FROM heritage h
WHERE h.status = 1 AND h.deleted = 0
ORDER BY h.view_count DESC, h.like_count DESC;

-- 热门作品视图
CREATE OR REPLACE VIEW `v_hot_works` AS
SELECT 
    w.id, w.title, w.description, w.image_url, w.thumbnail_url, w.style, w.cultural_element,
    w.view_count, w.like_count, w.collect_count, w.create_time,
    u.id as author_id, u.nickname as author_name, u.avatar as author_avatar
FROM user_work w
LEFT JOIN user u ON w.user_id = u.id
WHERE w.status = 1 AND w.is_public = 1 AND w.deleted = 0
ORDER BY w.view_count DESC, w.like_count DESC;

-- 用户统计视图
CREATE OR REPLACE VIEW `v_user_stats` AS
SELECT 
    u.id, u.username, u.nickname, u.avatar,
    u.work_count, u.collect_count, u.like_count, u.follow_count, u.follower_count,
    u.create_time
FROM user u
WHERE u.status = 1 AND u.deleted = 0;

-- =====================================================
-- 第八部分：初始数据
-- =====================================================

-- 插入城市数据
INSERT INTO `city` (`name`, `code`, `pinyin`, `initial`, `sort_order`, `description`, `longitude`, `latitude`) VALUES
('南京', '320100', 'nanjing', 'N', 1, '江苏省省会，六朝古都，历史文化名城', 118.767413, 32.041544),
('苏州', '320500', 'suzhou', 'S', 2, '江南水乡，园林之城，吴文化发源地', 120.585316, 31.299379),
('无锡', '320200', 'wuxi', 'W', 3, '太湖明珠，民族工商业发祥地', 120.311910, 31.491169),
('扬州', '321000', 'yangzhou', 'Y', 4, '运河之都，园林城市，淮扬菜之乡', 119.421003, 32.393159),
('常州', '320400', 'changzhou', 'C', 5, '龙城，春秋淹城遗址所在地', 119.973987, 31.810689),
('镇江', '321100', 'zhenjiang', 'Z', 6, '江河交汇，醋都，三国文化名城', 119.425836, 32.187849),
('徐州', '320300', 'xuzhou', 'X', 7, '彭城，汉文化发源地', 117.284124, 34.204404),
('南通', '320600', 'nantong', 'N', 8, '江海明珠，中国近代第一城', 120.894291, 31.980171),
('淮安', '320800', 'huaian', 'H', 9, '运河之都，周恩来故里', 119.021265, 33.597506),
('盐城', '320900', 'yancheng', 'Y', 10, '东方湿地之都，丹顶鹤之乡', 120.163561, 33.347382),
('连云港', '320700', 'lianyungang', 'L', 11, '东海名郡，西游记文化发源地', 119.221611, 34.596653),
('泰州', '321200', 'taizhou', 'T', 12, '凤城，祥泰之州', 119.922933, 32.455536),
('宿迁', '321300', 'suqian', 'S', 13, '项王故里，酒都', 118.275198, 33.963008);

-- 插入分类数据
INSERT INTO `category` (`name`, `code`, `type`, `sort_order`, `description`) VALUES
('传统技艺', 'traditional_craft', 'heritage', 1, '传统手工技艺类非物质文化遗产'),
('传统美术', 'traditional_art', 'heritage', 2, '传统美术类非物质文化遗产'),
('传统戏剧', 'traditional_drama', 'heritage', 3, '传统戏剧类非物质文化遗产'),
('传统音乐', 'traditional_music', 'heritage', 4, '传统音乐类非物质文化遗产'),
('传统舞蹈', 'traditional_dance', 'heritage', 5, '传统舞蹈类非物质文化遗产'),
('曲艺', 'quyi', 'art', 1, '曲艺表演艺术'),
('美术', 'fine_art', 'art', 2, '美术艺术'),
('音乐', 'music', 'art', 3, '音乐艺术'),
('非遗动态', 'heritage_news', 'news', 1, '非物质文化遗产相关动态'),
('文化交流', 'cultural_exchange', 'news', 2, '文化交流活动资讯');

-- 插入系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`, `group`) VALUES
('site_name', '文化遗产管理系统', 'string', '网站名称', 'basic'),
('site_description', '江苏文化遗产数字化展示平台', 'string', '网站描述', 'basic'),
('upload_max_size', '50', 'number', '上传文件最大大小（MB）', 'upload'),
('upload_allow_types', 'jpg,jpeg,png,gif,mp4,pdf', 'string', '允许上传的文件类型', 'upload'),
('comment_enable', 'true', 'boolean', '是否开启评论功能', 'feature'),
('search_history_days', '30', 'number', '搜索历史保留天数', 'system');

-- 插入测试用户（密码为 123456 的 BCrypt 加密）
INSERT INTO `user` (`username`, `password`, `nickname`, `email`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', 'admin@cultural.com', 'admin', 1),
('test', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '测试用户', 'test@cultural.com', 'user', 1);

-- =====================================================
-- 第九部分：索引优化建议
-- =====================================================

-- 对于大数据量表，建议使用分区
-- ALTER TABLE `operation_log` PARTITION BY RANGE (YEAR(create_time)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION pmax VALUES LESS THAN MAXVALUE
-- );

-- 对于搜索历史表，建议定期清理
-- CREATE EVENT IF NOT EXISTS `evt_clean_search_history`
-- ON SCHEDULE EVERY 1 DAY
-- DO DELETE FROM `search_history` WHERE create_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
