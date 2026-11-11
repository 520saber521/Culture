package com.cultural.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("search_history")
public class SearchHistory implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    
    private String keyword;
    
    private String searchType;
    
    private Integer resultCount;
    
    private String ip;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
