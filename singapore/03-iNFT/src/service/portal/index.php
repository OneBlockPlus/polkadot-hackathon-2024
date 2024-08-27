<?php

ini_set("display_errors", "stderr");  //ini_set函数作用：为一个配置选项设置值，
error_reporting(E_ALL);     //显示所有的错误信息

session_start();
date_default_timezone_set('Asia/Shanghai');			//设置时区，不然date会按照标准日期进行计算
include 'inc'.DIRECTORY_SEPARATOR.'basic.php';		//数据库配置和基础的定义

if(SHUTDOWN) exit('server is shutdown');
if(DEBUG){
	global $yhf;
	$yhf['ms']=microtime(true);
	$yhf['query']=0;
	$yhf['redis']=0;
	ini_set("display_errors", "stderr");  //ini_set函数作用：为一个配置选项设置值，
	error_reporting(E_ALL);     //显示所有的错误信息
}

include 'lib'.DS.'core.class.php';
include 'lib'.DS.'config.class.php';
$a=Config::getInstance();		//初始化，后面才能调用

$_F=$a->configEnv();
$_F['cdn']=BASE_DOMAIN.DEF_CDN.DEF_VERSION.'/cdn';

include $_F['target'];