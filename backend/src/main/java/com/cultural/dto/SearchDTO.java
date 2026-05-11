package com.cultural.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "搜索请求DTO")
public class SearchDTO extends PageDTO {
    
    @Schema(description = "搜索类型：all/heritage/art/celebrity/news/work", example = "all")
    private String searchType = "all";
}
