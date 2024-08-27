<?php
if(!defined('WDD')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$a->load('board');
$a=Board::getInstance();

//1.数据获取部分
$warr=array();
$warr[]=array('status','=',BOARD_STATUS_DEL);

$param=$a->boardPages($warr);
if($page>=$param['total'] && $param['total']!=0){
	$a=Config::getInstance();
	$a->error('wrong page');
}

$arr=$a->boardList($page,$warr);
$_F['list']=$arr;

//分页计算部分
$step=$a->getStep();
$a=Config::getinstance();
if($param['total']!=0){
	$url='?mod=board&act=trash&p=';
	$nav=$a->pagination($param['total'],$page,$url,$step);
	$_F['nav']=$nav;
}else{
	$_F['nav']='';
}

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);