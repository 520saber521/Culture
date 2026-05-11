package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "历史名人VO")
public class CelebrityVO {
    
    @Schema(description = "ID")
    private Long id;
    
    @Schema(description = "姓名")
    private String name;
    
    @Schema(description = "朝代")
    private String dynasty;
    
    @Schema(description = "朝代排序")
    private Integer dynastyOrder;
    
    @Schema(description = "城市ID")
    private Long cityId;
    
    @Schema(description = "籍贯城市")
    private String city;
    
    @Schema(description = "头衔/称号")
    private String title;
    
    @Schema(description = "简介")
    private String description;
    
    @Schema(description = "详细介绍")
    private String content;
    
    @Schema(description = "头像")
    private String avatar;
    
    @Schema(description = "图片列表")
    private String[] images;
    
    @Schema(description = "出生年份")
    private String birthYear;
    
    @Schema(description = "逝世年份")
    private String deathYear;
    
    @Schema(description = "主要成就")
    private String[] achievements;
    
    @Schema(description = "代表作品")
    private String[] works;
    
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
