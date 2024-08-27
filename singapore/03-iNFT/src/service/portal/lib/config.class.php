<?php
class Config extends CORE{
	
	private $modlist=array('admin','hack','log','system','user','template','bounty','inft');		//模块列表
	private $_F=array();					//返回的系统变量,计算后的所有结果
	private $callback=0;					//js回调的放置位置
	private $smarty=array(
		'caching'=>true,
		'cache_lifetime'=>1200000,
		'template_dir'=>'view',				//模板的存放位置,注意,需要再调用下面的theme来显示
		'compile_dir'=>'data/view_c',		//运行编译模板的位置
		'cache_dir'=>'data/cache',			//缓存运行位置
		'left_delimiter'=>'{%',
		'right_delimiter'=>'%}',
		'array'=>'F',
		'suffix'=>'tpl',
	);
	private $ignor=array('salt','login');	//跳开检查token的接口
 	public function __construct(){CORE::dbStart(); }
	public function __destruct(){CORE::dbClose();}
	public static function getInstance(){ return CORE::init(get_class());}
	
	/********************************************/
	/***************基础环境配置问题******************/
	/********************************************/
	
	public function checkCoordinate($x,$y,$n){
		if(!is_numeric($x) || !is_numeric($y) || !is_numeric($n)
		|| $x<MIN_X || $x>MAX_Y || $y<MIN_Y || $y>MAX_Y
		|| $n<MIN_WORLD || $n>MAX_WORLD)return FALSE;
		return TRUE;
	}
	
	public function configEnv($mod=DEFAULT_MOD,$act=DEFAULT_ACT){
		$_GET['mod']=isset($_GET['mod'])?$_GET['mod']:$mod;
		$_GET['act']=isset($_GET['act'])?$_GET['act']:$act;
		
		//跳转到登录窗口的代码，通过设置指向来实现的
		if(in_array($_GET['act'], $this->ignor)){
			
		}else{
			if($this->checkApp()){
				$this->_F['name']=$_SESSION['name'];
				$this->_F['uid']=$_SESSION['uid'];
			}else{
				$_GET['mod']='admin';
				$_GET['act']='login';
			}
		}
		//1.获取根目录的位置
		if(null!==FOLDER_BASIC)$this->_F['rootPath']=$_SERVER['DOCUMENT_ROOT'].DS.FOLDER_BASIC.DS;
		else $this->_F['rootPath']='';
		
		//2.对请求进行路由
		$pre=$this->checkRequest();
		if(!$pre) $this->error('Login Error');
		
		if($pre==CON_WEB) include_once DEF_PATH.DS.'smarty'.DS.'Smarty.class.php';			//加载smarty
		$this->_F['pre']=$pre;
		
		$_GET['mod']=isset($_GET['mod'])?$_GET['mod']:DEFAULT_MOD;
		$_GET['act']=isset($_GET['act'])?$_GET['act']:DEFAULT_ACT;
		
		if(!in_array($_GET['mod'], $this->modlist)) $this->error('Not in mod list,error module');
		
		//2.处理控制器请求,并获取变量
		foreach($_GET as $k=>$v) $this->_F['request'][$k]=$this->strSafe($v);
		foreach($_POST as $k=>$v) $this->_F['request'][$k]=$this->strSafe($v);
		
		$target=PATH_CONTROLLER.DS.$_GET['mod'].DS.$pre.$_GET['mod'].CONNECTOR.$_GET['act'].SUFFIX_CONTROLLER;
		if(!file_exists($target)) $this->error('Hack Attemp');
		$this->_F['target']=$target;
		

		//3.记录用户的请求,不管记录成功与否
		$this->access();

		return $this->_F;
	}

	private function checkApp(){
		return isset($_SESSION['admin'])?$_SESSION['admin']:FALSE;
	}	
	
	private function deny(){
		$hacklog=json_encode(array('REQUEST'=>$_REQUEST,'SERVER'=>$_SERVER));
		$this->hackLog($hacklog);
	}
	
	private function access(){
		$json=$this->_F['request'];
		$json['ip']=$_SERVER['REMOTE_ADDR'];
		$json['uid']=(isset($_SESSION['uid'])&&$_SESSION['uid'])?$_SESSION['uid']:0;
		$this->runLog(json_encode($json));
	}
	
	//检查请求，进行匹配的方法
	private function checkRequest(){
		$pre=CON_WEB;
		if(isset($_GET['d']) && $_GET['d']='ajax'){
			$pre=CON_AJAX;
		}
		return $pre;
	}
	
	
	public function dumpArray($arr){
		$txt='<table>';
		foreach($arr as $k=>$v){
			$txt.='<tr><td>'.$k.'</td>';
			if(is_array($v)){
				$txt.=$this->dumpArray($v);
			}else{
				$txt.='<td>'.$v.'</td>';
			}
			$txt.='</tr>';
		}
		$txt.='</table>';
		return $txt;
	}
	
	/********************************************/
	/*********通用cache读取部分****************/
	/********************************************/
	
	public function getUser($uids){
		$arr=array();
		foreach($uids as $uid){
			$key=GLOBAL_PRE_USER.$uid;
			$user=$this->getGlobalHash($key);
			if(!empty($user))$arr[$uid]=$user;
		}
		return $arr;
	}
	/********************************************/
	/***************ajax输出部分*******************/
	/********************************************/
	
