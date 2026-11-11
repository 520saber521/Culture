package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.PageDTO;
import com.cultural.service.CelebrityService;
import com.cultural.vo.CelebrityVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "名人管理", description = "江苏历史名人相关接口")
@RestController
@RequestMapping("/celebrities")
@RequiredArgsConstructor
@Validated
public class CelebrityController {
    
    private final CelebrityService celebrityService;
    
    @Operation(summary = "获取名人列表", description = "分页获取江苏历史名人列表")
    @GetMapping("/list")
    public Result<PageResult<CelebrityVO>> getList(@Validated PageDTO pageDTO) {
        Page<CelebrityVO> page = celebrityService.getPageList(pageDTO);
        PageResult<CelebrityVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取名人详情", description = "根据ID获取历史名人详情")
    @GetMapping("/detail/{id}")
    public Result<CelebrityVO> getDetail(
            @Parameter(description = "名人ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        CelebrityVO celebrityVO = celebrityService.getDetailById(id);
        if (celebrityVO == null) {
            return Result.notFound("名人信息不存在");
        }
        celebrityService.incrementViewCount(id);
        return Result.success(celebrityVO);
    }
}
