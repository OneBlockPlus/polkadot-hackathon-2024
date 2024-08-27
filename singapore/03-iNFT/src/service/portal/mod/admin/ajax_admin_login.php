<?php
if(!defined('INFTADM')) exit('error');

$result=array('success'=>FALSE);

//业务逻辑区域
$a->load('admin');
$a=Admin::getInstance();

if(!isset($_SESSION['name']) || empty($_SESSION['name'])){	
	$a=Config::getInstance();
	$a->error('login error');	
}

$admin=$a->adminView($_SESSION['name']);

if(!$a->adminLogin($_F['request']['pass'],$admin['pass'],$_SESSION['dsalt'])){
	$a=Config::getInstance();
	$a->error('error pass');
}

$_SESSION['admin']=true;
$_SESSION['uid']=$admin['uid'];

$result['success']=true;

$a=Config::getInstance();
$a->export($result);
