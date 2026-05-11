package com.cultural.service;

import com.cultural.vo.CategoryVO;

import java.util.List;

public interface CategoryService {
    
    List<CategoryVO> getListByType(String type);
    
    List<CategoryVO> getAllCategories();
}