	/*通用输出方法*/
	public function export($data){
		if(DEBUG){
			global $yhf;
			$ms=microtime(true);
			$data['debug']=array(
				'start'	=>	$yhf['ms'],
				'end'	=>	$ms,
				'query'	=>  $yhf['query'],
				'redis'	=>  $yhf['redis'],
				'cost'	=>	round($ms-$yhf['ms'],6),
			);
		}
		
		if($this->callback){
			exit($this->callback.'('.json_encode($data).')');
		}else{
			exit(json_encode($data));
		}
	}
	
	public function error($msg){
		$this->deny();
		$rst=array(
			'success'=>false,
			'message'=>$msg,
		);
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
	
	private function clearHtml($txt){
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
		//fuu,这里需要递归处理，防止多次嵌套
		return preg_replace($search, $replace, $txt);	
	}
	
	/*smarty的函数,对模板的目录和组织方式进行确认
	 * @param		$mod		string		//get请求的模块
	 * @param		$act			string		//get请求的动作
	 * @param		$pre			string		//请求发起的方式
	 * @param		$data		array		//交给模板显示的数据
	 * 说明:因为core里不处理运行环境,所有在这里进行模板的处理,需要注意的是:
	 * 1.	实例化其他单例之后,需要重新调用初始化
	 * 2. web必须要用,因为需要显示模板
	 * */
	public function tpl($mod,$act,$pre,$data,$ver=DEF_VERSION){
		if(!class_exists('Smarty')){exit('no smarty class support...'); }
		if(DEBUG){
			global $yhf;
			$yhf['cost']=microtime(true)-$yhf['ms'];
			$data['debug']=$yhf;
			//echo json_encode($yhf);
		}
		$cfg=$this->smarty;
		$tpl=$ver.DS.$mod.DS.$pre.$mod.'_'.$act.'.'.$cfg['suffix'];
		$smarty = new Smarty;
		$smarty->cache_lifetime = $cfg['cache_lifetime'];
		$smarty->caching= $cfg['caching'];
		$smarty->template_dir =  $cfg['template_dir'];
		$smarty->compile_dir = $cfg['compile_dir'];
		$smarty->cache_dir =  $cfg['cache_dir'];
		$smarty->left_delimiter= $cfg['left_delimiter'];
		$smarty->right_delimiter= $cfg['right_delimiter'];
		$smarty->assign( $cfg['array'],$data,true);
		$smarty->display($tpl);
	}
	
	public function jump($url,$ver=DEF_VERSION){
		if(!class_exists('Smarty')){exit('no smarty class support...'); }	
		$cfg=$this->smarty;
		$tpl=$ver.DS.'jump.'.$cfg['suffix'];
		$smarty = new Smarty;
		$smarty->cache_lifetime = $cfg['cache_lifetime'];
		$smarty->caching= $cfg['caching'];
		$smarty->template_dir = $cfg['template_dir'];
		$smarty->compile_dir = $cfg['compile_dir'];
		$smarty->cache_dir =  $cfg['cache_dir'];
		$smarty->left_delimiter= $cfg['left_delimiter'];
		$smarty->right_delimiter= $cfg['right_delimiter'];
		$smarty->assign('url',$url,true);
		$smarty->display($tpl);
	}
	
	//分页函数，返回分页字符串
	public function pagination($count,$cur,$url,$step){
		$start=floor($cur/$step);
		$left=$count%$step;
		$txt='<ul class="pagination pagination-sm">';
			
		if($start==0){
			$stxt='class="disabled"';
			$scount=1;
		}else{
			$stxt='';
			$scount=$start*$step;
		}
		$txt.='<li '.$stxt.'><a href="'.$url.$scount.'">&laquo;</a></li>';
			
		$stop=$count<=$step?$count:$step;
			
		for($i=1;$i<=$stop;$i++){
			$index=$start*$step+$i;
			if($index<=$count){
				if($index==($cur+1)){
					$txt.='<li class="active"><a href="'.$url.$index.'">'.$index.'</a></li>';
				}else{
					$txt.='<li><a href="'.$url.$index.'">'.$index.'</a></li>';
				}
			}
		}
			
		if($count<=$step){
			$etxt='class="disabled"';
			$ecount=$count;
		}else{
			$etxt='';
			$ecount=($start+1)*$step+1;
		}
		$txt.='<li '.$etxt.'><a href="'.$url.$ecount.'">&raquo;</a></li>';
		$txt.='</ul>';
		return $txt;
	}
	
	
	/*日志类，用于每天的日志记录*/
	public function hackLog($txt){
		$date=date('Ymd');
		$table = PRE . HLOG;
		$sql = 'create table if not exists ' . $table . '_' . $date . ' like ' . $table;
		if($this->query($sql)){
			$data['ctime'] = time();
			$data['json'] = $txt;
			return $this -> insert($data, $table . '_' . $date);
		}else{
			return false;
		}
	}
	
	public function runLog($json){
		$date=date('Ymd');
		$table = PRE . LOG;
		$sql = 'create table if not exists ' . $table . '_' . $date . ' like ' . $table;
		if($this->query($sql)){
			$file=empty($_FILES)?'':json_encode($_FILES);
			$post=empty($_POST)?'':json_encode($_POST);
			$data['ctime'] = time();
			$data['json'] = $json.$file.$post;
			return $this -> insert($data, $table . '_' . $date);
		}else{
			return false;
		}
	}
}