package com.cultural.common.response;

import lombok.Data;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;

@Data
public class PageResult<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private List<T> records;
    private Long total;
    private Long size;
    private Long current;
    private Long pages;
    
    public PageResult() {
    }
    
    public PageResult(List<T> records, Long total, Long size, Long current) {
        this.records = records;
        this.total = total;
        this.size = size;
        this.current = current;
        this.pages = (total + size - 1) / size;
    }
    
    public static <T> PageResult<T> of(List<T> records, Long total, Long size, Long current) {
        return new PageResult<>(records, total, size, current);
    }
    
    public static <T> PageResult<T> empty() {
        return new PageResult<>(Collections.emptyList(), 0L, 10L, 1L);
    }
}
