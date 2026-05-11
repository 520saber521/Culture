package com.cultural.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "收藏请求DTO")
public class CollectionDTO {
    
    @Schema(description = "目标类型：heritage/art/celebrity/news/work")
    @NotBlank(message = "目标类型不能为空")
    private String targetType;
    
    @Schema(description = "目标ID")
    private Long targetId;
}
