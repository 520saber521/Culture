package com.cultural.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("user")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String nickname;
    
    private String realName;
    
    private String email;
    
    private String phone;
    
    private String avatar;
    
    private Integer gender;
    
    private LocalDate birthday;
    
    private String province;
    
    private String city;
    
    private String bio;
    
    private String role;
    
    private Integer status;
    
    private LocalDateTime lastLoginTime;
    
    private String lastLoginIp;
    
    private Integer loginCount;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
