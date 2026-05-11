package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.entity.Celebrity;
import com.cultural.mapper.CelebrityMapper;
import com.cultural.service.CelebrityService;
import com.cultural.vo.CelebrityVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CelebrityServiceImpl implements CelebrityService {
    
    private final CelebrityMapper celebrityMapper;
    
    @Override
    @Cacheable(value = "celebrity:list", key = "#pageDTO.pageNum + ':' + #pageDTO.pageSize + ':' + #pageDTO.city + ':' + #pageDTO.keyword")
    public Page<CelebrityVO> getPageList(PageDTO pageDTO) {
        Page<Celebrity> page = new Page<>(pageDTO.getPageNum(), pageDTO.getPageSize());
        
        LambdaQueryWrapper<Celebrity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Celebrity::getStatus, 1);
        
        if (StrUtil.isNotEmpty(pageDTO.getCity())) {
            wrapper.eq(Celebrity::getCity, pageDTO.getCity());
        }
        if (StrUtil.isNotEmpty(pageDTO.getKeyword())) {
            wrapper.like(Celebrity::getName, pageDTO.getKeyword())
                    .or()
                    .like(Celebrity::getTitle, pageDTO.getKeyword())
                    .or()
                    .like(Celebrity::getDescription, pageDTO.getKeyword());
        }
        
        wrapper.orderByDesc(Celebrity::getCreateTime);
        
        Page<Celebrity> celebrityPage = celebrityMapper.selectPage(page, wrapper);
        
        Page<CelebrityVO> voPage = new Page<>(celebrityPage.getCurrent(), celebrityPage.getSize(), celebrityPage.getTotal());
        voPage.setRecords(celebrityPage.getRecords().stream()
                .map(this::convertToVO)
                .toList());
        
        return voPage;
    }
    
    @Override
    @Cacheable(value = "celebrity:detail", key = "#id")
    public CelebrityVO getDetailById(Long id) {
        Celebrity celebrity = celebrityMapper.selectById(id);
        if (celebrity == null) {
            return null;
        }
        return convertToVO(celebrity);
    }
    
    @Override
    @CacheEvict(value = "celebrity:detail", key = "#id")
    public void incrementViewCount(Long id) {
        celebrityMapper.update(null, 
                new LambdaUpdateWrapper<Celebrity>()
                        .setSql("view_count = view_count + 1")
                        .eq(Celebrity::getId, id)
        );
    }
    
    private CelebrityVO convertToVO(Celebrity celebrity) {
        CelebrityVO vo = BeanUtil.copyProperties(celebrity, CelebrityVO.class);
        if (StrUtil.isNotEmpty(celebrity.getImages())) {
            vo.setImages(celebrity.getImages().split(","));
        }
        return vo;
    }
}
