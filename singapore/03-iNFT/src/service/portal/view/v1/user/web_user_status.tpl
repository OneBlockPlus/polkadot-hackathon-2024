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
		<h3>用户状态
			<small>用户的财富信息等</small>
		</h3>
		<ol class="breadcrumb">
			<li>
				<a href="?mod=user&act=list">用户列表</a>
			</li>
			<li class="active">用户[ <a href="?mod=user&act=status&uuid={%$F.uuid%}">{%$F.uuid%}</a> ]详细数据</li>
		</ol>
		<div class="row">
			<div class="col-lg-12 col-md-12">
			</div>
		</div>
	</div>
</section>

<script type="text/javascript">
	
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}