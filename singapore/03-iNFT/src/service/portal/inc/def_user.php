<?php
define('USER_PAGE_COUNT',	15);
define('USER_PAGE_STEP',	3);

//用户状态定义
define('USER_STATUS_OK', 	1);
define('USER_STATUS_DEL',	0);
define('USER_STATUS_LOCK',	44);
define('USER_STATUS_ALL',		99);

//用户密码加密salt
define('USER_PASS_SALT',	'fuu');

//注册来源定义
define('USER_ORIGIN_NORMAL',	1);
define('USER_ORIGIN_WEIXIN',	2);
define('USER_ORIGIN_QQ',			3);
define('USER_ORIGIN_WEIBO',	4);
define('USER_ORIGIN_ALIPAY',	5);
define('USER_ORIGIN_APP',			6);
define('USER_ORIGIN_OTHER',	9);

//计数器部分
define('USER_SUMMARY', 	'usummary');
define('USER_SUM', 	'sum');
define('USER_REG', 		'reg');
define('USER_UNREG','unreg');
define('USER_UNPASS','unpassed');					//非注册用户的pass

//安全防护
define('USER_FRESH_INTERVAL',	5);			//5秒检测时间
define('USER_FRESH_MAX',	   	5);			//时间段内请求次数
define('USER_DDOS_STAMP_PRE',	'ddos_');	//IP反复请求生成uuid的上一次时间
define('USER_DDOS_INTERVAL',	600);		//封IP的时间，10分钟


//各种令牌的有效期
define('USER_TOKEN_EXPIRE',		2592000);	//30*24*60*60,30天长未使用token,需要其他手段进行再认证
define('USER_SPAM_EXPIRE',		600);		//spam有效时间为10分钟，请求一次刷新一次

//缓存服务器区分，暂未使用
define('USER_HACK_HOST',	'127.0.0.1');
define('USER_HACK_PORT',	6379);
define('USER_HACK_AUTH',	'adfdsaf');
define('USER_HACK_TIMEOUT',	3600);