<?php
if(!defined('INFTAPI')) exit('error');

//参数处理区域
if(!isset($_F['request']['uuid']) && strlen($_F['request']['uuid'])!=36) exit('wrong uuid');
if(!isset($_F['request']['token']) && strlen($_F['request']['token'])!=32) exit('wrong token');

$uuid=$_F['request']['uuid'];
$token=$_F['request']['token'];

$a->load('user');
$a=User::getInstance();

//业务逻辑区域
$result=array('success'=>FALSE);
$spam=$a->userSpam($uuid,$token);

if($spam==USER_ERROR_NO_UUID){
	$a=Config::getInstance();
	$a->error(array('code'=>USER_ERROR_NO_UUID,'data'=>'no such uuid'),ERROR_LEVEL_5);
}else if($spam==USER_ERROR_WRONG_TOKEN){
	$a=Config::getInstance();
	$a->error(array('code'=>USER_ERROR_WRONG_TOKEN,'data'=>'wrong token'),ERROR_LEVEL_5);
}else{
	if(!$spam){
		$a=Config::getInstance();
		$a->error('server error',ERROR_LEVEL_5);
	}
}

$result['user']=$a->userView($uuid);

$result['spam']=$spam;
$result['success']=true;
$a=Config::getInstance();
$a->export($result);

