package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.cultural.entity.Category;
import com.cultural.mapper.CategoryMapper;
import com.cultural.service.CategoryService;
import com.cultural.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryMapper categoryMapper;
    
    @Override
    public List<CategoryVO> getListByType(String type) {
        List<Category> categories = categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                        .eq(Category::getType, type)
                        .eq(Category::getStatus, 1)
                        .orderByAsc(Category::getSortOrder)
        );
        return categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryVO> getAllCategories() {
        List<Category> categories = categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                        .eq(Category::getStatus, 1)
                        .orderByAsc(Category::getType)
                        .orderByAsc(Category::getSortOrder)
        );
        return categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }
    
    private CategoryVO convertToVO(Category category) {
        return BeanUtil.copyProperties(category, CategoryVO.class);
    }
}
