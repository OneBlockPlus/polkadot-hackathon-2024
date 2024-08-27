<?php
if(!defined('INFTAPI')) exit('error');

$alink=$_F['request']['alink'];
$address=$_F['request']['address'];
$memo=$_F['request']['memo'];

$result=array('success'=>FALSE);

$a->load("comment");
$a=Comment::getInstance();

$data=array(
    "alink"    =>  $alink,
    "address"   =>  $address,
    "memo"      =>  $memo,
    "status"    =>  COMMENT_STATUS_OK,
);

if(!$a->commentAdd($data)){
    $a=Config::getInstance();
    $a->error("Failed to add comment.");
}

$result['success']=true;

$a=Config::getInstance();
$a->export($result);