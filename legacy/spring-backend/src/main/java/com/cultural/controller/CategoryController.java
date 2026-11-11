package com.cultural.controller;

import com.cultural.common.response.Result;
import com.cultural.service.CategoryService;
import com.cultural.vo.CategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "分类管理", description = "分类信息相关接口")
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @Operation(summary = "获取分类列表", description = "根据类型获取分类列表")
    @GetMapping("/list")
    public Result<List<CategoryVO>> getList(
            @Parameter(description = "分类类型：heritage/art/news") 
            @RequestParam(required = false) String type) {
        if (type != null && !type.isEmpty()) {
            return Result.success(categoryService.getListByType(type));
        }
        return Result.success(categoryService.getAllCategories());
    }
    
    @Operation(summary = "获取所有分类", description = "获取所有分类列表")
    @GetMapping("/all")
    public Result<List<CategoryVO>> getAllCategories() {
        return Result.success(categoryService.getAllCategories());
    }
}
