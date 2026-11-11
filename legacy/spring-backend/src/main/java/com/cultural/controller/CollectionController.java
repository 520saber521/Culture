package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.annotation.Log;
import com.cultural.common.exception.BusinessException;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.CollectionDTO;
import com.cultural.security.LoginUser;
import com.cultural.service.CollectionService;
import com.cultural.vo.HeritageVO;
import com.cultural.vo.NewsVO;
import com.cultural.vo.TraditionalArtVO;
import com.cultural.vo.UserWorkVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "收藏管理", description = "收藏相关接口")
@RestController
@RequestMapping("/collections")
@RequiredArgsConstructor
@Validated
public class CollectionController {
    
    private final CollectionService collectionService;
    
    @Log(value = "收藏/取消收藏", module = "收藏管理", operation = "收藏")
    @Operation(summary = "收藏/取消收藏", description = "对目标进行收藏或取消收藏")
    @PostMapping("/toggle")
    public Result<Void> toggleCollection(@Valid @RequestBody CollectionDTO collectionDTO) {
        Long userId = getCurrentUserId();
        collectionService.toggleCollection(collectionDTO, userId);
        return Result.success("操作成功", null);
    }
    
    @Operation(summary = "获取非遗收藏列表", description = "获取当前用户的非遗收藏列表")
    @GetMapping("/heritage")
    public Result<PageResult<HeritageVO>> getHeritageCollections(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数必须大于0") Integer pageSize) {
        Long userId = getCurrentUserId();
        Page<HeritageVO> page = collectionService.getHeritageCollections(userId, pageNum, pageSize);
        PageResult<HeritageVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取艺术收藏列表", description = "获取当前用户的传统艺术收藏列表")
    @GetMapping("/art")
    public Result<PageResult<TraditionalArtVO>> getArtCollections(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数必须大于0") Integer pageSize) {
        Long userId = getCurrentUserId();
        Page<TraditionalArtVO> page = collectionService.getArtCollections(userId, pageNum, pageSize);
        PageResult<TraditionalArtVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取新闻收藏列表", description = "获取当前用户的新闻收藏列表")
    @GetMapping("/news")
    public Result<PageResult<NewsVO>> getNewsCollections(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数必须大于0") Integer pageSize) {
        Long userId = getCurrentUserId();
        Page<NewsVO> page = collectionService.getNewsCollections(userId, pageNum, pageSize);
        PageResult<NewsVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取作品收藏列表", description = "获取当前用户的作品收藏列表")
    @GetMapping("/work")
    public Result<PageResult<UserWorkVO>> getWorkCollections(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数必须大于0") Integer pageSize) {
        Long userId = getCurrentUserId();
        Page<UserWorkVO> page = collectionService.getWorkCollections(userId, pageNum, pageSize);
        PageResult<UserWorkVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            throw new BusinessException(401, "用户未登录");
        }
        return loginUser.getUserId();
    }
}
