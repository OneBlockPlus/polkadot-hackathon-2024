<?php
if(!defined('INFTAPI')) exit('error');

$bounty=$_F['request']['bounty'];           //bounty anchor link
$memo=$_F['request']['memo'];           //on chain apply record

$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

//1.check the bounty
$bt=$a->bountySearch($bounty);
if(empty($bt)){
    $a=Config::getInstance();
    $a->error("No such bounty");
}

//2.check the apply anchor


//3.update the announce

$data=array(
    "announce"=>$memo,
);

if(!$a->bountyUpdate($data,(int)$bt["id"])){
    $a=Config::getInstance();
    $a->error("Failed to update bounty.");
}

$result["bounty"]=$bounty;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

