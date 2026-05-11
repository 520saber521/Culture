package com.cultural.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenVO {
    
    private String token;
    
    private String tokenType = "Bearer";
    
    private Long expiresIn;
    
    private UserVO userInfo;
    
    public TokenVO(String token, Long expiresIn, UserVO userInfo) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.userInfo = userInfo;
    }
}
