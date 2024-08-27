<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
if(!isset($_F['request']['uuid'])||strlen($_F['request']['uuid'])!=36) exit('wrong uuid');

$uuid=$_F['request']['uuid'];

//业务逻辑区域
$a->load('user');
$a=User::getinstance();

$user=$a->userView($uuid);


$_F['uuid']=$uuid;

$info=$a->userInfo($uuid);

$a=Config::getinstance();
$_F['dump']=$a->dumpArray($info);
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);