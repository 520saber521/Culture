package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "城市VO")
public class CityVO {
    
    @Schema(description = "城市ID")
    private Long id;
    
    @Schema(description = "城市名称")
    private String name;
    
    @Schema(description = "城市编码")
    private String code;
    
    @Schema(description = "所属省份")
    private String province;
    
    @Schema(description = "城市拼音")
    private String pinyin;
    
    @Schema(description = "首字母")
    private String initial;
    
    @Schema(description = "排序序号")
    private Integer sortOrder;
    
    @Schema(description = "城市简介")
    private String description;
}
