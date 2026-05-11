package com.cultural.service;

import com.cultural.dto.LoginDTO;
import com.cultural.dto.RegisterDTO;
import com.cultural.dto.UserUpdateDTO;
import com.cultural.entity.User;
import com.cultural.vo.TokenVO;
import com.cultural.vo.UserVO;

public interface AuthService {
    
    TokenVO login(LoginDTO loginDTO);
    
    void register(RegisterDTO registerDTO);
    
    void logout();
    
    UserVO getCurrentUser();
    
    UserVO updateCurrentUser(UserUpdateDTO userUpdateDTO);
    
    void updatePassword(String oldPassword, String newPassword);
}
