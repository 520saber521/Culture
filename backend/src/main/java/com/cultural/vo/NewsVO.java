package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "新闻资讯VO")
public class NewsVO {
    
    @Schema(description = "ID")
    private Long id;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "分类ID")
    private Long categoryId;
    
    @Schema(description = "分类名称")
    private String category;
    
    @Schema(description = "摘要")
    private String summary;
    
    @Schema(description = "内容")
    private String content;
    
    @Schema(description = "封面图片")
    private String coverImage;
    
    @Schema(description = "图片列表")
    private String[] images;
    
    @Schema(description = "作者")
    private String author;
    
    @Schema(description = "作者ID")
    private Long authorId;
    
    @Schema(description = "来源")
    private String source;
    
    @Schema(description = "来源链接")
    private String sourceUrl;
    
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
    
    @Schema(description = "是否置顶")
    private Boolean isTop;
    
    @Schema(description = "是否热门")
    private Boolean isHot;
    
    @Schema(description = "是否已收藏")
    private Boolean isCollected;
    
    @Schema(description = "是否已点赞")
    private Boolean isLiked;
    
    @Schema(description = "发布时间")
    private LocalDateTime publishTime;
    
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
