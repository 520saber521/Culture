package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "搜索结果VO")
public class SearchResultVO {
    
    @Schema(description = "数据ID")
    private Long id;
    
    @Schema(description = "数据类型：heritage/art/celebrity/news/work")
    private String type;
    
    @Schema(description = "标题/名称")
    private String title;
    
    @Schema(description = "描述/摘要")
    private String description;
    
    @Schema(description = "封面图片")
    private String coverImage;
    
    @Schema(description = "分类")
    private String category;
    
    @Schema(description = "城市")
    private String city;
    
    @Schema(description = "浏览次数")
    private Integer viewCount;
    
    @Schema(description = "点赞次数")
    private Integer likeCount;
    
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
