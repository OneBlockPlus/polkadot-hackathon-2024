<?php
if(!defined('INFTADM')) exit('error');


if(!isset($_F['request']['address'])) exit('wrong id');
$acc=$_F['request']['address'];
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$start=0;
$end=20000;

$result=array('success'=>FALSE);

$a->load('inft');
$a=Inft::getInstance();

$result['data']=$a->listINFTbyAddress($acc,$page);
$result['nav']=$a->nav($acc);
$result['success']=true;

$a=Config::getInstance();
$a->export($result);