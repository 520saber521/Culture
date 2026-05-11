package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.vo.NewsVO;

public interface NewsService {
    
    Page<NewsVO> getPageList(PageDTO pageDTO);
    
    NewsVO getDetailById(Long id);
    
    void incrementViewCount(Long id);
}
