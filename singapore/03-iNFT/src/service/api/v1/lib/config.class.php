<?php
class Config extends CORE{
	private $modlist=array('system','template','list','selling','bounty','comment');		//support modules
	private $ignor=array('new','spam','fresh');			//user spam access
	public $_F=array();

 	public function __construct(){CORE::dbStart(); }
	public function __destruct(){CORE::dbClose();}
	public static function getInstance(){ return CORE::init(get_class());}
	
	/********************************************/
	/****************Env Config******************/
	/********************************************/
		
	public function configEnv(){
		
		$pre=$this->checkRequest();
		if(!$pre) $this->error('Login Error');
		$this->_F['pre']=$pre;
		$_GET['mod']=isset($_GET['mod'])?$_GET['mod']:DEFAULT_MOD;
		$_GET['act']=isset($_GET['act'])?$_GET['act']:DEFAULT_ACT;
		if(!in_array($_GET['mod'], $this->modlist)) $this->error('Not in mod list,error module');

		//2.pramaters process
		foreach($_GET as $k=>$v) $this->_F['request'][$k]=$this->strSafe($v);
		foreach($_POST as $k=>$v) $this->_F['request'][$k]=$this->strSafe($v);

		if($_GET['mod']==="system" && in_array($_GET['act'],$this->ignor)){
			if(!empty($this->_F['request']['uuid'])){
				$this->_F['uuid']=$this->_F['request']['uuid'];
				$this->_F['uid']=0;
			}else{
				$this->_F['uuid']="Not yet";
				$this->_F['uid']=0;
			}
		}else{
			$info=$this->checkSpam();
			//echo json_encode($info);
			if(empty($info)) $this->error('wrong spam',ERROR_LEVEL_3,true);
			$this->_F['uuid']=$info['uuid'];
			$this->_F['uid']=$info['uid'];
			
		}
		
		$this->access();

		$target=API_VERSION.DS.PATH_CONTROLLER.DS.$_GET['mod'].DS.$pre.$_GET['mod'].CONNECTOR.$_GET['act'].SUFFIX_CONTROLLER;
		if(!file_exists($target)) $this->error('Hack Attemp');
		$this->_F['target']=$target;
		return $this->_F;
	}
	
	/*检测动态令牌是否合法的操作*/
	public function checkSpam(){

		if(!isset($_GET['spam']) || strlen($_GET['spam'])!=7) return FALSE;
		$spam=$_GET['spam'];
		
		//spam过期验证
		$key=GLOBAL_PRE_SPAM.$spam;
		$ttl=$this->ttlKey($key);
		if($ttl<0) return FALSE;
			
		//spam合法性验证
		$info=$this->getHash($key);
		if($this->encrySpam($info['IP'],$info['salt'])!=$info['md5']) return FALSE;
			
		//刷新合法的spam
		$this->expireKey($key,USER_SPAM_EXPIRE);
			
		//输出用户信息
		$uuid=$info['uuid'];
		$user=$this->getHash($uuid,array('uid'));
		$arr=$this->getHash($uuid);
		
		return array('uuid'=>$uuid,'uid'=>(int)$user['uid']);
	}
		
	private function encrySpam($ip,$salt){
		return md5($salt.$ip.$salt);
	}
	
	private function deny($code){
		$hacklog=json_encode(array('REQUEST'=>$_REQUEST,'SERVER'=>$_SERVER));
		$this->hackLog($hacklog,$code);
	}
	
	private function access(){
		$json=$this->_F['request'];
		$json['ip']=$_SERVER['REMOTE_ADDR'];
		$json['uid']=(isset($this->_F['uid'])&&$this->_F['uid'])?$this->_F['uid']:0;
		$this->runLog(json_encode($json));
	}
	
	//检查请求，进行匹配的方法
	private function checkRequest(){
		$pre=CON_AJAX;
		if(isset($_GET['callback'])){
			$pre=CON_JSONP;
			$this->callback=$_GET['callback'];
		}
		return $pre;
	}
	
	/**************************************************/
	/***************Export Functions*******************/
	/**************************************************/
	
	/*通用输出方法*/
	public function export($data){
		//echo json_encode($data);
		if(DEBUG){
			global $yhf;
			$ms=microtime(true);
			$data['debug']=array(
				'length'	=>	strlen(json_encode($data))+3,		//输出数据长度，不算debug部分
				'cost'		=>	round($ms-$yhf['ms'],6),
				'query'		=>	$yhf['query'],
				'redis'		=>	$yhf['redis'],
			);
		}
		exit(json_encode($data));
		//exit($this->callback.'('.json_encode($data).')');
	}

