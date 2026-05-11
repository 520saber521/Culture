package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.cultural.entity.City;
import com.cultural.mapper.CityMapper;
import com.cultural.service.CityService;
import com.cultural.vo.CityVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityServiceImpl implements CityService {
    
    private final CityMapper cityMapper;
    
    @Override
    public List<CityVO> getAllCities() {
        List<City> cities = cityMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<City>()
                        .eq(City::getStatus, 1)
                        .orderByAsc(City::getSortOrder)
        );
        return cities.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }
    
    @Override
    public CityVO getById(Long id) {
        City city = cityMapper.selectById(id);
        if (city == null) {
            return null;
        }
        return convertToVO(city);
    }
    
    private CityVO convertToVO(City city) {
        return BeanUtil.copyProperties(city, CityVO.class);
    }
}
