<?php
if(!defined('INFTAPI')) exit('error');

$alink=$_F['request']['alink'];             //iNFT anchor link
$bounty=$_F['request']['bounty'];           //bounty anchor link
$record=$_F['request']['record'];           //on chain apply record

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
$aps=json_decode($bt["apply"],true);
array_push($aps,array(
    "link"      =>   $alink,
    "record"    =>  $record,
    "stamp"     =>   time(),
    "status"    =>   BOUNTY_STATUS_ON_CHAIN,
));

$data=array(
    "apply"=>json_encode($aps),
);

if(!$a->bountyUpdate($data,(int)$bt["id"])){
    $a=Config::getInstance();
    $a->error("Failed to update bounty.");
}

$result["alink"]=$alink;
$result["bounty"]=$bounty;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

