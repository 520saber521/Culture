package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "用户作品VO")
public class UserWorkVO {
    
    @Schema(description = "ID")
    private Long id;
    
    @Schema(description = "用户ID")
    private Long userId;
    
    @Schema(description = "用户昵称")
    private String userNickname;
    
    @Schema(description = "用户头像")
    private String userAvatar;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "描述")
    private String description;
    
    @Schema(description = "图片URL")
    private String imageUrl;
    
    @Schema(description = "缩略图URL")
    private String thumbnailUrl;
    
    @Schema(description = "AI生成提示词")
    private String prompt;
    
    @Schema(description = "风格")
    private String style;
    
    @Schema(description = "文化元素")
    private String culturalElement;
    
    @Schema(description = "关联非遗ID")
    private Long heritageId;
    
    @Schema(description = "关联艺术ID")
    private Long artId;
    
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
    
    @Schema(description = "是否公开")
    private Boolean isPublic;
    
    @Schema(description = "是否精选")
    private Boolean isFeatured;
    
    @Schema(description = "是否已收藏")
    private Boolean isCollected;
    
    @Schema(description = "是否已点赞")
    private Boolean isLiked;
    
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
