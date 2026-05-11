package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.vo.CelebrityVO;

public interface CelebrityService {
    
    Page<CelebrityVO> getPageList(PageDTO pageDTO);
    
    CelebrityVO getDetailById(Long id);
    
    void incrementViewCount(Long id);
}
