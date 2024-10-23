<?php
if(!defined('INFTAPI')) exit('error');

$page=isset($_F['request']['page'])?(int)$_F['request']['page']-1:0;
$account=$_F['request']['acc'];

$result=array('success'=>FALSE);

$a->load('cache');
$a=Cache::getInstance();

$a->load('inft');
$a=Inft::getInstance();

//1.get the iNFT list by address
$list=$a->listINFTbyAddress($account,$page);

//2.calc navigator
$key=INFT_PREFIX_ACCOUNT.$account;

$result['nav']=$a->nav($key);
$result['data']=$list;
$result['success']=true;

$a=Config::getInstance();
$a->export($result);