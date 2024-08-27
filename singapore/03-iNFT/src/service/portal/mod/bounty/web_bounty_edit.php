<?php
if(!defined('INFTADM')) exit('error');

//parameters
if(!isset($_F['request']['id'])||!is_numeric($_F['request']['id'])) exit('wrong id');
$id=(int)$_F['request']['id'];

$a->load("bounty");
$a=Bounty::getInstance();

//1.get the bounty details
$bounty=$a->bountyView($id);

$bounty["detail"]=json_decode(htmlspecialchars_decode($bounty["detail"]),true);
$bounty["template"]=json_decode(htmlspecialchars_decode($bounty["template"]),true);
$bounty["apply"]=json_decode(htmlspecialchars_decode($bounty["apply"]),true);

//2.status data

$_F['status']=array(
    BOUNTY_APPLY_SUBMITTED  => "Submitted",
    BOUNTY_APPLY_APPROVED  => "Waiting for diverting",
    BOUNTY_APPLY_FAILED  => "Invalid apply",
    BOUNTY_APPLY_PAYED  => "Distributed",
    BOUNTY_APPLY_DIVERTTED   =>  "Waiting for distributing",
);

$_F['data']=$bounty;

//3.get pay apply array
$arr=array();
foreach($bounty["apply"] as $k=>$v){
    if( (int)$v["status"] === BOUNTY_APPLY_APPROVED){
        $v["index"]=$k;
        $arr[]=$v;
    }
}
$_F['paying']=$arr;

$a=Config::getInstance();
$a->tpl($_F['request']['mod'],$_F['request']['act'],$_F['pre'],$_F);