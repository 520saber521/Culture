package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "评论VO")
public class CommentVO {
    
    @Schema(description = "评论ID")
    private Long id;
    
    @Schema(description = "用户ID")
    private Long userId;
    
    @Schema(description = "用户昵称")
    private String userNickname;
    
    @Schema(description = "用户头像")
    private String userAvatar;
    
    @Schema(description = "目标类型")
    private String targetType;
    
    @Schema(description = "目标ID")
    private Long targetId;
    
    @Schema(description = "父评论ID")
    private Long parentId;
    
    @Schema(description = "回复用户ID")
    private Long replyUserId;
    
    @Schema(description = "回复用户昵称")
    private String replyUserNickname;
    
    @Schema(description = "评论内容")
    private String content;
    
    @Schema(description = "评论图片")
    private String[] images;
    
    @Schema(description = "点赞数")
    private Integer likeCount;
    
    @Schema(description = "是否已点赞")
    private Boolean isLiked;
    
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
