package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.vo.TraditionalArtVO;

public interface TraditionalArtService {
    
    Page<TraditionalArtVO> getPageList(PageDTO pageDTO);
    
    TraditionalArtVO getDetailById(Long id);
    
    void incrementViewCount(Long id);
}
