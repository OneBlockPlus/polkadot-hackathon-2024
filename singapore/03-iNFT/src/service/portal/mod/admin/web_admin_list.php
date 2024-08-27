<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$a->load('admin');
$a=Admin::getInstance();

$param=$a->adminPages();
if($page>=$param['total'] && $param['total']!=0){
	$a=Config::getInstance();
	$a->error('wrong page');
}

$arr=$a->adminList($page);
$_F['list']=$arr;
$_F['title']='管理员列表';

$step=$a->getStep();
$a=Config::getinstance();
if($param['total']!=0){
	$url='?mod=admin&act=list&p=';
	$nav=$a->pagination($param['total'],$page,$url,$step);
	$_F['nav']=$nav;
}else{
	$_F['nav']='';
}


$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);