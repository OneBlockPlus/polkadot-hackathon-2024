<?php
	class Log extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		public function getStep(){
			return LOG_PAGE_STEP;
		}
		
		/*统计最近7日的log行为数据
		 * 
		 * 
		 * */
		public function logSummary($date,$n=7){
			$ord=date('w',$date);		//获取当天是1周的第几天
			if($ord==0)	$ord=7;		//修正周日开始，但年份计算周数未开始的bug
				
			$year=date('Y',$date);
			$week=date('W',$date);
			$dec=24*3600;
			
			$rst=array();
			
			for($i=$n;$i>0;$i--){
				$k=date('Ymd',$date-($i-1)*$dec);
				$sw=$i>$ord?$week-1:$week;
				$suffix=$year.CONNECTOR.((int)$sw<10?'0'.(int)$sw:(int)$sw);
				if($i==1){
					$warr=array(
						array('ctime','>=',$date),
					);
				}else{
					$warr=array(
						array('ctime','>=',$date-($i-1)*$dec),
						array('ctime','<=',$date-($i-2)*$dec),
					);
				}
				$param=$this->logPages($suffix,$warr);
				$rst[$k]=$param['sum'];
			}
			return $rst;
		}

		public function logView($id,$date){
			$table=PRE.'log'.CONNECTOR.$date;
			$where='id';
			$arr=$this->select($table,$where,$id);
			return empty($arr)?FALSE:$arr[0];
		}
		
		public function logList($date,$page=0,$warr=array(),$order='id',$desc=true,$count=LOG_PAGE_COUNT){
			$table=PRE.'log'.CONNECTOR.$date;
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}
		
		public function logPages($date,$warr=array(),$count=LOG_PAGE_COUNT,$field='id'){
			$table=PRE.'log'.CONNECTOR.$date;
			return $this->pages($table,$field,$warr,$count);
		}
	}