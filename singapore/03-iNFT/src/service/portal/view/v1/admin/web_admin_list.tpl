{%include file="{%DEF_VERSION%}/common/web_header.tpl" title=foo%}
{%include file="{%DEF_VERSION%}/common/web_aside.tpl" title=foo%}
<section>
	<div class="content-wrapper">
		<ul class="nav navbar-nav controller">
			<li>
				<a class="hidden-xs" href="#" data-trigger-resize="" data-toggle-state="aside-collapsed"><em class="fa fa-navicon"></em></a>
				<a class="visible-xs sidebar-toggle" href="#" data-toggle-state="aside-toggled" data-no-persist="true"><em class="fa fa-navicon"></em></a>
			</li>
		</ul>
		<h3>Administrator System Management</h3>

		<div class="row">
			<div class="col-lg-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						Administrators
						<a class="pull-right" href="#" data-tool="panel-collapse" data-toggle="tooltip" title="点击收起操作面板">
							<em class="fa fa-minus"></em>
						</a>
					</div>
					<div class="panel-wrapper collapse in">
					<div class="panel-body">
						<table class="table table-hover">
							<tr>
								<th></th>
								<th>ID</th>
								<th>用户名</th>
								<th>管理世界</th>
								<th>手机</th>
								<th>邮件</th>
								<th>创建时间</th>
								<th>操作</th>
							</tr>

							{%if count($F.list) neq 0%} {%foreach from=$F.list key=k item=v %}
							<tr class="text-left">
								<td><input type="checkbox" class="check_list" value="{%$v.rid%}" /></td>
								<td class="id">{%$v.uid%}</td>
								<td class="nobreak">{%$v.name%}</td>
								<td>{%$v.world%}</td>
								<td>{%$v.phone%}</td>
								<td>{%$v.email%}</td>
								<td>{%$v.ctime|date_format:'%Y-%m-%d'%}</td>
								<td class="nobreak">
									<button class="btn btn-sm btn-primary pass_reset" data="{%$v.uid%}">重置密码</button>
									{%if $v.status eq 0%}
									<button class="btn btn-sm btn-default status_show" data="{%$v.uid%}">可用</button> {%else%}
									<button class="btn btn-sm btn-danger status_close" data="{%$v.uid%}">禁用</button> {%/if%}
									<div class="btn-group">
										<button data-toggle="dropdown" class="btn btn-sm dropdown-toggle">其他操作 <span class="caret"></span></button>
										<ul class="dropdown-menu">
											<li>
												<a href="?mod=module&act=edit&id={%$v.id%}"><em class="icon-note"></em><span> 编辑资源信息</span></a>
											</li>
										</ul>
									</div>
								</td>
							</tr>
							{%/foreach%} {%/if%}
							<tr class="row_selected">
								<td colspan="10">
									<!--<div class="z">
										<button id="select_all">全选</button>
										<button id="close_all">关闭</button>
										<button id="show_all">开放</button>
									</div>-->
								</td>
							</tr>
						</table>
					</div>
					</div>
					<div class="panel-footer">
						<div class="pagination-container text-right">
							{%$F.nav%}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<script type="text/javascript">
	$(".pass_reset").on('click',function(){
		var uid=parseInt($(this).attr('data'))
		var cfg = {mod:'admin',act:'reset',param:{id:uid}}
		FF.fn.ajax(cfg, false, function(res) {
			console.log(res)
		})
	})
	
	$(".table tr").on('click', function() {
		var sel = $(this).find('.check_list')
		if(sel.is(':checked')) {
			$(this).removeClass('row_selected')
		} else {
			$(this).addClass('row_selected')
		}
		sel.prop("checked", sel.is(':checked') ? false : true)
	})

	$(".status_close").on('click', close_me)
	$(".status_show").on('click', show_me)

	function close_me() {
		var me = $(this)
		var did = me.attr('data')
		var cfg = {mod:'admin',act:'close',param:{ids:'[' + did + ']'}}
		FF.fn.ajax(cfg, false, function(data) {
			if(data['success']) {
				me.html('可用').removeClass('btn btn-sm btn-danger status_close').addClass('btn btn-sm btn-default status_show')
				$(".status_close").off('click').on('click', close_me)
				$(".status_show").off('click').on('click', show_me)
			}
		})
	}

	function show_me() {
		var me = $(this)
		var did = me.attr('data')
		var cfg = {mod:'admin',act:'show',param:{ids:'[' + did + ']'}}
		FF.fn.ajax(cfg, false, function(data) {
			if(data['success']) {
				me.html('禁用').removeClass('btn btn-sm btn-default status_show').addClass('btn btn-sm btn-danger status_close')
				$(".status_close").off('click').on('click', close_me)
				$(".status_show").off('click').on('click', show_me)
			}
		})
	}
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}