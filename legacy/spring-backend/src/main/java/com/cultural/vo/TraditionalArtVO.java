package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "传统艺术VO")
public class TraditionalArtVO {
    
    @Schema(description = "ID")
    private Long id;
    
    @Schema(description = "名称")
    private String name;
    
    @Schema(description = "分类ID")
    private Long categoryId;
    
    @Schema(description = "分类名称")
    private String category;
    
    @Schema(description = "城市ID")
    private Long cityId;
    
    @Schema(description = "城市名称")
    private String city;
    
    @Schema(description = "简介")
    private String description;
    
    @Schema(description = "详细介绍")
    private String content;
    
    @Schema(description = "封面图片")
    private String coverImage;
    
    @Schema(description = "图片列表")
    private String[] images;
    
    @Schema(description = "视频链接")
    private String videoUrl;
    
    @Schema(description = "起源时期")
    private String originPeriod;
    
    @Schema(description = "代表艺术家")
    private String artist;
    
    @Schema(description = "标签")
    private String[] tags;
    
    @Schema(description = "浏览次数")
    private Integer viewCount;
    
    @Schema(description = "点赞次数")
    private Integer likeCount;
    
    @Schema(description = "收藏次数")
    private Integer collectCount;
    
    @Schema(description = "评论次数")
    private Integer commentCount;
    
    @Schema(description = "是否已收藏")
    private Boolean isCollected;
    
    @Schema(description = "是否已点赞")
    private Boolean isLiked;
    
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
