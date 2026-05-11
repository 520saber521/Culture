package com.cultural.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cultural.entity.Celebrity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CelebrityMapper extends BaseMapper<Celebrity> {
}
