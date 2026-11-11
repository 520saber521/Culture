package com.cultural.common.util;

import cn.hutool.core.util.StrUtil;
import jakarta.servlet.http.HttpServletRequest;

public class IpUtils {
    
    private static final String UNKNOWN = "unknown";
    private static final String LOCALHOST_IP = "127.0.0.1";
    private static final String LOCALHOST_IPV6 = "0:0:0:0:0:0:0:1";
    
    private IpUtils() {}
    
    public static String getIpAddr(HttpServletRequest request) {
        if (request == null) {
            return UNKNOWN;
        }
        
        String ip = request.getHeader("x-forwarded-for");
        if (isEmptyIp(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (isEmptyIp(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (isEmptyIp(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (isEmptyIp(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (isEmptyIp(ip)) {
            ip = request.getRemoteAddr();
            if (LOCALHOST_IP.equals(ip) || LOCALHOST_IPV6.equals(ip)) {
                ip = LOCALHOST_IP;
            }
        }
        
        if (ip != null && ip.length() > 15 && ip.indexOf(",") > 0) {
            ip = ip.substring(0, ip.indexOf(","));
        }
        
        return ip;
    }
    
    private static boolean isEmptyIp(String ip) {
        return StrUtil.isEmpty(ip) || UNKNOWN.equalsIgnoreCase(ip);
    }
    
    public static boolean isInternalIp(String ip) {
        if (StrUtil.isEmpty(ip) || UNKNOWN.equalsIgnoreCase(ip)) {
            return false;
        }
        
        if (LOCALHOST_IP.equals(ip) || LOCALHOST_IPV6.equals(ip)) {
            return true;
        }
        
        byte[] addr = textToNumericFormatV4(ip);
        if (addr == null) {
            return false;
        }
        
        return internalIp(addr) || ip.startsWith("10.") || ip.startsWith("192.168.");
    }
    
    private static boolean internalIp(byte[] addr) {
        if (addr == null || addr.length < 2) {
            return false;
        }
        
        final byte b0 = addr[0];
        final byte b1 = addr[1];
        
        if (b0 == (byte) 10) {
            return true;
        }
        
        if (b0 == (byte) 172 && (b1 >= 16 && b1 <= 31)) {
            return true;
        }
        
        if (b0 == (byte) 192 && b1 == (byte) 168) {
            return true;
        }
        
        return false;
    }
    
    private static byte[] textToNumericFormatV4(String text) {
        if (text == null || text.isEmpty()) {
            return null;
        }
        
        byte[] bytes = new byte[4];
        String[] parts = text.split("\\.");
        if (parts.length != 4) {
            return null;
        }
        
        try {
            for (int i = 0; i < 4; i++) {
                int value = Integer.parseInt(parts[i]);
                if (value < 0 || value > 255) {
                    return null;
                }
                bytes[i] = (byte) value;
            }
            return bytes;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
