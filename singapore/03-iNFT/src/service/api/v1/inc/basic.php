<?php

/*基础配*/
define('INFTAPI', TRUE);		//基础防止异常访问的方法
define('DEBUG', TRUE);		//调试模式是否开启
define('SHUTDOWN',FALSE);	//全站关闭模式是否开启
define('QUERY',	false);		//是否调试SQL语句
define('DS', DIRECTORY_SEPARATOR);		//兼容liunx和windows的文件路径分隔符

define('CONNECTOR',	'_');		//连接符

define('DEF_PATH',	'inc');			//基础定义的路径
define('DEF_PRE',	'def_');		//基础定义的前缀
define('DEF_SUFFIX','.php');		//基础定义的后缀

define('API_VERSION','v1');