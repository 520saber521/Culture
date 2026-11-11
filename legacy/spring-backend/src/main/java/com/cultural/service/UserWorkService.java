package com.cultural.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.dto.UserWorkDTO;
import com.cultural.vo.UserWorkVO;

public interface UserWorkService {
    
    Page<UserWorkVO> getPageList(PageDTO pageDTO);
    
    Page<UserWorkVO> getMyWorks(PageDTO pageDTO, Long userId);
    
    UserWorkVO getDetailById(Long id);
    
    Long createWork(UserWorkDTO userWorkDTO, Long userId);
    
    void updateWork(UserWorkDTO userWorkDTO, Long userId);
    
    void deleteWork(Long id, Long userId);
    
    void incrementViewCount(Long id);
    
    void incrementLikeCount(Long id);
}
