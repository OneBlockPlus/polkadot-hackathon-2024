<?php
if(!defined('INFTAPI')) exit('error');

$alink=$_F['request']['alink'];             //iNFT anchor link
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

$result["alink"]=$alink;
$result["bounty"]=$bounty;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

