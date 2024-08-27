<?php
if(!defined('INFTADM')) exit('error');

if(!isset($_F['request']['id'])||!is_numeric($_F['request']['id'])) exit('wrong id');
if(!isset($_F['request']['m'])||!is_numeric($_F['request']['id'])) exit('wrong month');
$id=(int)$_F['request']['id'];
$mon=(int)$_F['request']['m'];

$a->load('hack');
$a=Hack::getinstance();
$hack=$a->hackView($id,$mon);
if(empty($hack)){
	$a=Config::getinstance();
	$a->error('no such hack infomation');
}

$_F['data']=$hack;
$_F['id']=$id;
$_F['m']=$mon;

$a=Config::getinstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);