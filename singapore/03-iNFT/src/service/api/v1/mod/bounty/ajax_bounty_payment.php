<?php
if(!defined('INFTAPI')) exit('error');

$alink=$_F['request']['alink'];             //payment anchor link
$bounty=$_F['request']['bounty'];           //bounty anchor link

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


//3.update the apply and status
$data=array(
    "payment" => $alink,
    "status"  => BOUNTY_STATUS_PAY_SUBMITTED,
);

if(!$a->bountyUpdate($data,(int)$bt["id"])){
    $a=Config::getInstance();
    $a->error("Failed to update payment");
}

$result["alink"]=$alink;
$result["bounty"]=$bounty;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

