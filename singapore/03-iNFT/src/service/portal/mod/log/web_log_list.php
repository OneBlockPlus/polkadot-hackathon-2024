<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;
$week=isset($_F['request']['date'])?(int)$_F['request']['date']:0;
//处理基本参数
if(date('W')-$week<10){
	$date=date('Y').CONNECTOR.'0'.(date('W')-$week);
}else{
	$date=date('Y').CONNECTOR.(date('W')-$week);
}


$uid=isset($_F['request']['uid'])?(int)$_F['request']['uid']:0;

//搜索参数配置
$warr=array();
if(isset($_F['request']['log_uid']) && $_F['request']['log_uid']>0) $warr['uid']=(int)$_F['request']['log_uid'];
if(isset($_F['request']['log_mod']) && $_F['request']['log_mod']!='') $warr['m']=$_F['request']['log_mod'];
if(isset($_F['request']['log_act'])&& $_F['request']['log_act']!='') $warr['a']=$_F['request']['log_act'];

$a->load('log');
$a=Log::getInstance();


//echo json_encode($warr);


$param=$a->logPages($date,$warr);
if($page>=$param['total'] && $param['total']!=0){
	$a=Config::getInstance();
	$a->error('wrong page');
}

$arr=$a->logList($date,$page,$warr);
if(!empty($arr)){
	foreach($arr as $k=>$v){
		$arr[$k]['json']=json_decode($arr[$k]['json'],true);
	}
}


//处理上下页的数据
$_F['nextWeek']=$week>=0?$week-1:false;
$_F['preWeek']=$week+1;
$_F['week']=$week;

$_F['list']=$arr;
$_F['date']=$date;
$_F['uid']=$uid;

//分页计算部分
$step=$a->getStep();
$a=Config::getinstance();
if($param['total']!=0){
	$url='?mod=log&act=list&date='.$week;
	
	$url.='&p=';
	
	$nav=$a->pagination($param['total'],$page,$url,$step);
	$_F['nav']=$nav;
}else{
	$_F['nav']='';
}

$_F['pagination']=$param;

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);