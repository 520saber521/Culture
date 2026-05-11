package com.cultural.service;

import com.cultural.vo.CityVO;

import java.util.List;

public interface CityService {
    
    List<CityVO> getAllCities();
    
    CityVO getById(Long id);
}
