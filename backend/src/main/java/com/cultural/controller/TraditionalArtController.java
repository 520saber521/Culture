package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.PageDTO;
import com.cultural.service.TraditionalArtService;
import com.cultural.vo.TraditionalArtVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "传统艺术管理", description = "江苏传统艺术相关接口")
@RestController
@RequestMapping("/traditional-arts")
@RequiredArgsConstructor
@Validated
public class TraditionalArtController {
    
    private final TraditionalArtService traditionalArtService;
    
    @Operation(summary = "获取传统艺术列表", description = "分页获取江苏传统艺术列表")
    @GetMapping("/list")
    public Result<PageResult<TraditionalArtVO>> getList(@Validated PageDTO pageDTO) {
        Page<TraditionalArtVO> page = traditionalArtService.getPageList(pageDTO);
        PageResult<TraditionalArtVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取传统艺术详情", description = "根据ID获取传统艺术详情")
    @GetMapping("/detail/{id}")
    public Result<TraditionalArtVO> getDetail(
            @Parameter(description = "传统艺术ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        TraditionalArtVO artVO = traditionalArtService.getDetailById(id);
        if (artVO == null) {
            return Result.notFound("传统艺术信息不存在");
        }
        traditionalArtService.incrementViewCount(id);
        return Result.success(artVO);
    }
}
