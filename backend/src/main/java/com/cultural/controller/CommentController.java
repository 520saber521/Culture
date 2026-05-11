package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.annotation.Log;
import com.cultural.common.exception.BusinessException;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.CommentDTO;
import com.cultural.security.LoginUser;
import com.cultural.service.CommentService;
import com.cultural.service.LikeService;
import com.cultural.vo.CommentVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "评论管理", description = "评论相关接口")
@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Validated
public class CommentController {
    
    private final CommentService commentService;
    private final LikeService likeService;
    
    @Operation(summary = "获取评论列表", description = "获取指定目标的评论列表")
    @GetMapping("/list")
    public Result<PageResult<CommentVO>> getList(
            @Parameter(description = "目标类型") 
            @RequestParam @NotBlank(message = "目标类型不能为空") String targetType,
            @Parameter(description = "目标ID") 
            @RequestParam @NotNull(message = "目标ID不能为空") Long targetId,
            @Parameter(description = "页码") 
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @Parameter(description = "每页条数") 
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数必须大于0") Integer pageSize) {
        Page<CommentVO> page = commentService.getComments(targetType, targetId, pageNum, pageSize);
        PageResult<CommentVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Log(value = "发表评论", module = "评论管理", operation = "发表")
    @Operation(summary = "发表评论", description = "发表新评论")
    @PostMapping
    public Result<Long> create(@Valid @RequestBody CommentDTO commentDTO) {
        Long userId = getCurrentUserId();
        Long commentId = commentService.createComment(commentDTO, userId);
        return Result.success("评论发表成功", commentId);
    }
    
    @Log(value = "删除评论", module = "评论管理", operation = "删除")
    @Operation(summary = "删除评论", description = "删除自己的评论")
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @Parameter(description = "评论ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        Long userId = getCurrentUserId();
        commentService.deleteComment(id, userId);
        return Result.success("删除成功", null);
    }
    
    @Log(value = "点赞评论", module = "评论管理", operation = "点赞")
    @Operation(summary = "点赞评论", description = "对评论进行点赞")
    @PostMapping("/like/{id}")
    public Result<Void> like(
            @Parameter(description = "评论ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        Long userId = getCurrentUserId();
        boolean isLiked = likeService.toggleLike(userId, "comment", id);
        if (isLiked) {
            commentService.incrementLikeCount(id);
        }
        return Result.success(isLiked ? "点赞成功" : "取消点赞", null);
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            throw new BusinessException(401, "用户未登录");
        }
        return loginUser.getUserId();
    }
}
