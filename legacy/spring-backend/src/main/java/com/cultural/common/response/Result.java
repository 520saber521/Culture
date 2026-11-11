package com.cultural.common.response;

import lombok.Data;
import java.io.Serializable;

@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;
    
    public Result() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public static <T> Result<T> success() {
        return success(null);
    }
    
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS.getCode());
        result.setMessage(ResultCode.SUCCESS.getMessage());
        result.setData(data);
        return result;
    }
    
    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS.getCode());
        result.setMessage(message);
        result.setData(data);
        return result;
    }
    
    public static <T> Result<T> failed() {
        return failed(ResultCode.FAILED);
    }
    
    public static <T> Result<T> failed(String message) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.FAILED.getCode());
        result.setMessage(message);
        return result;
    }
    
    public static <T> Result<T> failed(ResultCode resultCode) {
        Result<T> result = new Result<>();
        result.setCode(resultCode.getCode());
        result.setMessage(resultCode.getMessage());
        return result;
    }
    
    public static <T> Result<T> failed(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
    
    public static <T> Result<T> validateFailed() {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.VALIDATE_FAILED.getCode());
        result.setMessage(ResultCode.VALIDATE_FAILED.getMessage());
        return result;
    }
    
    public static <T> Result<T> validateFailed(String message) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.VALIDATE_FAILED.getCode());
        result.setMessage(message);
        return result;
    }
    
    public static <T> Result<T> unauthorized() {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.UNAUTHORIZED.getCode());
        result.setMessage(ResultCode.UNAUTHORIZED.getMessage());
        return result;
    }
    
    public static <T> Result<T> unauthorized(String message) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.UNAUTHORIZED.getCode());
        result.setMessage(message);
        return result;
    }
    
    public static <T> Result<T> forbidden() {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.FORBIDDEN.getCode());
        result.setMessage(ResultCode.FORBIDDEN.getMessage());
        return result;
    }
    
    public static <T> Result<T> forbidden(String message) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.FORBIDDEN.getCode());
        result.setMessage(message);
        return result;
    }
    
    public static <T> Result<T> notFound(String message) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.NOT_FOUND.getCode());
        result.setMessage(message);
        return result;
    }
    
    public boolean isSuccess() {
        return ResultCode.SUCCESS.getCode().equals(this.code);
    }
    
    public boolean isFailed() {
        return !isSuccess();
    }
}
