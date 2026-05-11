package com.cultural.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("heritage")
public class Heritage implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    
    private Long categoryId;
    
    private String category;
    
    private Long cityId;
    
    private String city;
    
    private String description;
    
    private String content;
    
    private String coverImage;
    
    private String images;
    
    private String videoUrl;
    
    private Integer level;
    
    private String heritageYear;
    
    private String declarer;
    
    private String inheritor;
    
    private String tags;
    
    private Integer status;
    
    private Integer viewCount;
    
    private Integer likeCount;
    
    private Integer collectCount;
    
    private Integer commentCount;
    
    private Integer sortOrder;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
