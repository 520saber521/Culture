package com.cultural.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("celebrity")
public class Celebrity implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    
    private String dynasty;
    
    private Integer dynastyOrder;
    
    private Long cityId;
    
    private String city;
    
    private String title;
    
    private String description;
    
    private String content;
    
    private String avatar;
    
    private String images;
    
    private String birthYear;
    
    private String deathYear;
    
    private String achievements;
    
    private String works;
    
    private String tags;
    
    private Integer viewCount;
    
    private Integer likeCount;
    
    private Integer collectCount;
    
    private Integer commentCount;
    
    private Integer status;
    
    private Integer sortOrder;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
