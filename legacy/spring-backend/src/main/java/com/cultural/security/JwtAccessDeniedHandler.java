package com.cultural.security;

import cn.hutool.json.JSONUtil;
import com.cultural.common.response.Result;
import com.cultural.common.response.ResultCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Serializable;

@Slf4j
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler, Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, 
                       AccessDeniedException accessDeniedException) throws IOException {
        
        log.error("权限不足: {} - {}", request.getRequestURI(), accessDeniedException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        Result<Void> result = Result.failed(ResultCode.FORBIDDEN);
        response.getWriter().write(JSONUtil.toJsonStr(result));
    }
}
