<?php
define('USER_PAGE_COUNT',	10);
define('USER_PAGE_STEP',	3);

//用户状态定义
define('USER_STATUS_OK', 	1);
define('USER_STATUS_DEL',	0);
define('USER_STATUS_UNREG',	2);
define('USER_STATUS_LOCK',  44);

//用户密码加密salt
define('USER_PASS_SALT',	'fuu');
define('USER_TOKEN_START',	'f');


define('USER_ERROR_NO_UUID',	1);
define('USER_ERROR_WRONG_TOKEN',2);

//注册来源定义
define('USER_ORIGIN_NORMAL',	1);
define('USER_ORIGIN_WEIXIN',	2);
define('USER_ORIGIN_QQ',		3);
define('USER_ORIGIN_WEIBO',	    4);
define('USER_ORIGIN_ALIPAY',	5);
define('USER_ORIGIN_APP',		6);
define('USER_ORIGIN_OTHER',	    9);

//安全防护
define('USER_FRESH_INTERVAL',		5);				//5秒检测时间
define('USER_FRESH_MAX',	   		5);				//时间段内请求次数
define('USER_DDOS_STAMP_PRE',	'ddos_');	        //IP反复请求生成uuid的上一次时间
define('USER_DDOS_INTERVAL',		600);			//封IP的时间，10分钟
define('GLOBAL_TOKEN_EXPIRE', 864000);
define('GLOBAL_SPAM_EXPIRE',  36000);

define('USER_UNPASS','unpassed');					//非注册用户的pass
define('USER_UNREG_NAME','unRegUser');		//非注册用户的name
define('USER_DEFAULT_AVATAR', 'static/avatar.gif');				//默认头像