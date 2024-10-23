<?php
	class Inft extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		public function getStep(){
			return INFT_PAGE_STEP;
		}

		public function nav($key){
			$sum=$this->lenList($key);
			$step=$this->getStep();
			return array(
				"total"=> $sum,
				"page" => ceil($sum/$step),
				"step" => $step,
			);
		}

		public function listINFTbyAddress($address,$page=0){
			$queue=INFT_PREFIX_ACCOUNT.$address;

			$step=$this->getStep();
			$start=$step*$page;
			$end=$start+$step-1;
			$arr=$this->rangeList($queue,$start,$end);

			$result=array();
			foreach($arr as $k=>$v){
				$tmp=explode("_",$v);
				$block=array_pop($tmp);		//get the last element as block number

				array_shift($tmp);			//remove the prefix
				$name=implode("_",$tmp);
				$result[]=array(
					"name"	=>	$name,
					"block" => (int)$block,
				);
			}

			return $result;
		}
	}