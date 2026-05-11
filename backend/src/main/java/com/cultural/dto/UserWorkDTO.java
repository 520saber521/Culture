package com.cultural.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserWorkDTO {
    
    private Long id;
    
    @NotBlank(message = "标题不能为空")
    private String title;
    
    private String description;
    
    @NotBlank(message = "图片不能为空")
    private String imageUrl;
    
    private String prompt;
    
    private String style;
    
    private String culturalElement;
    
    private Integer isPublic = 1;
}
