package com.cultural.dto;

import com.cultural.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateDTO {
    
    @Size(min = 2, max = 20, message = "昵称长度必须在2-20位之间")
    private String nickname;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    private String phone;
    
    private String avatar;
    
    private Integer gender;
    
    private String bio;
    
    public User toEntity() {
        User user = new User();
        user.setNickname(this.nickname);
        user.setEmail(this.email);
        user.setPhone(this.phone);
        user.setAvatar(this.avatar);
        user.setGender(this.gender);
        user.setBio(this.bio);
        return user;
    }
}
