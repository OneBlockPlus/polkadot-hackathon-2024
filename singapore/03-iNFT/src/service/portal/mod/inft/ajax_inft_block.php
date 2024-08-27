<?php
if(!defined('INFTADM')) exit('error');


if(!isset($_F['request']['block'])) exit('wrong name');
$block=$_F['request']['block'];
$start=0;
$end=100;

$result=array('success'=>FALSE);

$a->load('inft');
$a=Inft::getInstance();


$key=INFT_PREFIX_BLOCK.$block;
$arr=$a->rangeList($key,$start,$end);

$len=$a->lenList($key);

foreach($arr as $key=>$val){
    $arr[$key]=json_decode($val,true);
}

$result['data']=$arr;
$result['nav']=array(
    "sum" => $len,
);
$result['success']=true;

$a=Config::getInstance();
$a->export($result);