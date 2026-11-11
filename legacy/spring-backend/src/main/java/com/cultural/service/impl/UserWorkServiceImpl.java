package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.common.exception.BusinessException;
import com.cultural.dto.PageDTO;
import com.cultural.dto.UserWorkDTO;
import com.cultural.entity.User;
import com.cultural.entity.UserWork;
import com.cultural.mapper.UserMapper;
import com.cultural.mapper.UserWorkMapper;
import com.cultural.security.LoginUser;
import com.cultural.service.UserWorkService;
import com.cultural.vo.UserWorkVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserWorkServiceImpl implements UserWorkService {
    
    private final UserWorkMapper userWorkMapper;
    private final UserMapper userMapper;
    
    @Override
    public Page<UserWorkVO> getPageList(PageDTO pageDTO) {
        Page<UserWork> page = new Page<>(pageDTO.getPageNum(), pageDTO.getPageSize());
        
        LambdaQueryWrapper<UserWork> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserWork::getStatus, 1)
                .eq(UserWork::getIsPublic, 1);
        
        if (StrUtil.isNotEmpty(pageDTO.getKeyword())) {
            wrapper.like(UserWork::getTitle, pageDTO.getKeyword())
                    .or()
                    .like(UserWork::getDescription, pageDTO.getKeyword());
        }
        if (StrUtil.isNotEmpty(pageDTO.getCulturalElement())) {
            wrapper.like(UserWork::getCulturalElement, pageDTO.getCulturalElement());
        }
        
        wrapper.orderByDesc(UserWork::getCreateTime);
        
        Page<UserWork> workPage = userWorkMapper.selectPage(page, wrapper);
        
        Page<UserWorkVO> voPage = new Page<>(workPage.getCurrent(), workPage.getSize(), workPage.getTotal());
        voPage.setRecords(workPage.getRecords().stream()
                .map(this::convertToVO)
                .toList());
        
        return voPage;
    }
    
    @Override
    public Page<UserWorkVO> getMyWorks(PageDTO pageDTO, Long userId) {
        Page<UserWork> page = new Page<>(pageDTO.getPageNum(), pageDTO.getPageSize());
        
        LambdaQueryWrapper<UserWork> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserWork::getUserId, userId)
                .eq(UserWork::getStatus, 1);
        
        if (StrUtil.isNotEmpty(pageDTO.getKeyword())) {
            wrapper.like(UserWork::getTitle, pageDTO.getKeyword());
        }
        
        wrapper.orderByDesc(UserWork::getCreateTime);
        
        Page<UserWork> workPage = userWorkMapper.selectPage(page, wrapper);
        
        Page<UserWorkVO> voPage = new Page<>(workPage.getCurrent(), workPage.getSize(), workPage.getTotal());
        voPage.setRecords(workPage.getRecords().stream()
                .map(this::convertToVO)
                .toList());
        
        return voPage;
    }
    
    @Override
    public UserWorkVO getDetailById(Long id) {
        UserWork work = userWorkMapper.selectById(id);
        if (work == null) {
            return null;
        }
        return convertToVO(work);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createWork(UserWorkDTO userWorkDTO, Long userId) {
        UserWork work = BeanUtil.copyProperties(userWorkDTO, UserWork.class);
        work.setUserId(userId);
        work.setViewCount(0);
        work.setLikeCount(0);
        work.setStatus(1);
        
        userWorkMapper.insert(work);
        log.info("创建作品成功: userId={}, workId={}", userId, work.getId());
        
        return work.getId();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWork(UserWorkDTO userWorkDTO, Long userId) {
        UserWork existingWork = userWorkMapper.selectById(userWorkDTO.getId());
        if (existingWork == null) {
            throw new BusinessException("作品不存在");
        }
        if (!existingWork.getUserId().equals(userId)) {
            throw new BusinessException("无权限修改此作品");
        }
        
        UserWork work = BeanUtil.copyProperties(userWorkDTO, UserWork.class);
        work.setUserId(userId);
        
        userWorkMapper.updateById(work);
        log.info("更新作品成功: userId={}, workId={}", userId, work.getId());
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWork(Long id, Long userId) {
        UserWork work = userWorkMapper.selectById(id);
        if (work == null) {
            throw new BusinessException("作品不存在");
        }
        if (!work.getUserId().equals(userId)) {
            throw new BusinessException("无权限删除此作品");
        }
        
        userWorkMapper.deleteById(id);
        log.info("删除作品成功: userId={}, workId={}", userId, id);
    }
    
    @Override
    public void incrementViewCount(Long id) {
        userWorkMapper.update(null, 
                new LambdaUpdateWrapper<UserWork>()
                        .setSql("view_count = view_count + 1")
                        .eq(UserWork::getId, id)
        );
    }
    
    @Override
    public void incrementLikeCount(Long id) {
        userWorkMapper.update(null, 
                new LambdaUpdateWrapper<UserWork>()
                        .setSql("like_count = like_count + 1")
                        .eq(UserWork::getId, id)
        );
    }
    
    private UserWorkVO convertToVO(UserWork work) {
        UserWorkVO vo = BeanUtil.copyProperties(work, UserWorkVO.class);
        
        User user = userMapper.selectById(work.getUserId());
        if (user != null) {
            vo.setUserNickname(user.getNickname() != null ? user.getNickname() : user.getUsername());
            vo.setUserAvatar(user.getAvatar());
        }
        
        if (StrUtil.isNotEmpty(work.getTags())) {
            vo.setTags(work.getTags().split(","));
        }
        vo.setIsPublic(work.getIsPublic() != null && work.getIsPublic() == 1);
        vo.setIsFeatured(work.getIsFeatured() != null && work.getIsFeatured() == 1);
        
        return vo;
    }
}
