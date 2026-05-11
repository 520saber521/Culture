package com.cultural.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cultural.entity.LikeRecord;
import com.cultural.mapper.LikeRecordMapper;
import com.cultural.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {
    
    private final LikeRecordMapper likeRecordMapper;
    
    @Override
    public boolean toggleLike(Long userId, String targetType, Long targetId) {
        if (userId == null) {
            return false;
        }
        
        LambdaQueryWrapper<LikeRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LikeRecord::getUserId, userId)
                .eq(LikeRecord::getTargetType, targetType)
                .eq(LikeRecord::getTargetId, targetId);
        
        LikeRecord existing = likeRecordMapper.selectOne(wrapper);
        
        if (existing != null) {
            int newStatus = existing.getStatus() == 1 ? 0 : 1;
            existing.setStatus(newStatus);
            likeRecordMapper.updateById(existing);
            return newStatus == 1;
        } else {
            LikeRecord likeRecord = new LikeRecord();
            likeRecord.setUserId(userId);
            likeRecord.setTargetType(targetType);
            likeRecord.setTargetId(targetId);
            likeRecord.setStatus(1);
            likeRecordMapper.insert(likeRecord);
            return true;
        }
    }
    
    @Override
    public boolean isLiked(Long userId, String targetType, Long targetId) {
        if (userId == null) {
            return false;
        }
        Long count = likeRecordMapper.selectCount(
                new LambdaQueryWrapper<LikeRecord>()
                        .eq(LikeRecord::getUserId, userId)
                        .eq(LikeRecord::getTargetType, targetType)
                        .eq(LikeRecord::getTargetId, targetId)
                        .eq(LikeRecord::getStatus, 1)
        );
        return count != null && count > 0;
    }
}
