package com.cultural.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NoSensitiveWordsValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoSensitiveWords {
    
    String message() default "内容包含敏感词汇，请修改后重试";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
