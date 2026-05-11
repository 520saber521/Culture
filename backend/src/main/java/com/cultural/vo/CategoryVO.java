package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "分类VO")
public class CategoryVO {
    
    @Schema(description = "分类ID")
    private Long id;
    
    @Schema(description = "分类名称")
    private String name;
    
    @Schema(description = "分类编码")
    private String code;
    
    @Schema(description = "分类类型")
    private String type;
    
    @Schema(description = "父分类ID")
    private Long parentId;
    
    @Schema(description = "排序序号")
    private Integer sortOrder;
    
    @Schema(description = "分类图标")
    private String icon;
    
    @Schema(description = "分类描述")
    private String description;
}
