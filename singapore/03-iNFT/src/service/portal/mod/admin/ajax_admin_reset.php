<?php
if(!defined('INFTADM')) exit('error');

if(!isset($_F['request']['id']) || !is_numeric($_F['request']['id'])) exit('wrong uid');
$uid=(int)$_F['request']['id'];

$result=array('success'=>FALSE);

//业务逻辑区域
$a->load('admin');
$a=Admin::getInstance();

$info=$a->adminReset($uid);

if(empty($info)){
	$a=Config::getInstance();
	$a->error('reset admin pass failed...');
}

/*$a->load('sms');
$a=Sms::getInstance();
$a->sendSMSTemplate();*/

$result['pass']=$info['pass'];
$result['success']=true;

$a=Config::getInstance();
$a->export($result);
