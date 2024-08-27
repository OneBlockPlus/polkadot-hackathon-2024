<?php
if(!defined('INFTAPI')) exit('error');

$bounty=$_F['request']['bounty'];           //bounty anchor link
$index=(int)$_F['request']['index'];        //apply index
$hash=$_F['request']['hash'];               //divert hash

$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

//1.check the bounty
$bt=$a->bountySearch($bounty);
if(empty($bt)){
    $a=Config::getInstance();
    $a->error("No such bounty");
}

//2.update the apply and status
$aps=json_decode($bt["apply"],true);
if(!isset($aps[$index])){
    $a=Config::getInstance();
    $a->error("No such submission.");
}

if(isset($aps[$index]["divert"])){
    $a=Config::getInstance();
    $a->error("Already divertted.");
}

$aps[$index]["divert"]=$hash;
$aps[$index]["status"]=BOUNTY_APPLY_DIVERTTED;
$data=array(
    "apply"=>json_encode($aps),
);
if(!$a->bountyUpdate($data,(int)$bt["id"])){
    $a=Config::getInstance();
    $a->error("Failed to update bounty.");
}

$result["bounty"]=$bounty;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);