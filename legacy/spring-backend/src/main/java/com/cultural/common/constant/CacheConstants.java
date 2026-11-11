package com.cultural.common.constant;

public class CacheConstants {
    private CacheConstants() {}
    
    public static final String USER_CACHE_PREFIX = "user:";
    public static final String USER_TOKEN_CACHE = "user:token:";
    public static final String USER_INFO_CACHE = "user:info:";
    
    public static final String HERITAGE_CACHE_PREFIX = "heritage:";
    public static final String HERITAGE_LIST_CACHE = "heritage:list:";
    public static final String HERITAGE_DETAIL_CACHE = "heritage:detail:";
    
    public static final String NEWS_CACHE_PREFIX = "news:";
    public static final String CELEBRITY_CACHE_PREFIX = "celebrity:";
    public static final String ARTS_CACHE_PREFIX = "arts:";
    
    public static final long DEFAULT_EXPIRE_TIME = 3600L;
    public static final long TOKEN_EXPIRE_TIME = 86400L;
    public static final long USER_INFO_EXPIRE_TIME = 7200L;
}
