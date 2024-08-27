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
			<small>编辑用户信息，编辑处理可以处理的部分</small>
		</h3>
		
		<ol class="breadcrumb">
			<li><a href="?mod=user&act=list">用户列表</a></li>
			<li class="active">管理用户</li>
        </ol>
		<div class="row">
			<div class="col-lg-12">
				<div class="" role="tabpanel">
					<ul class="nav nav-tabs" role="tablist">
						<li role="presentation" id="tab_0" class="active"><a href="#con_0" aria-controls="home" role="tab" data-toggle="tab">基本信息</a></li>
						<li role="presentation" id="tab_1"><a href="#con_1" aria-controls="home" role="tab" data-toggle="tab">资产状况</a></li>
						<li role="presentation" id="tab_2"><a href="#con_2" aria-controls="home" role="tab" data-toggle="tab">行为分析</a></li>
						<li role="presentation" id="tab_3"><a href="#con_3" aria-controls="home" role="tab" data-toggle="tab">营销工具</a></li>
					</ul>
					<div class="tab-content" style="background: #FFFFFF;">
						<div class="tab-pane active" id="con_0" role="tabpanel">
							[用户基本信息]
						</div>
						<div class="tab-pane" id="con_1" role="tabpanel">
							[土地所有，土地租赁，材质数量，贴图数量及列表]
						</div>
						<div class="tab-pane" id="con_2" role="tabpanel">
							[活动范围及路径，创建行为]
						</div>
						<div class="tab-pane" id="con_3" role="tabpanel">
							[活动推送，发短信]
						</div>
					</div>
				</div>
			</div>	
		</div>
	</div>
</section>

<script type="text/javascript">


</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}