<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$a->load("inft");
$a=Inft::getInstance();

$arr=$a->countKey(INFT_PREFIX_BLOCK);
$_F['sum']=count($arr);

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);