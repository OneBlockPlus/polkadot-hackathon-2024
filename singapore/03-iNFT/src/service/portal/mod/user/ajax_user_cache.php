<?php
if(!defined('INFTADM')) exit('error');

if(!isset($_F['request']['ids'])) exit('wrong ids');
$ids=json_decode($_F['request']['ids'],true);

foreach($ids as $id){
	if(!is_numeric($id)) $a->error('wrong input');
}

$result=array('success'=>FALSE);

$a->load('user');
$a=User::getInstance();

foreach($ids as $id){
	$a->userCache($id);
}

$result['success']=true;

$a=Config::getInstance();
$a->export($result);