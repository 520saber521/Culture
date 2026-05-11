package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.annotation.Log;
import com.cultural.common.exception.BusinessException;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.PageDTO;
import com.cultural.dto.UserWorkDTO;
import com.cultural.security.LoginUser;
import com.cultural.service.UserWorkService;
import com.cultural.vo.UserWorkVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "作品管理", description = "用户作品相关接口")
@RestController
@RequestMapping("/works")
@RequiredArgsConstructor
@Validated
public class UserWorkController {
    
    private final UserWorkService userWorkService;
    
    @Operation(summary = "获取公开作品列表", description = "分页获取公开的作品列表")
    @GetMapping("/list")
    public Result<PageResult<UserWorkVO>> getList(@Validated PageDTO pageDTO) {
        Page<UserWorkVO> page = userWorkService.getPageList(pageDTO);
        PageResult<UserWorkVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取我的作品列表", description = "分页获取当前用户的作品列表")
    @GetMapping("/my")
    public Result<PageResult<UserWorkVO>> getMyWorks(@Validated PageDTO pageDTO) {
        Long userId = getCurrentUserId();
        Page<UserWorkVO> page = userWorkService.getMyWorks(pageDTO, userId);
        PageResult<UserWorkVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取作品详情", description = "根据ID获取作品详情")
    @GetMapping("/detail/{id}")
    public Result<UserWorkVO> getDetail(
            @Parameter(description = "作品ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        UserWorkVO workVO = userWorkService.getDetailById(id);
        if (workVO == null) {
            return Result.notFound("作品不存在");
        }
        userWorkService.incrementViewCount(id);
        return Result.success(workVO);
    }
    
    @Log(value = "创建作品", module = "作品管理", operation = "创建")
    @Operation(summary = "创建作品", description = "创建新的设计作品")
    @PostMapping
    public Result<Long> create(@Valid @RequestBody UserWorkDTO userWorkDTO) {
        Long userId = getCurrentUserId();
        Long workId = userWorkService.createWork(userWorkDTO, userId);
        return Result.success("创建成功", workId);
    }
    
    @Log(value = "更新作品", module = "作品管理", operation = "更新")
    @Operation(summary = "更新作品", description = "更新现有作品信息")
    @PutMapping
    public Result<Void> update(@Valid @RequestBody UserWorkDTO userWorkDTO) {
        Long userId = getCurrentUserId();
        userWorkService.updateWork(userWorkDTO, userId);
        return Result.success("更新成功", null);
    }
    
    @Log(value = "删除作品", module = "作品管理", operation = "删除")
    @Operation(summary = "删除作品", description = "删除指定作品")
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @Parameter(description = "作品ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        Long userId = getCurrentUserId();
        userWorkService.deleteWork(id, userId);
        return Result.success("删除成功", null);
    }
    
    @Log(value = "点赞作品", module = "作品管理", operation = "点赞")
    @Operation(summary = "点赞作品", description = "对作品进行点赞")
    @PostMapping("/like/{id}")
    public Result<Void> like(
            @Parameter(description = "作品ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        UserWorkVO workVO = userWorkService.getDetailById(id);
        if (workVO == null) {
            return Result.notFound("作品不存在");
        }
        userWorkService.incrementLikeCount(id);
        return Result.success("点赞成功", null);
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            throw new BusinessException(401, "用户未登录");
        }
        return loginUser.getUserId();
    }
}
