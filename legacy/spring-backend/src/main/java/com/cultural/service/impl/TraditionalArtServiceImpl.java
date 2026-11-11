package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.entity.TraditionalArt;
import com.cultural.mapper.TraditionalArtMapper;
import com.cultural.service.TraditionalArtService;
import com.cultural.vo.TraditionalArtVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TraditionalArtServiceImpl implements TraditionalArtService {
    
    private final TraditionalArtMapper traditionalArtMapper;
    
    @Override
    @Cacheable(value = "arts:list", key = "#pageDTO.pageNum + ':' + #pageDTO.pageSize + ':' + #pageDTO.category + ':' + #pageDTO.city")
    public Page<TraditionalArtVO> getPageList(PageDTO pageDTO) {
        Page<TraditionalArt> page = new Page<>(pageDTO.getPageNum(), pageDTO.getPageSize());
        
        LambdaQueryWrapper<TraditionalArt> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TraditionalArt::getStatus, 1);
        
        if (StrUtil.isNotEmpty(pageDTO.getCategory())) {
            wrapper.eq(TraditionalArt::getCategory, pageDTO.getCategory());
        }
        if (StrUtil.isNotEmpty(pageDTO.getCity())) {
            wrapper.eq(TraditionalArt::getCity, pageDTO.getCity());
        }
        if (StrUtil.isNotEmpty(pageDTO.getKeyword())) {
            wrapper.like(TraditionalArt::getName, pageDTO.getKeyword())
                    .or()
                    .like(TraditionalArt::getDescription, pageDTO.getKeyword());
        }
        
        wrapper.orderByDesc(TraditionalArt::getCreateTime);
        
        Page<TraditionalArt> artPage = traditionalArtMapper.selectPage(page, wrapper);
        
        Page<TraditionalArtVO> voPage = new Page<>(artPage.getCurrent(), artPage.getSize(), artPage.getTotal());
        voPage.setRecords(artPage.getRecords().stream()
                .map(this::convertToVO)
                .toList());
        
        return voPage;
    }
    
    @Override
    @Cacheable(value = "arts:detail", key = "#id")
    public TraditionalArtVO getDetailById(Long id) {
        TraditionalArt art = traditionalArtMapper.selectById(id);
        if (art == null) {
            return null;
        }
        return convertToVO(art);
    }
    
    @Override
    @CacheEvict(value = "arts:detail", key = "#id")
    public void incrementViewCount(Long id) {
        traditionalArtMapper.update(null, 
                new LambdaUpdateWrapper<TraditionalArt>()
                        .setSql("view_count = view_count + 1")
                        .eq(TraditionalArt::getId, id)
        );
    }
    
    private TraditionalArtVO convertToVO(TraditionalArt art) {
        TraditionalArtVO vo = BeanUtil.copyProperties(art, TraditionalArtVO.class);
        if (StrUtil.isNotEmpty(art.getImages())) {
            vo.setImages(art.getImages().split(","));
        }
        return vo;
    }
}
