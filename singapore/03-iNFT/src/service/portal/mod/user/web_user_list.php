<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

//1.准备add部分需要的数据

$a->load('user');
$a=User::getInstance();


//1.数据获取部分
$warr=array();
//$warr[]=array('status','=',USER_STATUS_OK);

$param=$a->userPages($warr);

if($page>=$param['total'] && $param['total']!=0){
	$a=Config::getInstance();
	$a->error('wrong page');
}

$desc=isset($_F['request']['dc'])?$_F['request']['dc']:TRUE;
$otag=isset($_F['request']['od'])?$_F['request']['od']:'id';
$order=$a->transOrder($otag);
$arr=$a->userList($page,$warr,$order,$desc);

foreach($arr as $k=>$v){
	$arr[$k]['cached']=$a->isUserCached($v['uid']);		//文件大小处理
}

// $a->load('world');
// $a=World::getInstance();
// foreach($arr as $k=>$v){
// 	$arr[$k]['exist']=$a->worldTime($v['ctime']);		//文件大小处理
// }
//$_F['establish']=$a->worldTime(time());
$_F['list']=$arr;
$_F['dec']=$desc;

//分页计算部分
$step=$a->getStep();
$a=Config::getinstance();
if($param['total']!=0){
	$url='?mod=user&act=list';
	$url.='&od='.$otag;
	$url.='&dc='.$desc;
	$url.='&p=';
	
	$nav=$a->pagination($param['total'],$page,$url,$step);
	$_F['nav']=$nav;
}else{
	$_F['nav']='';
}

$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);