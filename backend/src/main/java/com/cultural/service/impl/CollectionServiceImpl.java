package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.CollectionDTO;
import com.cultural.entity.*;
import com.cultural.mapper.*;
import com.cultural.service.CollectionService;
import com.cultural.vo.HeritageVO;
import com.cultural.vo.NewsVO;
import com.cultural.vo.TraditionalArtVO;
import com.cultural.vo.UserWorkVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollectionServiceImpl implements CollectionService {
    
    private final CollectionMapper collectionMapper;
    private final HeritageMapper heritageMapper;
    private final TraditionalArtMapper traditionalArtMapper;
    private final NewsMapper newsMapper;
    private final UserWorkMapper userWorkMapper;
    
    @Override
    public void toggleCollection(CollectionDTO collectionDTO, Long userId) {
        LambdaQueryWrapper<UserCollection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCollection::getUserId, userId)
                .eq(UserCollection::getTargetType, collectionDTO.getTargetType())
                .eq(UserCollection::getTargetId, collectionDTO.getTargetId());
        
        UserCollection existing = collectionMapper.selectOne(wrapper);
        
        if (existing != null) {
            existing.setStatus(existing.getStatus() == 1 ? 0 : 1);
            collectionMapper.updateById(existing);
        } else {
            UserCollection collection = new UserCollection();
            collection.setUserId(userId);
            collection.setTargetType(collectionDTO.getTargetType());
            collection.setTargetId(collectionDTO.getTargetId());
            collection.setStatus(1);
            collectionMapper.insert(collection);
        }
    }
    
    @Override
    public boolean isCollected(Long userId, String targetType, Long targetId) {
        if (userId == null) {
            return false;
        }
        Long count = collectionMapper.selectCount(
                new LambdaQueryWrapper<UserCollection>()
                        .eq(UserCollection::getUserId, userId)
                        .eq(UserCollection::getTargetType, targetType)
                        .eq(UserCollection::getTargetId, targetId)
                        .eq(UserCollection::getStatus, 1)
        );
        return count != null && count > 0;
    }
    
    @Override
    public Page<HeritageVO> getHeritageCollections(Long userId, Integer pageNum, Integer pageSize) {
        Page<UserCollection> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserCollection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCollection::getUserId, userId)
                .eq(UserCollection::getTargetType, "heritage")
                .eq(UserCollection::getStatus, 1)
                .orderByDesc(UserCollection::getCreateTime);
        
        Page<UserCollection> collectionPage = collectionMapper.selectPage(page, wrapper);
        
        List<HeritageVO> voList = collectionPage.getRecords().stream()
                .map(c -> heritageMapper.selectById(c.getTargetId()))
                .filter(h -> h != null && h.getStatus() == 1)
                .map(this::convertHeritageToVO)
                .collect(Collectors.toList());
        
        Page<HeritageVO> voPage = new Page<>(collectionPage.getCurrent(), collectionPage.getSize(), collectionPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }
    
    @Override
    public Page<TraditionalArtVO> getArtCollections(Long userId, Integer pageNum, Integer pageSize) {
        Page<UserCollection> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserCollection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCollection::getUserId, userId)
                .eq(UserCollection::getTargetType, "art")
                .eq(UserCollection::getStatus, 1)
                .orderByDesc(UserCollection::getCreateTime);
        
        Page<UserCollection> collectionPage = collectionMapper.selectPage(page, wrapper);
        
        List<TraditionalArtVO> voList = collectionPage.getRecords().stream()
                .map(c -> traditionalArtMapper.selectById(c.getTargetId()))
                .filter(a -> a != null && a.getStatus() == 1)
                .map(this::convertArtToVO)
                .collect(Collectors.toList());
        
        Page<TraditionalArtVO> voPage = new Page<>(collectionPage.getCurrent(), collectionPage.getSize(), collectionPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }
    
    @Override
    public Page<NewsVO> getNewsCollections(Long userId, Integer pageNum, Integer pageSize) {
        Page<UserCollection> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserCollection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCollection::getUserId, userId)
                .eq(UserCollection::getTargetType, "news")
                .eq(UserCollection::getStatus, 1)
                .orderByDesc(UserCollection::getCreateTime);
        
        Page<UserCollection> collectionPage = collectionMapper.selectPage(page, wrapper);
        
        List<NewsVO> voList = collectionPage.getRecords().stream()
                .map(c -> newsMapper.selectById(c.getTargetId()))
                .filter(n -> n != null && n.getStatus() == 1)
                .map(this::convertNewsToVO)
                .collect(Collectors.toList());
        
        Page<NewsVO> voPage = new Page<>(collectionPage.getCurrent(), collectionPage.getSize(), collectionPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }
    
    @Override
    public Page<UserWorkVO> getWorkCollections(Long userId, Integer pageNum, Integer pageSize) {
        Page<UserCollection> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserCollection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCollection::getUserId, userId)
                .eq(UserCollection::getTargetType, "work")
                .eq(UserCollection::getStatus, 1)
                .orderByDesc(UserCollection::getCreateTime);
        
        Page<UserCollection> collectionPage = collectionMapper.selectPage(page, wrapper);
        
        List<UserWorkVO> voList = collectionPage.getRecords().stream()
                .map(c -> userWorkMapper.selectById(c.getTargetId()))
                .filter(w -> w != null && w.getStatus() == 1 && w.getIsPublic() == 1)
                .map(this::convertWorkToVO)
                .collect(Collectors.toList());
        
        Page<UserWorkVO> voPage = new Page<>(collectionPage.getCurrent(), collectionPage.getSize(), collectionPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }
    
    private HeritageVO convertHeritageToVO(Heritage heritage) {
        HeritageVO vo = BeanUtil.copyProperties(heritage, HeritageVO.class);
        if (StrUtil.isNotEmpty(heritage.getImages())) {
            vo.setImages(heritage.getImages().split(","));
        }
        if (StrUtil.isNotEmpty(heritage.getTags())) {
            vo.setTags(heritage.getTags().split(","));
        }
        vo.setLevelName(getLevelName(heritage.getLevel()));
        vo.setIsCollected(true);
        return vo;
    }
    
    private TraditionalArtVO convertArtToVO(TraditionalArt art) {
        TraditionalArtVO vo = BeanUtil.copyProperties(art, TraditionalArtVO.class);
        if (StrUtil.isNotEmpty(art.getImages())) {
            vo.setImages(art.getImages().split(","));
        }
        if (StrUtil.isNotEmpty(art.getTags())) {
            vo.setTags(art.getTags().split(","));
        }
        vo.setIsCollected(true);
        return vo;
    }
    
    private NewsVO convertNewsToVO(News news) {
        NewsVO vo = BeanUtil.copyProperties(news, NewsVO.class);
        if (StrUtil.isNotEmpty(news.getImages())) {
            vo.setImages(news.getImages().split(","));
        }
        if (StrUtil.isNotEmpty(news.getTags())) {
            vo.setTags(news.getTags().split(","));
        }
        vo.setIsTop(news.getIsTop() != null && news.getIsTop() == 1);
        vo.setIsHot(news.getIsHot() != null && news.getIsHot() == 1);
        vo.setIsCollected(true);
        return vo;
    }
    
    private UserWorkVO convertWorkToVO(UserWork work) {
        UserWorkVO vo = BeanUtil.copyProperties(work, UserWorkVO.class);
        if (StrUtil.isNotEmpty(work.getTags())) {
            vo.setTags(work.getTags().split(","));
        }
        vo.setIsPublic(work.getIsPublic() != null && work.getIsPublic() == 1);
        vo.setIsFeatured(work.getIsFeatured() != null && work.getIsFeatured() == 1);
        vo.setIsCollected(true);
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
