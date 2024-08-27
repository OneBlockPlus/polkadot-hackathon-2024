<?php
if(!defined('INFTADM')) exit('error');

if(!isset($_F['request']['id'])||!is_numeric($_F['request']['id'])) exit('wrong id');
$id=(int)$_F['request']['id'];

$a->load('user');
$a=User::getinstance();
$user=$a->userView($id);

if(empty($user)){
	$a=Config::getinstance();
	$a->error('no such user');
}

$_F['data']=$user;

$a=Config::getinstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);