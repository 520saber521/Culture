package com.cultural.controller;

import com.cultural.common.annotation.Log;
import com.cultural.common.exception.BusinessException;
import com.cultural.common.response.Result;
import com.cultural.dto.LoginDTO;
import com.cultural.dto.RegisterDTO;
import com.cultural.dto.UserUpdateDTO;
import com.cultural.service.AuthService;
import com.cultural.vo.TokenVO;
import com.cultural.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证管理", description = "用户认证相关接口")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    
    private final AuthService authService;
    
    @Log(value = "用户登录", module = "认证管理", operation = "登录")
    @Operation(summary = "用户登录", description = "用户登录获取Token")
    @PostMapping("/login")
    public Result<TokenVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        TokenVO tokenVO = authService.login(loginDTO);
        return Result.success("登录成功", tokenVO);
    }
    
    @Log(value = "用户注册", module = "认证管理", operation = "注册")
    @Operation(summary = "用户注册", description = "新用户注册")
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterDTO registerDTO) {
        authService.register(registerDTO);
        return Result.success("注册成功", null);
    }
    
    @Log(value = "用户登出", module = "认证管理", operation = "登出")
    @Operation(summary = "用户登出", description = "用户登出清除Token")
    @PostMapping("/logout")
    public Result<Void> logout() {
        authService.logout();
        return Result.success("登出成功", null);
    }
    
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    @GetMapping("/info")
    public Result<UserVO> getCurrentUser() {
        UserVO userVO = authService.getCurrentUser();
        return Result.success(userVO);
    }
    
    @Log(value = "更新用户信息", module = "认证管理", operation = "更新信息")
    @Operation(summary = "更新用户信息", description = "更新当前用户的基本信息")
    @PutMapping("/info")
    public Result<UserVO> updateCurrentUser(@Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        UserVO userVO = authService.updateCurrentUser(userUpdateDTO);
        return Result.success("更新成功", userVO);
    }
    
    @Log(value = "修改密码", module = "认证管理", operation = "修改密码")
    @Operation(summary = "修改密码", description = "修改当前用户密码")
    @PutMapping("/password")
    public Result<Void> updatePassword(
            @Parameter(description = "原密码") 
            @RequestParam @NotBlank(message = "原密码不能为空") String oldPassword,
            @Parameter(description = "新密码") 
            @RequestParam @NotBlank(message = "新密码不能为空") 
            @Size(min = 6, max = 20, message = "新密码长度必须在6-20位之间") String newPassword) {
        authService.updatePassword(oldPassword, newPassword);
        return Result.success("密码修改成功", null);
    }
}
