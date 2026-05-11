package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.PageDTO;
import com.cultural.entity.News;
import com.cultural.mapper.NewsMapper;
import com.cultural.service.NewsService;
import com.cultural.vo.NewsVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {
    
    private final NewsMapper newsMapper;
    
    @Override
    @Cacheable(value = "news:list", key = "#pageDTO.pageNum + ':' + #pageDTO.pageSize + ':' + #pageDTO.category")
    public Page<NewsVO> getPageList(PageDTO pageDTO) {
        Page<News> page = new Page<>(pageDTO.getPageNum(), pageDTO.getPageSize());
        
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(News::getStatus, 1);
        
        if (StrUtil.isNotEmpty(pageDTO.getCategory())) {
            wrapper.eq(News::getCategory, pageDTO.getCategory());
        }
        if (StrUtil.isNotEmpty(pageDTO.getKeyword())) {
            wrapper.like(News::getTitle, pageDTO.getKeyword())
                    .or()
                    .like(News::getSummary, pageDTO.getKeyword());
        }
        
        wrapper.orderByDesc(News::getPublishTime);
        
        Page<News> newsPage = newsMapper.selectPage(page, wrapper);
        
        Page<NewsVO> voPage = new Page<>(newsPage.getCurrent(), newsPage.getSize(), newsPage.getTotal());
        voPage.setRecords(newsPage.getRecords().stream()
                .map(this::convertToVO)
                .toList());
        
        return voPage;
    }
    
    @Override
    @Cacheable(value = "news:detail", key = "#id")
    public NewsVO getDetailById(Long id) {
        News news = newsMapper.selectById(id);
        if (news == null) {
            return null;
        }
        return convertToVO(news);
    }
    
    @Override
    @CacheEvict(value = "news:detail", key = "#id")
    public void incrementViewCount(Long id) {
        newsMapper.update(null, 
                new LambdaUpdateWrapper<News>()
                        .setSql("view_count = view_count + 1")
                        .eq(News::getId, id)
        );
    }
    
    private NewsVO convertToVO(News news) {
        return BeanUtil.copyProperties(news, NewsVO.class);
    }
}
