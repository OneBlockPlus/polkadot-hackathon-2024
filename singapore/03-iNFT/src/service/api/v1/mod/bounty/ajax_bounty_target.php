<?php
if(!defined('INFTAPI')) exit('error');

$network=$_F['request']['network'];             //iNFT anchor link

$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

//1.check the bounty
$target=$a->bountyTarget($network);
if(empty($target)){
    $a=Config::getInstance();
    $a->error("No target address to pay.");
}

//2. option 2: saving the target on anchor

$result["target"]=$target;
$result["network"]=$network;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

