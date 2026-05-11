package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.exception.BusinessException;
import com.cultural.dto.CommentDTO;
import com.cultural.entity.Comment;
import com.cultural.entity.User;
import com.cultural.mapper.CommentMapper;
import com.cultural.mapper.UserMapper;
import com.cultural.service.CommentService;
import com.cultural.service.LikeService;
import com.cultural.vo.CommentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    
    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final LikeService likeService;
    
    @Override
    public Page<CommentVO> getComments(String targetType, Long targetId, Integer pageNum, Integer pageSize) {
        Page<Comment> page = new Page<>(pageNum, pageSize);
        
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getTargetType, targetType)
                .eq(Comment::getTargetId, targetId)
                .eq(Comment::getStatus, 1)
                .eq(Comment::getParentId, 0L)
                .orderByDesc(Comment::getCreateTime);
        
        Page<Comment> commentPage = commentMapper.selectPage(page, wrapper);
        
        List<CommentVO> voList = commentPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        Page<CommentVO> voPage = new Page<>(commentPage.getCurrent(), commentPage.getSize(), commentPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }
    
    @Override
    public Long createComment(CommentDTO commentDTO, Long userId) {
        Comment comment = BeanUtil.copyProperties(commentDTO, Comment.class);
        comment.setUserId(userId);
        comment.setStatus(1);
        comment.setLikeCount(0);
        if (comment.getParentId() == null) {
            comment.setParentId(0L);
        }
        commentMapper.insert(comment);
        return comment.getId();
    }
    
    @Override
    public void deleteComment(Long id, Long userId) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException(404, "评论不存在");
        }
        if (!comment.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权删除此评论");
        }
        comment.setStatus(0);
        commentMapper.updateById(comment);
    }
    
    @Override
    public void incrementLikeCount(Long id) {
        commentMapper.update(null, 
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Comment>()
                        .setSql("like_count = like_count + 1")
                        .eq(Comment::getId, id)
        );
    }
    
    private CommentVO convertToVO(Comment comment) {
        CommentVO vo = BeanUtil.copyProperties(comment, CommentVO.class);
        
        User user = userMapper.selectById(comment.getUserId());
        if (user != null) {
            vo.setUserNickname(user.getNickname());
            vo.setUserAvatar(user.getAvatar());
        }
        
        if (StrUtil.isNotEmpty(comment.getImages())) {
            vo.setImages(comment.getImages().split(","));
        }
        
        if (comment.getReplyUserId() != null) {
            User replyUser = userMapper.selectById(comment.getReplyUserId());
            if (replyUser != null) {
                vo.setReplyUserNickname(replyUser.getNickname());
            }
        }
        
        return vo;
    }
}
