package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.SearchDTO;
import com.cultural.vo.SearchResultVO;

import java.util.List;

public interface SearchService {
    
    Page<SearchResultVO> search(SearchDTO searchDTO, Long userId);
    
    List<String> getHotKeywords(int limit);
    
    List<String> getUserSearchHistory(Long userId, int limit);
    
    void clearUserSearchHistory(Long userId);
}