	public function error($msg,$code=ERROR_LEVEL_3,$expired=false){
		$this->deny($code);
		$rst=array(
			'success'		=>false,
			'message'		=>$msg,
		);
		if($msg==='wrong spam') $rst['code']=444;		
		if($expired) $rst['expired']=true;
		$this->export($rst);
	}
	
	public function safe($arr){
		$rst=array();
		foreach($arr as $k=>$v)	$rst[$k]=$this->strSafe($v);
		return $rst;
	}
	
	private function strSafe($str){
		$html_string = array("&amp;", "&nbsp;", "'", '"', "<", ">", "\t", "\r");
		$html_clear = array("&", " ", "&#39;", "&quot;", "&lt;", "&gt;", "&nbsp; &nbsp; ", "");
		$js_string = array("/<script(.*)<\/script>/isU");
		$js_clear = array("");
	
		$frame_string = array("/<frame(.*)>/isU", "/<\/fram(.*)>/isU", "/<iframe(.*)>/isU", "/<\/ifram(.*)>/isU",);
		$frame_clear = array("", "", "", "");
	
		$style_string = array("/<style(.*)<\/style>/isU", "/<link(.*)>/isU", "/<\/link>/isU");
		$style_clear = array("", "", "");
		
	    $str = trim($str);
	
	   	$str = str_replace($html_string, $html_clear, $str);
		$str = preg_replace($js_string, $js_clear, $str);
		$str = preg_replace($frame_string, $frame_clear, $str);
		$str = preg_replace($style_string, $style_clear, $str);
		
		return $str;
	}
	
	public function clearHtml($txt){
		$search = array ("'<script[^>]*?>.*?</script>'si", // 去掉 javascript
		         "'<[\/\!]*?[^<>]*?>'si",      // 去掉 HTML 标记
		         "'([\r\n])[\s]+'",         // 去掉空白字符
		         "'&(quot|#34);'i",         // 替换 HTML 实体
		         "'&(amp|#38);'i",
		         "'&(lt|#60);'i",
		         "'&(gt|#62);'i",
		         "'&(nbsp|#160);'i",
		         "'&(iexcl|#161);'i",
		         "'&(cent|#162);'i",
		         "'&(pound|#163);'i",
		         "'&(copy|#169);'i",
		         "'&#(\d+);'e");          // 作为 PHP 代码运行
		 
		$replace = array ("",
		         "",
		         "\\1",
		         "\"",
		         "&",
		         "<",
		         ">",
		         " ",
		         chr(161),
		         chr(162),
		         chr(163),
		         chr(169),
		         "chr(\\1)");

		return preg_replace($search, $replace, $txt);	
	}
	
	public function hackLog($txt,$code=ERROR_LEVEL_3){
		$date=date('Y_m');
		$table = PRE . HLOG;
		$sql = 'create table if not exists ' . $table . '_' . $date . ' like ' . $table;
		if($this->query($sql)){
			$data=array(
				'code'=>	$code,
				'ctime'=>	time(),
				'json'=>	$txt,
			);
			return $this -> insert($data, $table . '_' . $date);
		}else{
			return false;
		}
	}
	
	public function runLog($json){
		$date=date('Y_W');
		$table = PRE . LOG;
		$sql = 'create table if not exists ' . $table . '_' . $date . ' like ' . $table;
		if($this->query($sql)){
			$file=empty($_FILES)?array():$_FILES;
			$post=empty($_POST)?array():$_POST;
			if(isset($post['thumb'])) $post['thumb']='image thumb data deleted';
			
			$act=$this->getHash($this->_F['uuid'],array('active'));				//获取位置信息
			if($act['active']) $pos=json_decode($act['active'],TRUE);
			$data=array(
				'm'		=>$_GET['mod'],
				'a'			=>$_GET['act'],
				'uid'		=>$this->_F['uid'],
				'ctime'	=>time(),
				'ip'		=>$_SERVER['REMOTE_ADDR'],
				'json'=>json_encode(array(
					'get'=>$_GET,
					'post'=>$post,
					'file'=>$file,
					)),
			);
			return $this -> insert($data, $table . '_' . $date);
		}else{
			return false;
		}
	}
}