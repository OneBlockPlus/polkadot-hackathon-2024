<?php
	class User extends CORE{
		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		private $origin=array(
			USER_ORIGIN_NORMAL		=>	'WEB',
			USER_ORIGIN_WEIXIN			=>	'微信',
			USER_ORIGIN_QQ				=>	'QQ',
			USER_ORIGIN_WEIBO			=>	'微博',
			USER_ORIGIN_ALIPAY			=>	'支付宝',
			USER_ORIGIN_APP				=>	'APP',
			USER_ORIGIN_OTHER			=>	'其他',
		);
		
		private $order=array(		//对排序进行转义，防止字符串直接传导给
			'default'	=>	'uid',
			'id'			=>	'uid',			//按id进行
			'name'		=>	'name',
			'asset'		=>	'blocks',
			'cash'		=>	'coin',
			'birth'		=>	'ctime',
			'login'		=>	'last',
			'phone'		=>	'mobile',
			'from'		=>	'origin',
		);
		
		public function transOrder($ord){
			if(!$ord) return $this->order['default'];
			if(isset($this->order[$ord])) return $this->order[$ord];
			return 'tid';
		}
		
		public function userSummary(){
			return $this->getGlobalHash(USER_SUMMARY);
		}
		
			
		public function userOrigin(){
			$rst=array();
			$table=PRE.'user';
			$count=10;
			foreach($this->origin as $k=>$v){
				$warr=array(
					'origin'=>$k,
				);	
				$p=$this->pages($table,'uid',$warr,$count);
				$rst[$v]=$p['sum'];
				
			}
			return $rst;
		}
		
		public function userTrend($date,$days=7){
			$rst=array();
			$dec=24*3600;
			$info=$this->getGlobalHash(USER_SUMMARY);
			for($i=$days;$i>0;$i--){
				$k=date('Ymd',$date-($i-1)*$dec);
				$rst[$k]=isset($info[$k])?(int)$info[$k]:0;
			}
			return $rst;
		}
		
		public function getStep(){
			return USER_PAGE_STEP;
		}
		
		public function userInfo($uuid){
			return $this->getGlobalHash($uuid);
		} 
		
		public function isUserCached($uid){
			$key=GLOBAL_PRE_USER.$uid;
			return $this->existsGlobalKey($key);
		}
		
		//处理公共user信息的缓存
		public function userCache($id){
			$user=$this->userView($id,FALSE);
			if(empty($user)) return FALSE;
			$key=GLOBAL_PRE_USER.$user['uid'];
			return $this->autosetGlobalHash($key,array(
				'name'	=>	$user['name'],
				'uuid'	=>	$user['uuid'],
				'birth'	=>	$user['birth'],
				'world'	=>	$user['world'],
				'sign'	=>	$user['sign'],
				'thumb'=> 	$user['thumb'],  
			));	
		}
		/*根据ID查看用户信息
		 * @param	$uid		integer		//用户的id
		 * @param	$filter	boolean	//是否过滤不必要的信息
		 * 
		 * */
		public function userView($uid,$filter=true){
			$table=PRE.'user';
			$where='uid';
			$arr=$this->select($table,$where,$uid);
			if(empty($arr)) return FALSE;
			return $filter?$this->userExport($arr[0]):$arr[0];
		}
		
		public function userExport($user){
			//echo json_encode($user).'<hr>';
			return array(
				'uid'=>			(int)$user['uid'],
				'name'=>		$user['name'],
				'sex'=>			(int)$user['sex'],
				'coin'=>		(float)$user['coin'],
				'block'=>		(int)$user['blocks'],
				'fav'=>			(int)$user['fav'],
				'email'=>		$user['email'],
				'mobile'=>	$user['mobile'],
				'email'=>		$user['email'],
				'sign'	=>	$user['sign'],
				//'salt'	=>		$user['salt'],
				'status'	=>	(int)$user['status'],
				'isReg'=>	$user['pass']==USER_UNPASS?FALSE:TRUE,
			);
		}

		public function userUpdate($data,$id){
			$table=PRE.'user';
			$where='uid';
			$data['mtime']=time();
			return $this->update($data, $table, $where, $id);
		}
		
		public function userList($page=0,$warr=array(),$order='uid',$desc=true,$count=USER_PAGE_COUNT){
			$table=PRE.'user';
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}
		
		public function userPages($warr=array(),$count=USER_PAGE_COUNT,$field='uid'){
			$table=PRE.'user';
			return $this->pages($table,$field,$warr,$count);
		}
		
		
		public function getUser($val,$type=1){
			$table=PRE.'user';
			if($type==1)$where='uid';
			if($type==2)$where='name';
			if($type==3)$where='phone';
			if($type==4)$where='mail';
			$user=$this->select($table,$where,$val);
			return empty($user)?FALSE:$user[0];
		}
		
		public function checkPass($user,$pass){
			$uu=$this->getUser($user,2);
			if(empty($uu)) return FALSE;
			
			$hash=$this->hashPass($pass,$uu['ctime']);
			return $hash==$uu['pass']?$uu:FALSE;
		}
		
		public function getToken(){
			return substr(md5(USER_PASS_SALT.time().uniqid()),22);
		}
		
		
		
		
		//密码加密的方法
		public function hashPass($pass,$time,$salt){
			return md5(USER_PASS_SALT.md5($pass).$time);
		}
		
		private function token(){
			return md5(microtime().uniqid());
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
		
		//生成需要的spam,替代uuid和token进行认证，可以防止冒用
		private function spam(){
			//7位的大小写字母，暂时用md5码代替
			return substr(md5(microtime().uniqid()), 0,7);
		}
		
		private function salt(){
			return substr(md5(microtime()), 12,5);
		}
	}