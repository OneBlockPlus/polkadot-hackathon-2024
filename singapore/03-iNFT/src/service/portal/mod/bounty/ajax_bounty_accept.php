<?php
if(!defined('INFTADM')) exit('error');

$id=(int)$_F['request']['id'];           //bounty anchor link
$index=$_F['request']['index'];
$record=$_F['request']['record'];

$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

$bounty=$a->bountyView($id);
if(empty($bounty)){
    $a=Config::getInstance();
    $a->error("No such bounty.");
}

$apply=json_decode(htmlspecialchars_decode($bounty["apply"]),true);

$apply[$index]["judge"]=$record;
$apply[$index]["status"]=BOUNTY_APPLY_APPROVED;

$data=array(
    "apply" => json_encode($apply),
);

if(!$a->bountyUpdate($data,$id)){
    $a=Config::getInstance();
    $a->error("Failed to update apply");
}

$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

