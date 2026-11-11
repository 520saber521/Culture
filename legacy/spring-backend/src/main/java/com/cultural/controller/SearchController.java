package com.cultural.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.response.PageResult;
import com.cultural.common.response.Result;
import com.cultural.dto.SearchDTO;
import com.cultural.service.SearchService;
import com.cultural.vo.SearchResultVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "搜索管理", description = "搜索相关接口")
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Validated
public class SearchController {
    
    private final SearchService searchService;
    
    @Operation(summary = "全局搜索", description = "搜索非遗、艺术、名人、新闻、作品")
    @GetMapping
    public Result<PageResult<SearchResultVO>> search(@Validated SearchDTO searchDTO) {
        Page<SearchResultVO> page = searchService.search(searchDTO, null);
        PageResult<SearchResultVO> pageResult = PageResult.of(
                page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent()
        );
        return Result.success(pageResult);
    }
    
    @Operation(summary = "获取热门搜索关键词", description = "获取热门搜索关键词列表")
    @GetMapping("/hot-keywords")
    public Result<List<String>> getHotKeywords(
            @Parameter(description = "数量限制") 
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "数量必须大于0") Integer limit) {
        return Result.success(searchService.getHotKeywords(limit));
    }
    
    @Operation(summary = "获取搜索历史", description = "获取当前用户的搜索历史")
    @GetMapping("/history")
    public Result<List<String>> getSearchHistory(
            @Parameter(description = "数量限制") 
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "数量必须大于0") Integer limit) {
        return Result.success(searchService.getUserSearchHistory(null, limit));
    }
    
    @Operation(summary = "清空搜索历史", description = "清空当前用户的搜索历史")
    @DeleteMapping("/history")
    public Result<Void> clearSearchHistory() {
        searchService.clearUserSearchHistory(null);
        return Result.success("清空成功", null);
    }
}
