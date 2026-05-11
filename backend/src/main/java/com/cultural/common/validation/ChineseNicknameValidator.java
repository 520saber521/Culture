package com.cultural.common.validation;

import com.cultural.common.util.ChineseTextUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ChineseNicknameValidator implements ConstraintValidator<ChineseNickname, String> {
    
    private int minLength = 2;
    private int maxLength = 20;
    
    @Override
    public void initialize(ChineseNickname constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.maxLength = constraintAnnotation.maxLength();
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        
        if (!ChineseTextUtils.isValidNickname(value)) {
            return false;
        }
        
        int length = ChineseTextUtils.getChineseLength(value);
        return length >= minLength && length <= maxLength;
    }
}
