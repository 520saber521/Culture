package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.entity.Heritage;
import com.cultural.mapper.HeritageMapper;
import com.cultural.service.CollectionService;
import com.cultural.service.HeritageService;
import com.cultural.service.LikeService;
import com.cultural.vo.HeritageVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeritageServiceImpl implements HeritageService {
    
    private final HeritageMapper heritageMapper;
    private final LikeService likeService;
    private final CollectionService collectionService;
    
    @Override
    @Cacheable(value = "heritage:list", key = "#pageDTO.pageNum + ':' + #pageDTO.pageSize + ':' + #pageDTO.category + ':' + #pageDTO.city")
    public Page<HeritageVO> getPageList(PageDTO pageDTO) {
        Page<Heritage> page = new Page<>(pageDTO.getPageNum(), pageDTO.getPageSize());
        
        LambdaQueryWrapper<Heritage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Heritage::getStatus, 1);
        
        if (StrUtil.isNotEmpty(pageDTO.getCategory())) {
            wrapper.eq(Heritage::getCategory, pageDTO.getCategory());
        }
        if (StrUtil.isNotEmpty(pageDTO.getCity())) {
            wrapper.eq(Heritage::getCity, pageDTO.getCity());
        }
        if (StrUtil.isNotEmpty(pageDTO.getKeyword())) {
            wrapper.and(w -> w.like(Heritage::getName, pageDTO.getKeyword())
                    .or().like(Heritage::getDescription, pageDTO.getKeyword())
                    .or().like(Heritage::getTags, pageDTO.getKeyword()));
        }
        
        wrapper.orderByDesc(Heritage::getViewCount);
        wrapper.orderByDesc(Heritage::getCreateTime);
        
        Page<Heritage> heritagePage = heritageMapper.selectPage(page, wrapper);
        
        Page<HeritageVO> voPage = new Page<>(heritagePage.getCurrent(), heritagePage.getSize(), heritagePage.getTotal());
        voPage.setRecords(heritagePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        
        return voPage;
    }
    
    @Override
    @Cacheable(value = "heritage:detail", key = "#id")
    public HeritageVO getDetailById(Long id) {
        Heritage heritage = heritageMapper.selectById(id);
        if (heritage == null) {
            return null;
        }
        return convertToVO(heritage);
    }
    
    @Override
    @CacheEvict(value = "heritage:detail", key = "#id")
    public void incrementViewCount(Long id) {
        heritageMapper.update(null, 
                new LambdaUpdateWrapper<Heritage>()
                        .setSql("view_count = view_count + 1")
                        .eq(Heritage::getId, id)
        );
    }
    
    @Override
    @CacheEvict(value = "heritage:detail", key = "#id")
    public void incrementLikeCount(Long id) {
        heritageMapper.update(null, 
                new LambdaUpdateWrapper<Heritage>()
                        .setSql("like_count = like_count + 1")
                        .eq(Heritage::getId, id)
        );
    }
    
    private HeritageVO convertToVO(Heritage heritage) {
        HeritageVO vo = BeanUtil.copyProperties(heritage, HeritageVO.class);
        
        if (StrUtil.isNotEmpty(heritage.getImages())) {
            vo.setImages(heritage.getImages().split(","));
        }
        if (StrUtil.isNotEmpty(heritage.getTags())) {
            vo.setTags(heritage.getTags().split(","));
        }
        
        vo.setLevelName(getLevelName(heritage.getLevel()));
        
        return vo;
    }
    
    private String getLevelName(Integer level) {
        if (level == null) return "未知";
        return switch (level) {
            case 1 -> "国家级";
            case 2 -> "省级";
            case 3 -> "市级";
            case 4 -> "县级";
            default -> "未知";
        };
    }
}
