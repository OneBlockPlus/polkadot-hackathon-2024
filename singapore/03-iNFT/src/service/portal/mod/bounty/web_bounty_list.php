<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$a->load("bounty");
$a=Bounty::getInstance();

//1.数据获取部分
$warr=array();
$param=$a->bountyPages($warr);

if($page>=$param['total'] && $param['total']!=0){
	$a=Config::getInstance();
	$a->error('wrong page');
}

$arr=$a->bountyList($page,$warr);

foreach($arr as $k=>$v){
    $arr[$k]["apply"]=json_decode(htmlspecialchars_decode($v["apply"]),true);
	$arr[$k]["detail"]=json_decode(htmlspecialchars_decode($v["detail"]),true);
}

//echo json_encode($arr);

$_F['list']=$arr;

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);