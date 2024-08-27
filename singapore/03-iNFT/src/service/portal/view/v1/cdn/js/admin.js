var FF=(function($,G){
	var FF=function(){return new FF.fn.init()}
	var me={}
	
	FF.fn=FF.prototype={
		init:function(){},
		/*选择列表操作部分*/
		selectList:function(sel,rowClass){
			var checkNum=0,arr=$(sel),len=arr.length
			for(var i=0;i<len;i++){
				if($(arr[i]).is(':checked')){
					checkNum++
				}
			}
			if(checkNum==len){
				arr.prop("checked",false).parent().parent().removeClass(rowClass)
			}else{
				arr.prop("checked",true).parent().parent().addClass(rowClass)
			}
		},
		
		getCheckBoxlist:function(sel){
			var ids=[],arr=$(sel),len=arr.length
			for(var i=0;i<len;i++){
				if($(arr[i]).is(':checked')){
					ids.push(parseInt($(arr[i]).val()))
				}
			}
			return ids.length?ids:false
		},
		
				
		//jsonp操作
		get:function(cfg,server,ck){
			var furl=server+'?mod='+cfg.mod+'&act='+cfg.act
			if(cfg.param!=undefined)$.each(cfg.param, function(k,v){furl+='&'+k+'='+v})
			furl+='&callback=?'
			console.log(furl)
			
			$.ajaxSettings.async = true
			$.getJSON(furl,function(res){
				console.log(get)
				ck && ck(res)
			})
		},
		
		/*ajax操作部分 */
		ajax:function(cfg,isToken,ck,isPost){
			var furl='?d=ajax&mod='+cfg.mod+'&act='+cfg.act
			if(isToken){
				furl+='&u='+localStorage['user']+'&t='+localStorage['token']
			}
			
			if(cfg.param!=undefined){
				$.each(cfg.param, function(k,v){furl+='&'+k+'='+v})
			}
			console.log(furl)
			
			$.ajax({
				type:'get',
				url:furl,
				async:false,
				success:function(data){
					var res=JSON.parse(data)
					if(!res.success){
						console.log('Error:'+res.message);
					}
					ck && ck(res)
				}
			})
		},
		
		jsonp:function(cfg,server,ck){
			var furl=server+'?mod='+cfg.mod+'&act='+cfg.act
			if(cfg.param!=undefined)$.each(cfg.param, function(k,v){furl+='&'+k+'='+v})
			furl+='&callback=?'
			$.ajaxSettings.async = true
			console.log(furl)

			$.getJSON(furl,function(data){
				ck && ck(data)
			})
		},
		showInfo:function(txt,sel,at){
			var at=at||1500;
			$(sel).html(txt);
			if(at) setTimeout(function(){$(sel).html('')},at);
		},
		message:function(sel,txt,at,type,ck){
			type=type||'danger'
			var cls='alert alert-'+type
			var tt='<a class="close" data-dismiss="alert" href="#">&times;</a><strong>'+type+'!</strong>'+txt
			$(sel).html(tt).addClass(cls).show()
			at=at||1500
			setTimeout(function(){
				$(sel).hide()
				ck&&ck()
			},at)
		},
		
		//fuu,统一的对话框
		dialog:function(cfg,data,ck){	
			
			var type=cfg.type
			
			var data=[
					{id:'',name:'',ajax:{},type:'select',data:[]},
					{id:'',name:'',ajax:{},type:'input',data:[]},
					{id:'',name:'',ajax:{},type:'label',data:[]},
					{id:'',name:'',ajax:{},type:'text',data:[]},
				]
			var title=cfg.title || "配置对话框"
			var btns='<p class="text-right"><span id="dialog_save" class="btn btn-md btn-primary">保存</span></p>'
			
			var rst={}
			ck && ck(rst)
		},
		
		showError:function(txt,at){
			
		},
		
		showMessage:function(title,content,ck){
			var btns='<p class="text-right"><span id="dialog_save" class="btn btn-md btn-primary">保存</span></p>'
			
			$("#myModal .modal-title").html(title)
			$("#myModal .modal-body").html(content+btns)
			
			var $m_btn = $('#modalBtn');
			var $modal = $('#myModal');
			$m_btn.on('click', function(){
				$modal.modal({backdrop: 'static'});
			});
		
			$modal.on('show.bs.modal', function(){
				var $modal_dialog = $(this).find('.modal-dialog');
				$(this).css('display', 'block');
				$modal_dialog.css({'margin-top': Math.max(0, ($(window).height() - $modal_dialog.height()) / 2) });
			});
			
			$("#lun_trigger").trigger("click")
			
			$("#myModal .modal-body").find("li").on("click",function(){
				$(this).addClass('active').siblings().removeClass('active')
			})
			
			$("#dialog_save").on('click',function(){
				var rst=$("#myModal .modal-body").find(".active").attr('data')
				$(".modal-header button").trigger("click")
				ck && ck(rst)
			})
		},
		
		isEmpty:function(obj){
			for(var name in obj){return false}
			return true
		},
		isType: function (obj, type) {return !!type ? FF.fn.type(obj) === type.toLowerCase():self.type(obj)},
		type: function (obj) {return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase()},
		stamp:function(){return new Date().getTime()},
		toDate:function(s) { return new Date(parseInt(s)).toLocaleString().replace(/:\d{1,2}$/,' ')},
		htmlDecode:function(s){
			var c=s.replace(/\&quot;/g,'"')
			return c
		},
		val_remove:function(k,arr){
			var narr=[]
			for(var i=0;i<arr.length;i++)if(arr[i]!=k)narr.push(arr[i])
			return narr
		},
		getTag:function(t){var p=t.split('_'),x=p.length;return p[x-1]},
		in_array:function(k,a){for(i=0;i<a.length;i++)if(k==a[i])return true;return},
	}
	
	FF.get=FF.fn.get
	
	return FF
})(window.$,window.G)
;(window.FF=FF) && FF===undefined && (window.FF=FF)