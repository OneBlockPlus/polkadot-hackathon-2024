<?php
	class Admin extends CORE{
		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
			
		public function getStep(){
			return ADMIN_PAGE_STEP;
		}
		
		
		public function adminReset($uid){
			//$pass=$this->char(8);
			$pass='admin123456';		//临时使用，正式发布时候密码发手机
			$salt=$this->char(5);
			
			$table=PRE.'admin';
			$where='uid';
			$arr=$this->select($table,$where,$uid);
			if(empty($arr)) return FALSE;
			
			$admin=$arr[0];
			
			$data=array();
			$data['salt']=$salt;
			$data['pass']=$this->encrypPass($pass,$salt);
			$data['status']=ADMIN_STATUS_RESET;		//更新状态,登陆的时候要求改密码
			
			if($this->adminUpdate($data, $uid))	return array('mobile'=>$admin['phone'],'pass'=>$pass);
			return FALSE;
		}
		
		public function adminView($name){
			$page=0;
			$warr=array('name'=>$name);
			$arr=$this->adminList($page,$warr);
			if(empty($arr))	return FALSE;
			return $arr[0];
		}
		
		public function adminSalt($name){
			$admin=$this->adminView($name);
			if(empty($admin)) return FALSE;
			return $admin['salt'];
		}
		
		public function adminLogin($pass,$dpass,$dsalt){
			return $pass==md5($dpass.$dsalt);
		}
		/*	管理员的登陆的方法
		 * @param	$name	string	//管理员用户名
		 * @param	$pass	string	//管理员密码
		 * return
		 * 1.设置好global的标志位及过期
		 * */
		/*public function adminLogin($name,$pass){
			
			$arr=$this->adminList($page=0,array('name'=>$name));
			if(empty($arr)) return FALSE;
			
			$admin=$arr[0];
			if($admin['status']!=ADMIN_STATUS_OK) return false;
			if($admin['pass']!=$this->encrypPass($pass,$admin['salt'])) return false;
			
			$salt=$this->char(7);
			$ip=$_SERVER['REMOTE_ADDR'];
			$agent=$_SERVER['HTTP_USER_AGENT'];
			
			$info=array();
			$info['uid']=$admin['uid'];
			$info['name']=$admin['name'];
			$info['IP']=$_SERVER['REMOTE_ADDR'];
			$info['salt']=$salt;
			$info['agent']=$agent;
			$info['last']=time();
			
			$spam=$this->spam($salt,$ip,$agent);
			$this->autosetGlobalHash($spam,$info);
			
			//$this->setGlobalKey($hash,$admin['name']);
			$this->setGlobalExp($spam,ADMIN_DEFAULT_EXPIRE);
			
			$data=array();
			$data['last']=$_SERVER['REMOTE_ADDR'];
			$this->adminUpdate($data, (int)$admin['uid']);
			
			
			return $spam;
		}*/
		
		/*	管理员注销操作
		 * @param	$token	string	//需要注销的令牌
		 * return
		 * 注销掉令牌
		 * */
		public function adminLogout($spam){
			if($this->getKey($spam)){
				$this->delKey($spam);
				return TRUE;
			}
			return FALSE;
		}
		
		public function adminUpdate($data,$id){
			$table=PRE.'admin';
			$where='uid';
			$data['mtime']=time();
			$data['last']=$_SERVER['REMOTE_ADDR'];
			return $this->update($data, $table, $where, $id);
		}

		public function adminList($page=0,$warr=array(),$order='uid',$desc=true,$count=ADMIN_PAGE_COUNT){
			$table=PRE.'admin';
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}
		
		
		public function adminPages($warr=array(),$count=ADMIN_PAGE_COUNT,$field='uid'){
			$table=PRE.'admin';
			return $this->pages($table,$field,$warr,$count);
		}
		public function checkSpam($spam){
			$info=$this->getGlobalHash($spam);
			if(empty($info)) return FALSE;
			return substr($spam, 2,3)==substr(md5($info['IP'].$info['salt'].$info['agent']),5,3)?$info:FALSE;
		}
		
		private function spam($salt,$ip,$agent){
			$pre=$this->char(2);
			$suffix=$this->char(3);
			$spam=$pre.substr(md5($ip.$salt.$agent),5,3).$suffix;
			if($this->existsGlobalKey($spam)) return $this->spam($salt,$ip);
			return $spam;	
		}
		
		/*********基础算法区*********/
		
		private function encrySpam($ip,$salt){
			return md5($salt.$ip.$salt);
		}
		
		private function encrypPass($pass,$salt){
			return md5($pass.$salt);
		}
		
		private function md32(){
			return md5(uniqid().microtime().rand(1, 100));
		}
		
		private function uuid(){
		    $str = md5(uniqid(mt_rand(), true));
		    $uuid  = substr($str,0,8) . '-';   
		    $uuid .= substr($str,8,4) . '-';   
		    $uuid .= substr($str,12,4) . '-';   
		    $uuid .= substr($str,16,4) . '-';   
		    $uuid .= substr($str,20,12);   
		    return $uuid;
		}
	}