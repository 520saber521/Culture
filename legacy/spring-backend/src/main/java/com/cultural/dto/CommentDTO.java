package com.cultural.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "评论请求DTO")
public class CommentDTO {
    
    @Schema(description = "目标类型", example = "heritage")
    @NotBlank(message = "目标类型不能为空")
    private String targetType;
    
    @Schema(description = "目标ID")
    private Long targetId;
    
    @Schema(description = "父评论ID")
    private Long parentId;
    
    @Schema(description = "回复用户ID")
    private Long replyUserId;
    
    @Schema(description = "评论内容")
    @NotBlank(message = "评论内容不能为空")
    @Size(min = 1, max = 1000, message = "评论内容长度必须在1-1000个字符之间")
    private String content;
    
    @Schema(description = "评论图片，逗号分隔")
    private String images;
}
