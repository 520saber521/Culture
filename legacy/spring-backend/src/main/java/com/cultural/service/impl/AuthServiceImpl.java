package com.cultural.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.cultural.common.constant.CacheConstants;
import com.cultural.common.exception.BusinessException;
import com.cultural.dto.LoginDTO;
import com.cultural.dto.RegisterDTO;
import com.cultural.dto.UserUpdateDTO;
import com.cultural.entity.User;
import com.cultural.mapper.UserMapper;
import com.cultural.security.JwtTokenProvider;
import com.cultural.security.LoginUser;
import com.cultural.service.AuthService;
import com.cultural.vo.TokenVO;
import com.cultural.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final Optional<RedisTemplate<String, Object>> redisTemplate;
    
    private final ConcurrentHashMap<String, String> memoryTokenCache = new ConcurrentHashMap<>();
    
    @Override
    public TokenVO login(LoginDTO loginDTO) {
        UsernamePasswordAuthenticationToken authenticationToken = 
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword());
        
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        
        String token = jwtTokenProvider.generateToken(loginUser.getUserId(), loginUser.getUsername());
        
        String tokenKey = CacheConstants.USER_TOKEN_CACHE + loginUser.getUserId();
        redisTemplate.ifPresent(rt -> rt.opsForValue().set(tokenKey, token, jwtTokenProvider.getExpirationTime(), TimeUnit.MILLISECONDS));
        memoryTokenCache.put(tokenKey, token);
        
        UserVO userVO = BeanUtil.copyProperties(loginUser, UserVO.class);
        
        return new TokenVO(token, jwtTokenProvider.getExpirationTime() / 1000, userVO);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void register(RegisterDTO registerDTO) {
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            throw new BusinessException("两次输入的密码不一致");
        }
        
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, registerDTO.getUsername())
        );
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }
        
        if (StrUtil.isNotEmpty(registerDTO.getEmail())) {
            count = userMapper.selectCount(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getEmail, registerDTO.getEmail())
            );
            if (count > 0) {
                throw new BusinessException("邮箱已被注册");
            }
        }
        
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setNickname(StrUtil.isNotEmpty(registerDTO.getNickname()) ? registerDTO.getNickname() : registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setStatus(1);
        
        userMapper.insert(user);
        log.info("用户注册成功: {}", user.getUsername());
    }
    
    @Override
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser loginUser) {
            String tokenKey = CacheConstants.USER_TOKEN_CACHE + loginUser.getUserId();
            redisTemplate.ifPresent(rt -> rt.delete(tokenKey));
            memoryTokenCache.remove(tokenKey);
            log.info("用户登出成功: {}", loginUser.getUsername());
        }
    }
    
    @Override
    public UserVO getCurrentUser() {
        LoginUser loginUser = getLoginUser();
        return BeanUtil.copyProperties(loginUser, UserVO.class);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO updateCurrentUser(UserUpdateDTO userUpdateDTO) {
        LoginUser loginUser = getLoginUser();
        
        if (StrUtil.isNotEmpty(userUpdateDTO.getEmail()) && !userUpdateDTO.getEmail().equals(loginUser.getEmail())) {
            Long count = userMapper.selectCount(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getEmail, userUpdateDTO.getEmail())
                            .ne(User::getId, loginUser.getUserId())
            );
            if (count > 0) {
                throw new BusinessException("邮箱已被使用");
            }
        }
        
        User user = userUpdateDTO.toEntity();
        user.setId(loginUser.getUserId());
        
        userMapper.updateById(user);
        
        User updatedUser = userMapper.selectById(loginUser.getUserId());
        return BeanUtil.copyProperties(updatedUser, UserVO.class);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePassword(String oldPassword, String newPassword) {
        LoginUser loginUser = getLoginUser();
        
        User user = userMapper.selectById(loginUser.getUserId());
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码错误");
        }
        
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new BusinessException("新密码不能与原密码相同");
        }
        
        userMapper.update(null, 
                new LambdaUpdateWrapper<User>()
                        .set(User::getPassword, passwordEncoder.encode(newPassword))
                        .eq(User::getId, loginUser.getUserId())
        );
        
        String tokenKey = CacheConstants.USER_TOKEN_CACHE + loginUser.getUserId();
        redisTemplate.ifPresent(rt -> rt.delete(tokenKey));
        memoryTokenCache.remove(tokenKey);
        
        log.info("用户修改密码成功: {}", loginUser.getUsername());
    }
    
    private LoginUser getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            throw new BusinessException(401, "用户未登录");
        }
        return loginUser;
    }
}
