package com.cultural.controller;

import com.cultural.common.response.Result;
import com.cultural.service.CityService;
import com.cultural.vo.CityVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "城市管理", description = "城市信息相关接口")
@RestController
@RequestMapping("/cities")
@RequiredArgsConstructor
public class CityController {
    
    private final CityService cityService;
    
    @Operation(summary = "获取城市列表", description = "获取江苏省所有城市列表")
    @GetMapping("/list")
    public Result<List<CityVO>> getList() {
        return Result.success(cityService.getAllCities());
    }
}
