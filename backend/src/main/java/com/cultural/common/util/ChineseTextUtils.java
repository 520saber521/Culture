package com.cultural.common.util;

import java.util.regex.Pattern;

public class ChineseTextUtils {
    
    private static final Pattern CHINESE_PATTERN = Pattern.compile("[\\u4e00-\\u9fa5]");
    
    private static final Pattern CHINESE_ONLY_PATTERN = Pattern.compile("^[\\u4e00-\\u9fa5]+$");
    
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\u4e00-\\u9fa5]{2,20}$");
    
    private static final Pattern NICKNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\u4e00-\\u9fa5]{2,20}$");
    
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    
    private static final Pattern SENSITIVE_WORDS = Pattern.compile(
            "(敏感词1|敏感词2|违禁词)", 
            Pattern.CASE_INSENSITIVE
    );
    
    public static boolean containsChinese(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        return CHINESE_PATTERN.matcher(text).find();
    }
    
    public static boolean isChineseOnly(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        return CHINESE_ONLY_PATTERN.matcher(text).matches();
    }
    
    public static boolean isValidUsername(String username) {
        if (username == null || username.isEmpty()) {
            return false;
        }
        return USERNAME_PATTERN.matcher(username).matches();
    }
    
    public static boolean isValidNickname(String nickname) {
        if (nickname == null || nickname.isEmpty()) {
            return false;
        }
        return NICKNAME_PATTERN.matcher(nickname).matches();
    }
    
    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }
    
    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    public static boolean containsSensitiveWords(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        return SENSITIVE_WORDS.matcher(text).find();
    }
    
    public static int getChineseLength(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        int length = 0;
        for (char c : text.toCharArray()) {
            if (Character.toString(c).matches("[\\u4e00-\\u9fa5]")) {
                length += 2;
            } else {
                length += 1;
            }
        }
        return length;
    }
    
    public static String truncateChinese(String text, int maxLength, String suffix) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        int currentLength = 0;
        StringBuilder result = new StringBuilder();
        
        for (char c : text.toCharArray()) {
            int charLength = Character.toString(c).matches("[\\u4e00-\\u9fa5]") ? 2 : 1;
            if (currentLength + charLength > maxLength) {
                break;
            }
            result.append(c);
            currentLength += charLength;
        }
        
        if (result.length() < text.length() && suffix != null) {
            result.append(suffix);
        }
        
        return result.toString();
    }
    
    public static String getPinyinInitial(String chinese) {
        if (chinese == null || chinese.isEmpty()) {
            return "";
        }
        char firstChar = chinese.charAt(0);
        if (Character.toString(firstChar).matches("[\\u4e00-\\u9fa5]")) {
            return getChinesePinyinInitial(firstChar);
        }
        return String.valueOf(Character.toUpperCase(firstChar));
    }
    
    private static String getChinesePinyinInitial(char c) {
        int charCode = c;
        int[] codePoints = {
                0xB0A1, 0xB0C5, 0xB2C1, 0xB4EE, 0xB6EA, 0xB7A2, 0xB8C1, 0xB9FE, 0xBBF7,
                0xBFA6, 0xC0AC, 0xC2E8, 0xC4C3, 0xC5B6, 0xC5BE, 0xC6DA, 0xC8BB, 0xC8F6,
                0xCBFA, 0xCDDA, 0xCEF4, 0xD1B9, 0xD4D1
        };
        String[] initials = {"A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"};
        
        for (int i = 0; i < codePoints.length - 1; i++) {
            if (charCode >= codePoints[i] && charCode < codePoints[i + 1]) {
                return initials[i];
            }
        }
        return "Z";
    }
}
