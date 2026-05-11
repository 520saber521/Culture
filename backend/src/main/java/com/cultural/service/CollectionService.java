package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.CollectionDTO;
import com.cultural.vo.HeritageVO;
import com.cultural.vo.NewsVO;
import com.cultural.vo.TraditionalArtVO;
import com.cultural.vo.UserWorkVO;

public interface CollectionService {
    
    void toggleCollection(CollectionDTO collectionDTO, Long userId);
    
    boolean isCollected(Long userId, String targetType, Long targetId);
    
    Page<HeritageVO> getHeritageCollections(Long userId, Integer pageNum, Integer pageSize);
    
    Page<TraditionalArtVO> getArtCollections(Long userId, Integer pageNum, Integer pageSize);
    
    Page<NewsVO> getNewsCollections(Long userId, Integer pageNum, Integer pageSize);
    
    Page<UserWorkVO> getWorkCollections(Long userId, Integer pageNum, Integer pageSize);
}
