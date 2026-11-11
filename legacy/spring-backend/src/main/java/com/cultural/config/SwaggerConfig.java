package com.cultural.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    
    private static final String SECURITY_SCHEME_NAME = "Bearer";
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("江苏文化传承与创新平台 API")
                        .description("""
                                ## 接口说明
                                
                                本平台致力于江苏省非物质文化遗产、传统艺术、历史名人等文化资源的数字化展示与传承。
                                
                                ### 功能模块
                                
                                - **认证管理**：用户登录、注册、信息管理
                                - **非遗管理**：非物质文化遗产信息浏览、搜索
                                - **传统艺术**：江苏传统艺术展示
                                - **历史名人**：江苏历史名人介绍
                                - **新闻资讯**：文化相关新闻动态
                                - **作品管理**：用户创作作品管理
                                - **评论收藏**：互动功能
                                - **搜索功能**：全局搜索与历史记录
                                
                                ### 认证方式
                                
                                使用JWT Token认证，在请求头中添加：
                                ```
                                Authorization: Bearer <your_token>
                                ```
                                
                                ### 响应格式
                                
                                所有接口统一返回格式：
                                ```json
                                {
                                  "code": 200,
                                  "message": "操作成功",
                                  "data": {},
                                  "timestamp": 1234567890000
                                }
                                ```
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("开发团队")
                                .email("dev@cultural.com")
                                .url("https://cultural.example.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:" + serverPort + "/api").description("本地开发环境"),
                        new Server().url("https://api.cultural.example.com").description("生产环境")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .schemaRequirement(SECURITY_SCHEME_NAME, new SecurityScheme()
                        .name(SECURITY_SCHEME_NAME)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("请输入JWT Token进行认证"));
    }
}
