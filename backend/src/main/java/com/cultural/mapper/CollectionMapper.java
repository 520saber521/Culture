package com.cultural.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cultural.entity.UserCollection;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CollectionMapper extends BaseMapper<UserCollection> {
}
