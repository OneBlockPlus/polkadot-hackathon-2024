<?php
if(!defined('INFTADM')) exit('error');

//参数处理区域
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$a->load("template");
$a=Template::getInstance();

$_F['list']=$a->templateList($page);

$param=$a->templatePages();
$step=$a->getStep();
$url='?mod=template&act=list&p=';

$a=Config::getinstance();
$nav=$a->pagination($param['total'],$page,$url,$step);
$_F['nav']=$nav;

$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);