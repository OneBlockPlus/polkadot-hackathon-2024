{%include file="{%DEF_VERSION%}/common/web_header.tpl" title=foo%}
{%include file="{%DEF_VERSION%}/common/web_aside.tpl" title=foo%}

<script src="{%$F.cdn%}/lib/parsleyjs/dist/parsley.min.js"></script>
<section>
	<div class="content-wrapper">
		<ul class="nav navbar-nav controller">
			<li>
				<a class="hidden-xs" href="#" data-trigger-resize="" data-toggle-state="aside-collapsed"><em class="fa fa-navicon"></em></a>
				<a class="visible-xs sidebar-toggle" href="#" data-toggle-state="aside-toggled" data-no-persist="true"><em class="fa fa-navicon"></em></a>
			</li>
		</ul>
		<h3>用户管理
			<small>用户的基本信息,运动轨迹等的管理</small>
		</h3>
		<ol class="breadcrumb">
			<li>
				<a href="?mod=user&act=list">用户列表</a>
			</li>
			<li class="active">用户[ <a href="?mod=user&act=view&id={%$F.uuid%}">{%$F.uuid%}</a> ]详细数据</li>
		</ol>
		<div class="row">
			<div class="col-lg-8 col-md-8">

				<div class="panel panel-default">

					<div class="panel-heading">
						添加模型资源
						<a class="pull-right" href="#" data-tool="panel-collapse" data-toggle="tooltip" title="点击收起操作面板">
							<em class="fa fa-minus"></em>
						</a>
					</div>
					<div class="panel-wrapper collapse in">
						<div class="panel-body">
							<form action="?mod=module&act=new" method="post" enctype="multipart/form-data" data-parsley-validate="" novalidate="">
								<div class="form-group">
									<label class="control-label">选择绘图程序版本*</label>
									<select class="form-control" name="auth_dwg" required>
										<option value="0">--选择资源类型--</option>
										{%foreach from=$F.published key=k item=v %}
										<option value="{%$v.vid%}" {%if $v.vid eq $F.dwg%}selected="selected"{%/if%}>{%$v.version%}.{%$v.sub%}版本:{%$v.intro%}</option>
										{%/foreach%}
									</select>
								</div>
								<div class="form-group">
									<label class="control-label">授权域名(不要输入http://或者https://前缀)</label>
									<input class="form-control" type="text" name="auth_domain" id="auth_domain" value="">
								</div>
								<div class="form-group">
									<label class="control-label">授权开始日期*</label>
									<input class="form-control"  type="date" name="auth_start" id="auth_start" value=""/>
								</div>
								<div class="form-group">
									<label class="control-label">授权结束日期*</label>
									<input class="form-control"  type="date" name="auth_end" id="auth_end" value=""/>
								</div>
								<div class="form-group text-right">
									<button class="btn btn-primary" type="submit">增加绘图程序授权</button>
								</div>
							</form>
						</div>
					</div>
					<div class="panel-footer">
						
					</div>
				</div>
			</div>
			<div class="col-lg-4  col-md-4">
				<p>
					<code>资源管理说明:</code><br>
					1.只能对已经发布的绘图版本进行授权;<br>
					2.未设置授权结束日期的为永久授权;
				</p>
				{%$F.dump%}
			</div>
		</div>
	</div>
</section>

<script type="text/javascript">
	
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}