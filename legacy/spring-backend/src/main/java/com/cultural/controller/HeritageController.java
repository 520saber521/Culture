package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.annotation.Log;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.PageDTO;
import com.cultural.service.HeritageService;
import com.cultural.vo.HeritageVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "非遗管理", description = "非物质文化遗产相关接口")
@RestController
@RequestMapping("/heritage")
@RequiredArgsConstructor
@Validated
public class HeritageController {
    
    private final HeritageService heritageService;
    
    @Operation(summary = "获取非遗列表", description = "分页获取非物质文化遗产列表")
    @GetMapping("/list")
    public Result<PageResult<HeritageVO>> getList(@Validated PageDTO pageDTO) {
        Page<HeritageVO> page = heritageService.getPageList(pageDTO);
        PageResult<HeritageVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取非遗详情", description = "根据ID获取非物质文化遗产详情")
    @GetMapping("/detail/{id}")
    public Result<HeritageVO> getDetail(
            @Parameter(description = "非遗ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        HeritageVO heritageVO = heritageService.getDetailById(id);
        if (heritageVO == null) {
            return Result.notFound("非遗项目不存在");
        }
        heritageService.incrementViewCount(id);
        return Result.success(heritageVO);
    }
    
    @Log(value = "点赞非遗", module = "非遗管理", operation = "点赞")
    @Operation(summary = "点赞非遗", description = "对非遗项目进行点赞")
    @PostMapping("/like/{id}")
    public Result<Void> like(
            @Parameter(description = "非遗ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        HeritageVO heritageVO = heritageService.getDetailById(id);
        if (heritageVO == null) {
            return Result.notFound("非遗项目不存在");
        }
        heritageService.incrementLikeCount(id);
        return Result.success("点赞成功", null);
    }
}
