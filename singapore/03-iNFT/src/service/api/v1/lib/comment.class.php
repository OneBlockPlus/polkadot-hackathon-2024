<?php
	class Comment extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		public function getStep(){
			return COMMENT_PAGE_STEP;
		}
		
		public function commentExsist($alink){
			$warr=array(
				"alink" => $alink,
			);
			$page=0;
			$arr=$this->commentList($page,$warr);
			if(empty($arr)) return false;
			return true;
		}

		public function commentShow($id){
			$table=PRE.'comment';
			$where='id';
			$data=array();
			$data['mtime']=time();
			$data['status']=1;
			return $this->update($data, $table, $where, $id);	
		}
		
		public function commentClose($id){
			$table=PRE.'comment';
			$where='id';
			$data=array();
			$data['mtime']=time();
			$data['status']=0;
			return $this->update($data, $table, $where, $id);	
		}
		
		public function commentAdd($data){
			$table=PRE.'comment';
			$stamp=time();
			$data['mtime']=$stamp;
			$data['ctime']=$stamp;
			return $this->insert($data, $table);
		}
		
		public function commentView($id){
			$table=PRE.'comment';
			$where='id';
			$arr=$this->select($table,$where,$id);
			return empty($arr)?FALSE:$arr[0];
		}

		public function commentSearch($alink){
			$warr=array(
				'bounty'=>$alink,
			);
			$arr=$this->commentList(0,$warr);
			//echo json_encode($arr);
			return empty($arr)?FALSE:$arr[0];
		}

		public function commentIds($ids,$order='id',$fields=array()){
			$table=PRE.'comment';
			$where='id';
			return $this->ids($table,$where,$ids,$order,$fields);
		}
		
		public function commentUpdate($data,$id){
			$table=PRE.'comment';
			$where='id';
			$data['mtime']=time();
			return $this->update($data, $table, $where, $id);
		}
		
		public function commentList($page=0,$warr=array(),$order='id',$desc=true,$count=COMMENT_PAGE_COUNT){
			$table=PRE.'comment';
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}

		
		public function commentPages($warr=array(),$count=COMMENT_PAGE_COUNT,$field='id'){
			$table=PRE.'comment';
			return $this->pages($table,$field,$warr,$count);
		}
	}