<?php
define('ADMIN_PAGE_COUNT',	10);
define('ADMIN_PAGE_STEP',	3);

//用户状态定义
define('ADMIN_STATUS_OK', 	1);
define('ADMIN_STATUS_DEL',	0);
define('ADMIN_STATUS_RESET',	2);
define('ADMIN_STATUS_LOCK',	44);

//用户密码加密salt
define('ADMIN_PASS_SALT',	'admimmm');

//安全防护
define('ADMIN_FRESH_INTERVAL', 	5);
define('ADMIN_FRESH_MAX',	   	5);


define('ADMIN_DEFAULT_EXPIRE',	600);