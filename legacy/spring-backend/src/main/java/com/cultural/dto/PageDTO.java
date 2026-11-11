package com.cultural.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PageDTO {
    
    @Min(value = 1, message = "页码必须大于0")
    private Integer pageNum = 1;
    
    @Min(value = 1, message = "每页条数必须大于0")
    @Max(value = 100, message = "每页条数不能超过100")
    private Integer pageSize = 10;
    
    private String keyword;
    
    private String category;
    
    private String city;
    
    private Integer status;
    
    private String culturalElement;
    
    public Integer getOffset() {
        return (pageNum - 1) * pageSize;
    }
}
