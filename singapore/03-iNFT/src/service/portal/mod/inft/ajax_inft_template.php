<?php
if(!defined('INFTADM')) exit('error');


if(!isset($_F['request']['template'])) exit('wrong template');
$tpl=$_F['request']['template'];
$start=0;
$end=100;

$result=array('success'=>FALSE);

$a->load('inft');
$a=Inft::getInstance();

$key=INFT_PREFIX_TEMPLATE.$tpl;

$arr=$a->rangeList($tpl,$start,$end);

// foreach($arr as $key=>$val){
//     $arr[$key]=json_decode($val,true);
// }

$result['data']=$arr;
$result['success']=true;

$a=Config::getInstance();
$a->export($result);