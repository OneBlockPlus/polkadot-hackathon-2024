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
		
		<h3>iNFT Cache Overview
			<small>Template for iNFT market</small>
		</h3>
		<div class="row">
			<div class="col-lg-8">
				Status key name: <strong>{%INFT_STATUS%}</strong>
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Key</th>
							<th>Value</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>block_stamp</td>
							<td>{%$F.overview.block_stamp%} </td>
							<td>Robot start at block </td>
						</tr>

						<tr>
							<td>block_subcribe</td>
							<td>{%$F.overview.block_subcribe%} </td>
							<td>Robot subcribing block </td>
						</tr>

						<tr>
							<td>done_left</td>
							<td>{%$F.overview.done_left%} </td>
							<td>Cache left block </td>
						</tr>

						<tr>
							<td>done_right</td>
							<td>{%$F.overview.done_right%} </td>
							<td>Cache right block k </td>
						</tr>

						<tr>
							<td>step</td>
							<td>{%$F.overview.step%} </td>
							<td>Cache blocks per step </td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="col-lg-4">
				<h4>Caching Robot Status</h4>
				<p>The status of the caching status is used to monitor the caching status.</p>
			</div>
		</div>
	</div>
</section>

<script type="text/javascript">

</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}