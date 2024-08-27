<?php
/*数据库设置*/
define ('LOG',	'zloga');			//日志表
define ('HLOG',	'zhacka');			//黑客行为表


//MVC的基础定义部分
define('PATH_MODULE',		'lib');
define('PATH_CONTROLLER',	'mod');
define('PATH_VIEW',			'view');
define('SUFFIX_MODULE',		'.class.php');
define('SUFFIX_CONTROLLER',	'.php');
define('SUFFIX_VIEW',		'.tpl');

//controller区分不同的数据请求s
define('CON_WEB',		'web_');
define('CON_AJAX',		'ajax_');

define('DEFAULT_ADMIN_EXPIRE', 300);

define('DEFAULT_MOD',	'inft');
define('DEFAULT_ACT',	'overview');

//默认规则，值约大约危险
define('ERROR_LEVEL_1',	1);
define('ERROR_LEVEL_2',	2);
define('ERROR_LEVEL_3',	3);
define('ERROR_LEVEL_4',	4);
define('ERROR_LEVEL_5',	5);
define('ERROR_LEVEL_6',	6);
define('ERROR_LEVEL_7',	7);
define('ERROR_LEVEL_8',	8);
define('ERROR_LEVEL_9',	9);
define('ERROR_LEVEL_10',10);