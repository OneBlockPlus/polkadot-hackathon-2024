<?php
if(!defined('INFTAPI')) exit('error');

//get templates of iNFT market

$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;
$step=isset($_F['request']['step'])?(int)$_F['request']['step']:12;
$result=array('success'=>FALSE);

$a->load('cache');
$a=Cache::getInstance();

$start=$page*$step;
$end=$start+$step;
$map=$a->rangeList(REDIS_QUEUE_TEMPLATE,$start,$end);

$result['data']=$map;
$result['success']=true;

$a=Config::getInstance();
$a->export($result);