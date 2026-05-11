package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.entity.Heritage;
import com.cultural.vo.HeritageVO;

public interface HeritageService {
    
    Page<HeritageVO> getPageList(PageDTO pageDTO);
    
    HeritageVO getDetailById(Long id);
    
    void incrementViewCount(Long id);
    
    void incrementLikeCount(Long id);
}
