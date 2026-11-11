package com.cultural.common.constant;

public class SecurityConstants {
    private SecurityConstants() {}
    
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";
    public static final String JWT_USER_KEY = "user_id";
    public static final String JWT_USERNAME_KEY = "username";
    public static final String JWT_AUTHORITIES_KEY = "authorities";
    
    public static final String LOGIN_URL = "/auth/login";
    public static final String REGISTER_URL = "/auth/register";
    public static final String LOGOUT_URL = "/auth/logout";
    
    public static final String[] WHITE_LIST = {
        "/auth/**",
        "/doc.html",
        "/webjars/**",
        "/swagger-resources/**",
        "/v3/api-docs/**",
        "/public/**",
        "/heritage/list",
        "/heritage/detail/**",
        "/news/list",
        "/celebrities/list",
        "/traditional-arts/list",
        "/city/**"
    };
}
