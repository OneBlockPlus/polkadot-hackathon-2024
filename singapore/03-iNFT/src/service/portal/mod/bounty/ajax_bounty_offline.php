<?php
if(!defined('INFTADM')) exit('error');

$id=(int)$_F['request']['id'];           //bounty anchor link


$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

$bounty=$a->bountyView($id);
if(empty($bounty)){
    $a=Config::getInstance();
    $a->error("No such bounty.");
}

$data=array(
    "applied" => 0,
);

if(!$a->bountyUpdate($data,$id)){
    $a=Config::getInstance();
    $a->error("Failed to update apply");
}

$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

