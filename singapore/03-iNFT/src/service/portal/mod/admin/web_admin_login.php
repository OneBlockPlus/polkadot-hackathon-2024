<?php
if(!defined('INFTADM')) exit('error');


$a->load('admin');
$a=Admin::getInstance();


$dsalt=$a->char(8);
$_SESSION['dsalt']=$dsalt;
$_F['dsalt']=$dsalt;

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);