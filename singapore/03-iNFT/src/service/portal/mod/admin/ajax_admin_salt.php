<?php
if(!defined('INFTADM')) exit('error');

if(!isset($_F['request']['name'])) exit('wrong name');
$result=array('success'=>FALSE);

$name=$_F['request']['name'];

//业务逻辑区域
$result=array('success'=>FALSE);
$a->load('admin');
$a=Admin::getInstance();

$salt=$a->adminSalt($name);
if(!$salt){
	$a=Config::getInstance();
	$a->error('illege account');	
}

$_SESSION['name']=$name;		//session里保存用户名，后继动作就不传用户名了
$result['success']=true;
$result['salt']=$salt;

$a=Config::getInstance();
$a->export($result);
