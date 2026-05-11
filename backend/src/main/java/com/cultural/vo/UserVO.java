package com.cultural.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "用户信息VO")
public class UserVO {
    
    @Schema(description = "用户ID")
    private Long id;
    
    @Schema(description = "用户名")
    private String username;
    
    @Schema(description = "昵称")
    private String nickname;
    
    @Schema(description = "真实姓名")
    private String realName;
    
    @Schema(description = "邮箱")
    private String email;
    
    @Schema(description = "手机号")
    private String phone;
    
    @Schema(description = "头像URL")
    private String avatar;
    
    @Schema(description = "性别：0-未知，1-男，2-女")
    private Integer gender;
    
    @Schema(description = "性别名称")
    private String genderName;
    
    @Schema(description = "出生日期")
    private LocalDate birthday;
    
    @Schema(description = "省份")
    private String province;
    
    @Schema(description = "城市")
    private String city;
    
    @Schema(description = "个人简介")
    private String bio;
    
    @Schema(description = "兴趣标签")
    private String[] interests;
    
    @Schema(description = "角色")
    private String role;
    
    @Schema(description = "作品数量")
    private Integer workCount;
    
    @Schema(description = "收藏数量")
    private Integer collectCount;
    
    @Schema(description = "获赞数量")
    private Integer likeCount;
    
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
