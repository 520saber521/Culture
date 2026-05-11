package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.CommentDTO;
import com.cultural.vo.CommentVO;

public interface CommentService {
    
    Page<CommentVO> getComments(String targetType, Long targetId, Integer pageNum, Integer pageSize);
    
    Long createComment(CommentDTO commentDTO, Long userId);
    
    void deleteComment(Long id, Long userId);
    
    void incrementLikeCount(Long id);
}
