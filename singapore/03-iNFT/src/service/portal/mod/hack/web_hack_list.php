<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;
$date=isset($_F['request']['date'])?$_F['request']['date']:date('Y_m');

$a->load('hack');
$a=Hack::getInstance();

//1.数据获取部分


$param=$a->hackPages($date);
if($page>=$param['total'] && $param['total']!=0){
	$a=Config::getInstance();
	$a->error('wrong page');
}

$arr=$a->hackList($date,$page);
$_F['list']=$arr==false?array():$arr;


//分页计算部分
$step=$a->getStep();
$a=Config::getinstance();
if($param['total']!=0){
	$url='?mod=hack&act=list&date='.$date.'&p=';
	$nav=$a->pagination($param['total'],$page,$url,$step);
	$_F['nav']=$nav;
}else{
	$_F['nav']='';
}

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);