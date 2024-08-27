<?php
if(!defined('INFTAPI')) exit('error');

//get iNFT list by template name

$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;
$tpl=$_F['request']['tpl'];

$result=array('success'=>FALSE);

$a->load('cache');
$a=Cache::getInstance();

$key=REDIS_PREFIX_TEMPLATE.$tpl;

$start=0;
$end=20;
$queue=$a->getGlobalList($key,$start,$end);

$map=array();
foreach($queue as $v){
    $raw=$a->getKey($v);
    $data=json_decode($raw,true);
    $data['name']=$v;
    array_push($map,$data);
}

$result['data']=$map;
$result['success']=true;

$a=Config::getInstance();
$a->export($result);