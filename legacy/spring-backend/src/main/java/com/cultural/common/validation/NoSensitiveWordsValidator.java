package com.cultural.common.validation;

import com.cultural.common.util.ChineseTextUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NoSensitiveWordsValidator implements ConstraintValidator<NoSensitiveWords, String> {
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        return !ChineseTextUtils.containsSensitiveWords(value);
    }
}
