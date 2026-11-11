package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cultural.dto.SearchDTO;
import com.cultural.entity.*;
import com.cultural.mapper.*;
import com.cultural.service.SearchService;
import com.cultural.vo.SearchResultVO;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {
    
    private final SearchHistoryMapper searchHistoryMapper;
    private final HeritageMapper heritageMapper;
    private final TraditionalArtMapper traditionalArtMapper;
    private final CelebrityMapper celebrityMapper;
    private final NewsMapper newsMapper;
    private final UserWorkMapper userWorkMapper;
    
    @Override
    public Page<SearchResultVO> search(SearchDTO searchDTO, Long userId) {
        String keyword = searchDTO.getKeyword();
        if (StrUtil.isEmpty(keyword)) {
            return new Page<>();
        }
        
        saveSearchHistory(keyword, searchDTO.getSearchType(), userId);
        
        Page<SearchResultVO> resultPage = new Page<>(searchDTO.getPageNum(), searchDTO.getPageSize());
        List<SearchResultVO> results = new ArrayList<>();
        
        String searchType = searchDTO.getSearchType();
        
        if ("all".equals(searchType) || "heritage".equals(searchType)) {
            results.addAll(searchHeritage(keyword));
        }
        if ("all".equals(searchType) || "art".equals(searchType)) {
            results.addAll(searchArt(keyword));
        }
        if ("all".equals(searchType) || "celebrity".equals(searchType)) {
            results.addAll(searchCelebrity(keyword));
        }
        if ("all".equals(searchType) || "news".equals(searchType)) {
            results.addAll(searchNews(keyword));
        }
        if ("all".equals(searchType) || "work".equals(searchType)) {
            results.addAll(searchWork(keyword));
        }
        
        results.sort((a, b) -> b.getViewCount().compareTo(a.getViewCount()));
        
        int start = (int) ((searchDTO.getPageNum() - 1) * searchDTO.getPageSize());
        int end = Math.min(start + searchDTO.getPageSize(), results.size());
        
        resultPage.setRecords(results.subList(start, end));
        resultPage.setTotal(results.size());
        
        return resultPage;
    }
    
    @Override
    public List<String> getHotKeywords(int limit) {
        List<SearchHistory> histories = searchHistoryMapper.selectList(
                new LambdaQueryWrapper<SearchHistory>()
                        .select(SearchHistory::getKeyword)
                        .groupBy(SearchHistory::getKeyword)
                        .orderByDesc(SearchHistory::getCreateTime)
                        .last("LIMIT " + limit)
        );
        return histories.stream()
                .map(SearchHistory::getKeyword)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<String> getUserSearchHistory(Long userId, int limit) {
        if (userId == null) {
            return new ArrayList<>();
        }
        List<SearchHistory> histories = searchHistoryMapper.selectList(
                new LambdaQueryWrapper<SearchHistory>()
                        .eq(SearchHistory::getUserId, userId)
                        .orderByDesc(SearchHistory::getCreateTime)
                        .last("LIMIT " + limit)
        );
        return histories.stream()
                .map(SearchHistory::getKeyword)
                .distinct()
                .collect(Collectors.toList());
    }
    
    @Override
    public void clearUserSearchHistory(Long userId) {
        if (userId != null) {
            searchHistoryMapper.delete(
                    new LambdaQueryWrapper<SearchHistory>()
                            .eq(SearchHistory::getUserId, userId)
            );
        }
    }
    
    @Async
    protected void saveSearchHistory(String keyword, String searchType, Long userId) {
        SearchHistory history = new SearchHistory();
        history.setKeyword(keyword);
        history.setSearchType(searchType);
        history.setUserId(userId);
        searchHistoryMapper.insert(history);
    }
    
    private List<SearchResultVO> searchHeritage(String keyword) {
        List<Heritage> list = heritageMapper.selectList(
                new LambdaQueryWrapper<Heritage>()
                        .eq(Heritage::getStatus, 1)
                        .and(w -> w.like(Heritage::getName, keyword)
                                .or().like(Heritage::getDescription, keyword)
                                .or().like(Heritage::getTags, keyword))
                        .orderByDesc(Heritage::getViewCount)
                        .last("LIMIT 20")
        );
        return list.stream().map(h -> {
            SearchResultVO vo = new SearchResultVO();
            vo.setId(h.getId());
            vo.setType("heritage");
            vo.setTitle(h.getName());
            vo.setDescription(h.getDescription());
            vo.setCoverImage(h.getCoverImage());
            vo.setCategory(h.getCategory());
            vo.setCity(h.getCity());
            vo.setViewCount(h.getViewCount());
            vo.setLikeCount(h.getLikeCount());
            vo.setCreateTime(h.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
    }
    
    private List<SearchResultVO> searchArt(String keyword) {
        List<TraditionalArt> list = traditionalArtMapper.selectList(
                new LambdaQueryWrapper<TraditionalArt>()
                        .eq(TraditionalArt::getStatus, 1)
                        .and(w -> w.like(TraditionalArt::getName, keyword)
                                .or().like(TraditionalArt::getDescription, keyword)
                                .or().like(TraditionalArt::getTags, keyword))
                        .orderByDesc(TraditionalArt::getViewCount)
                        .last("LIMIT 20")
        );
        return list.stream().map(a -> {
            SearchResultVO vo = new SearchResultVO();
            vo.setId(a.getId());
            vo.setType("art");
            vo.setTitle(a.getName());
            vo.setDescription(a.getDescription());
            vo.setCoverImage(a.getCoverImage());
            vo.setCategory(a.getCategory());
            vo.setCity(a.getCity());
            vo.setViewCount(a.getViewCount());
            vo.setLikeCount(a.getLikeCount());
            vo.setCreateTime(a.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
    }
    
    private List<SearchResultVO> searchCelebrity(String keyword) {
        List<Celebrity> list = celebrityMapper.selectList(
                new LambdaQueryWrapper<Celebrity>()
                        .eq(Celebrity::getStatus, 1)
                        .and(w -> w.like(Celebrity::getName, keyword)
                                .or().like(Celebrity::getDescription, keyword)
                                .or().like(Celebrity::getTags, keyword))
                        .orderByDesc(Celebrity::getViewCount)
                        .last("LIMIT 20")
        );
        return list.stream().map(c -> {
            SearchResultVO vo = new SearchResultVO();
            vo.setId(c.getId());
            vo.setType("celebrity");
            vo.setTitle(c.getName());
            vo.setDescription(c.getDescription());
            vo.setCoverImage(c.getAvatar());
            vo.setCity(c.getCity());
            vo.setViewCount(c.getViewCount());
            vo.setLikeCount(c.getLikeCount());
            vo.setCreateTime(c.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
    }
    
    private List<SearchResultVO> searchNews(String keyword) {
        List<News> list = newsMapper.selectList(
                new LambdaQueryWrapper<News>()
                        .eq(News::getStatus, 1)
                        .and(w -> w.like(News::getTitle, keyword)
                                .or().like(News::getSummary, keyword)
                                .or().like(News::getTags, keyword))
                        .orderByDesc(News::getViewCount)
                        .last("LIMIT 20")
        );
        return list.stream().map(n -> {
            SearchResultVO vo = new SearchResultVO();
            vo.setId(n.getId());
            vo.setType("news");
            vo.setTitle(n.getTitle());
            vo.setDescription(n.getSummary());
            vo.setCoverImage(n.getCoverImage());
            vo.setCategory(n.getCategory());
            vo.setViewCount(n.getViewCount());
            vo.setLikeCount(n.getLikeCount());
            vo.setCreateTime(n.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
    }
    
    private List<SearchResultVO> searchWork(String keyword) {
        List<UserWork> list = userWorkMapper.selectList(
                new LambdaQueryWrapper<UserWork>()
                        .eq(UserWork::getStatus, 1)
                        .eq(UserWork::getIsPublic, 1)
                        .and(w -> w.like(UserWork::getTitle, keyword)
                                .or().like(UserWork::getDescription, keyword)
                                .or().like(UserWork::getTags, keyword))
                        .orderByDesc(UserWork::getViewCount)
                        .last("LIMIT 20")
        );
        return list.stream().map(w -> {
            SearchResultVO vo = new SearchResultVO();
            vo.setId(w.getId());
            vo.setType("work");
            vo.setTitle(w.getTitle());
            vo.setDescription(w.getDescription());
            vo.setCoverImage(w.getImageUrl());
            vo.setViewCount(w.getViewCount());
            vo.setLikeCount(w.getLikeCount());
            vo.setCreateTime(w.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
    }
}
