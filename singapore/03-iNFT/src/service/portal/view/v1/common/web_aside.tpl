
<aside class="aside">
	<div class="aside-inner">
		<nav class="sidebar" data-sidebar-anyclick-close="">
			<ul class="nav">
				<li class=" ">
					<a href="{%BASE_DOMAIN%}" title=""><em class="icon-info"></em><span>{%SYSTEM_NAME%} [ {%DEF_VERSION%} ]</span></a>
				</li>
				<li>
					<a id="user-block-toggle" href="#user-block" data-toggle="collapse">
					<em class="icon-user"></em><span>Current Administor</span></a>
				</li>
				{%include file="{%DEF_VERSION%}/common/web_user.tpl" title=foo%}
                <li class=" ">
					<a href="#trend" title="Widgets" data-toggle="collapse">
						<!--<div class="pull-right label label-success">30</div>-->
						<em class="icon-graph"></em><span>Operation</span>
					</a>
					<ul class="nav sidebar-subnav collapse" id="trend">
						<li class="{%if $F.request.mod eq 'trend' && $F.request.act eq 'today'%}active{%/if%}">
							<a href="?mod=system&act=overview" title=""><span>Market Overview</span></a>
                        </li>
                        <li class="{%if $F.request.mod eq 'hack' && $F.request.act eq 'list'%}active{%/if%}">
							<a href="?mod=hack&act=list" title=""><span>Hack Logs</span></a>
                        </li>
                        <li class="{%if $F.request.mod eq 'log' && $F.request.act eq 'list'%}active{%/if%}">
							<a href="?mod=log&act=list" title=""><span>User Action</span></a>
                        </li>
                     </ul>
				</li>

				<li class=" ">
					<a href="#inft" title="" data-toggle="collapse">
						<em class="icon-magic-wand"></em><span>iNFT</span>
					</a>
					<ul class="nav sidebar-subnav collapse" id="inft">
					<li class="{%if $F.request.mod eq 'inft' && $F.request.act eq 'overview'%}active{%/if%}">
							<a href="?mod=inft&act=overview" title=""><span>Overview</span></a>
                        </li>
                        <li class="{%if $F.request.mod eq 'inft' && $F.request.act eq 'block'%}active{%/if%}">
							<a href="?mod=inft&act=block" title=""><span>Block</span></a>
                        </li>
                        <li class="{%if $F.request.mod eq 'inft' && $F.request.act eq 'account'%}active{%/if%}">
							<a href="?mod=inft&act=account" title=""><span>Account</span></a>
                        </li>
						<li class="{%if $F.request.mod eq 'inft' && $F.request.act eq 'history'%}active{%/if%}">
							<a href="?mod=inft&act=history" title=""><span>History</span></a>
                        </li>
						<li class="{%if $F.request.mod eq 'inft' && $F.request.act eq 'template'%}active{%/if%}">
							<a href="?mod=inft&act=template" title=""><span>Template</span></a>
                        </li>
                     </ul>
				</li>

				<li class=" ">
					<a href="#template" title="" data-toggle="collapse">
						<em class="icon-magic-wand"></em><span>Template</span>
					</a>
					<ul class="nav sidebar-subnav collapse" id="template">
                        <li class="{%if $F.request.mod eq 'template' && $F.request.act eq 'list'%}active{%/if%}">
							<a href="?mod=template&act=list" title=""><span>Template List</span></a>
                        </li>
                        {%if $F.request.mod eq 'template' && $F.request.act eq edit%}
                        <li class="active">
                           <a href="?mod=template&act=edit&id={%$F.template.id%}" title=""><span>Template Editing</span></a>
                        </li>
                        {%/if%}
                     </ul>
				</li>

				<li class=" ">
					<a href="#bounty" title="" data-toggle="collapse">
						<em class="icon-target"></em><span>Bounty</span>
					</a>
					<ul class="nav sidebar-subnav collapse" id="bounty">
                        <li class="{%if $F.request.mod eq 'bounty' && $F.request.act eq 'list'%}active{%/if%}">
							<a href="?mod=bounty&act=list" title=""><span>Bounty List</span></a>
                        </li>
                        {%if $F.request.mod eq 'bounty' && $F.request.act eq edit%}
                        <li class="active">
                           <a href="?mod=bounty&act=edit&id={%$F.bounty.id%}" title=""><span>Bounty Edit</span></a>
                        </li>
                        {%/if%}
                     </ul>
				</li>

				<li class=" ">
					<a href="#user" title="" data-toggle="collapse">
						<em class="icon-people"></em><span>User Management</span>
					</a>
					<ul class="nav sidebar-subnav collapse" id="user">
                        <li class="{%if $F.request.mod eq 'user' && $F.request.act eq 'list'%}active{%/if%}">
							<a href="?mod=user&act=list" title=""><span>User List</span></a>
                        </li>
                        {%if $F.request.mod eq 'user' && $F.request.act eq edit%}
                        <li class="active">
                           <a href="?mod=user&act=edit&id={%$F.user.uid%}" title=""><span>编辑用户信息</span></a>
                        </li>
                        {%/if%}
                        {%if $F.request.mod eq 'user' && $F.request.act eq 'status'%}
                        <li class="active">
                           <a href="?mod=user&act=status&uuid={%$F.user.uid%}" title=""><span>User Information</span></a>
                        </li>
                        {%/if%}
                     </ul>
				</li>     

				<li class=" ">
					<a href="#admin" title="" data-toggle="collapse">
						<em class="icon-lock"></em><span>Administrators</span>
					</a>
					<ul class="nav sidebar-subnav collapse" id="admin">
                        <li class="{%if $F.request.mod eq 'admin' && $F.request.act eq 'list'%}active{%/if%}">
							<a href="?mod=admin&act=list" title=""><span>Administrator List</span></a>
                        </li>
                        {%if $F.request.mod eq 'admin' && $F.request.act eq edit%}
                        <li class="active">
                           <a href="?mod=admin&act=edit&id={%$F.admin.id%}" title=""><span>Administrator Editing</span></a>
                        </li>
                        {%/if%}
                     </ul>
				</li>
			</ul>
		</nav>
	</div>
</aside> 
