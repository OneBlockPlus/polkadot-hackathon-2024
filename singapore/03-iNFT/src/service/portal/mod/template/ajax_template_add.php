<?php
if(!defined('INFTADM')) exit('error');

if(!isset($_F['request']['hash'])) exit('wrong hash');
$result=array('success'=>FALSE);

$hash=$_F['request']['hash'];
$data=json_encode(array(
    "mock"=>"post is not yet",
));

$result=array('success'=>FALSE);

$a->load("template");
$a=Template::getInstance();

if(!$a->templateAdd($hash,$data)){
    $a=Config::getInstance();
    $a->error("Failed to add template");
}
$result["done"]=true;

$a=Config::getInstance();
$a->export($result);
