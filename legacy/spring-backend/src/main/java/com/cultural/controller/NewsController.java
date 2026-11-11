package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.PageDTO;
import com.cultural.service.NewsService;
import com.cultural.vo.NewsVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "新闻管理", description = "文化新闻相关接口")
@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@Validated
public class NewsController {
    
    private final NewsService newsService;
    
    @Operation(summary = "获取新闻列表", description = "分页获取文化新闻列表")
    @GetMapping("/list")
    public Result<PageResult<NewsVO>> getList(@Validated PageDTO pageDTO) {
        Page<NewsVO> page = newsService.getPageList(pageDTO);
        PageResult<NewsVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取新闻详情", description = "根据ID获取新闻详情")
    @GetMapping("/detail/{id}")
    public Result<NewsVO> getDetail(
            @Parameter(description = "新闻ID") 
            @PathVariable @NotNull(message = "ID不能为空") @Min(value = 1, message = "ID必须大于0") Long id) {
        NewsVO newsVO = newsService.getDetailById(id);
        if (newsVO == null) {
            return Result.notFound("新闻不存在");
        }
        newsService.incrementViewCount(id);
        return Result.success(newsVO);
    }
}
