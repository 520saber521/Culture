package com.cultural;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableCaching
@EnableTransactionManagement
@MapperScan("com.cultural.mapper")
public class CulturalApplication {
    public static void main(String[] args) {
        SpringApplication.run(CulturalApplication.class, args);
    }
}
