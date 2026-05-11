package com.cultural.common.aspect;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.cultural.common.annotation.Log;
import com.cultural.common.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Aspect
@Component
public class LogAspect {
    
    @Pointcut("@annotation(com.cultural.common.annotation.Log)")
    public void logPointcut() {}
    
    @AfterReturning(pointcut = "logPointcut()", returning = "result")
    public void doAfterReturning(JoinPoint joinPoint, Object result) {
        handleLog(joinPoint, null, result);
    }
    
    @AfterThrowing(pointcut = "logPointcut()", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Exception e) {
        handleLog(joinPoint, e, null);
    }
    
    private void handleLog(JoinPoint joinPoint, Exception e, Object result) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Log logAnnotation = method.getAnnotation(Log.class);
            
            if (logAnnotation == null) {
                return;
            }
            
            HttpServletRequest request = getRequest();
            
            String module = logAnnotation.module();
            String operation = logAnnotation.operation();
            String methodDesc = logAnnotation.value();
            
            String className = joinPoint.getTarget().getClass().getName();
            String methodName = signature.getName();
            
            String ip = IpUtils.getIpAddr(request);
            String url = request.getRequestURI();
            String httpMethod = request.getMethod();
            
            StringBuilder logBuilder = new StringBuilder();
            logBuilder.append("\n========== 请求日志 ==========\n");
            logBuilder.append("模块: ").append(module).append("\n");
            logBuilder.append("操作: ").append(operation).append("\n");
            logBuilder.append("描述: ").append(methodDesc).append("\n");
            logBuilder.append("请求URL: ").append(url).append("\n");
            logBuilder.append("请求方式: ").append(httpMethod).append("\n");
            logBuilder.append("IP地址: ").append(ip).append("\n");
            logBuilder.append("类名: ").append(className).append("\n");
            logBuilder.append("方法名: ").append(methodName).append("\n");
            
            if (logAnnotation.saveRequestData()) {
                Map<String, Object> requestParams = getRequestParams(joinPoint);
                logBuilder.append("请求参数: ").append(JSONUtil.toJsonStr(requestParams)).append("\n");
            }
            
            if (e != null) {
                logBuilder.append("异常信息: ").append(e.getMessage()).append("\n");
                log.error(logBuilder.toString());
            } else {
                if (logAnnotation.saveResponseData() && result != null) {
                    logBuilder.append("响应结果: ").append(JSONUtil.toJsonStr(result)).append("\n");
                }
                log.info(logBuilder.toString());
            }
            
        } catch (Exception ex) {
            log.error("记录日志异常: ", ex);
        }
    }
    
    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
    
    private Map<String, Object> getRequestParams(JoinPoint joinPoint) {
        Map<String, Object> requestParams = new HashMap<>();
        
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] paramValues = joinPoint.getArgs();
        
        if (paramNames != null && paramNames.length > 0) {
            for (int i = 0; i < paramNames.length; i++) {
                String paramName = paramNames[i];
                Object paramValue = paramValues[i];
                
                if (paramValue instanceof HttpServletRequest 
                    || paramValue instanceof HttpServletResponse 
                    || paramValue instanceof MultipartFile) {
                    continue;
                }
                
                if (paramValue != null) {
                    String jsonStr = JSONUtil.toJsonStr(paramValue);
                    if (StrUtil.isNotEmpty(jsonStr) && jsonStr.length() < 1000) {
                        requestParams.put(paramName, paramValue);
                    } else {
                        requestParams.put(paramName, "数据过长，已省略");
                    }
                }
            }
        }
        
        return requestParams;
    }
}
