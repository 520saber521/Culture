package com.cultural.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    
    private String username;
    
    private String module;
    
    private String operation;
    
    private String method;
    
    private String requestUrl;
    
    private String requestMethod;
    
    private String requestParams;
    
    private String responseResult;
    
    private Integer status;
    
    private String errorMsg;
    
    private String ip;
    
    private String location;
    
    private Long duration;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
