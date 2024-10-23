<?php
if(!defined('INFTAPI')) exit('error');

$name=$_F['request']['name'];
$start=$_F['request']['start'];
$end=$_F['request']['end'];
$tpl=$_F['request']['template'];
$coin=$_F['request']['coin'];
$detail=$_F['request']['detail'];

$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

$data=array(
    "alink"     =>  $name,
    "coin"      =>  $coin,
    "start"     =>  $start,
    "end"       =>  $end,
    "template"  =>  $tpl,
    "winner"    =>  "[]",
    "apply"     =>  "[]",
    "detail"    =>  $detail,
    "status"    =>  BOUNTY_STATUS_OK,
);

if(!$a->bountyAdd($data)){
    $a=Config::getInstance();
    $a->error('Failed to add bounty.');
}

$result["alink"]=$name;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

