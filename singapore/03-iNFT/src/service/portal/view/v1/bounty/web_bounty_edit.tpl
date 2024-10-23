{%include file="{%DEF_VERSION%}/common/web_header.tpl" title=foo%}
{%include file="{%DEF_VERSION%}/common/web_aside.tpl" title=foo%}
<section>
	<div class="content-wrapper">
		<ul class="nav navbar-nav controller">
			<li>
				<a class="hidden-xs" href="#" data-trigger-resize="" data-toggle-state="aside-collapsed"><em
						class="fa fa-navicon"></em></a>
				<a class="visible-xs sidebar-toggle" href="#" data-toggle-state="aside-toggled"
					data-no-persist="true"><em class="fa fa-navicon"></em></a>
			</li>
		</ul>

		<h3>Bounty Details
			<small>Bounty details and operation.</small>
		</h3>

		<ol class="breadcrumb">
			<li>
				<a href="?mod=bounty&act=list">Bounty List</a>
			</li>
			<li class="active">Edit {%$F.data.alink%} </li>
		</ol>
		<div class="row">
			<div class="col-lg-12" style="margin-bottom: 15px;">
				<div class="row" id="con_load">
					<div class="col-lg-2">
						<input class="form-control" id="account_json" type="file" />
					</div>
					<div class="col-lg-6">
						<input class="form-control" id="account_password" type="password"
							placeholder="Password of approver {%BOUNTY_APPROVER%}" />
					</div>
					<div class="col-lg-1 text-right">
						<button class="btn btn-md btn-primary" id="account_load">Load</button>
					</div>
					<div class="col-lg-4" id="account_info">

					</div>
				</div>
				<div class="row" id="con_drop" style="display: none;">
					<div class="col-lg-7">
						Account <strong><span class="text-danger">{%BOUNTY_APPROVER%}</span></strong> is active now, you
						can do approve.
					</div>
					<div class="col-lg-2 text-right">
						<button class="btn btn-md btn-primary" id="account_drop">Drop Account</button>
					</div>
				</div>
			</div>
			<div class="col-lg-9">
				<div class="row">
					<div class="col-lg-12">
						<div class="panel panel-default">
							<div class="panel-heading">

								<div class="row">
									<div class="col-lg-3">
										<a class="pull-left" href="#" data-tool="panel-collapse" data-toggle="tooltip"
											title="">
											<h5>Bounty Distribition</h5>
										</a>
									</div>
									<div class="col-lg-9 text-right">
										<h5 id="info_distribute"></h5>
									</div>
								</div>

							</div>
							<div class="panel-wrapper collapse in">
								<div class="panel-body">
									<div class="row">
										{%if count($F.paying) eq 0%}
										<div class="col-lg-12">
											No apply to distribute.
										</div>
										{%else%}
										<div class="col-lg-4">
											<select class="form-control" id="payment_record">
												{%foreach from=$F.paying key=k item=v %}
												<option value="{%$v.index%}">[{%$k%}]-{%$v.record%}
												<option>
													{%/foreach%}
											</select>
										</div>
										<div class="col-lg-6">
											<input class="form-control" id="payment_hash" type="text"
												placeholder="Transaction hash here.">
										</div>
										<div class="col-lg-2">
											<button class="btn btn-md btn-primary" id="distribute_submit">Submit
												Payment</button>
										</div>
										{%/if%}
									</div>
								</div>
							</div>
							<div class="panel-footer">
								<div class="row">
									<div class="col-lg-6">
										Please select the account JSON file before any operation.
									</div>
									<div class="col-lg-6 text-right" id="distribute_info">

									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="col-lg-12">
						<div class="panel panel-default">
							<div class="panel-heading">
								<div class="row">
									<div class="col-lg-3">
										<a class="pull-left" href="#" data-tool="panel-collapse" data-toggle="tooltip"
											title="">
											<h5>Bounty Apply</h5>
										</a>
									</div>
									<div class="col-lg-9 text-right">
										<h5 id="info">Linking...</h5>
									</div>
								</div>
							</div>
							<div class="panel-wrapper collapse in">
								<div class="panel-body">
									<table class="table table-hover">
										<tr>
											<th></th>
											<th>iNFT</th>
											<th>Progress</th>
											<th>Created</th>
											<th>Status</th>
										</tr>

										{%if count($F.data.apply) neq 0%} {%foreach from=$F.data.apply key=k item=v %}

										<tr>
											<td></td>
											<td>
												<a href="#" target="_blank">{%$v.link%}</a>
											</td>
											<td>
												Apply: <a href="#" target="_blank">{%$v.record%}</a> <br />
												Judge: {%if !empty($v.judge)%}<a href="#"
													target="_blank">{%$v.judge%}</a>{%/if%} <br />
												Distribute: {%if !empty($v.distribute)%}<a href="#"
													target="_blank">{%$v.distribute%}</a>{%/if%} <br />
											</td>
											<td>{%date("Ymd",$v.stamp)%}</td>
											<td>
												{%if $v.status eq BOUNTY_APPLY_SUBMITTED%}
												<button class="btn btn-sm btn-primary apply_accept"
													data="{%$k%}">Accept</button>
												<button class="btn btn-sm btn-danger apply_refuse"
													data="{%$k%}">Refuse</button>
												{%else%}
												{%if $v.status eq BOUNTY_APPLY_FAILED%}
												<span class="text-dark">{%$F.status[$v.status]%}</span>
												{%else%}
												<span class="text-danger">{%$F.status[$v.status]%}</span>
												{%/if%}
												{%/if%}
											</td>
										</tr>

										{%/foreach%} {%/if%}
									</table>
								</div>
							</div>
							<div class="panel-footer">
								<div class="row">
									<div class="col-lg-6">
										Please select the account JSON file before any operation.
									</div>
									<div class="col-lg-6 text-right" id="approve_info">

									</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>
			<div class="col-lg-3">
				<div class="row">
					<div class="col-lg-12">
						<div class="panel panel-default">
							<div class="panel-heading">
								<div class="row">
									<div class="col-lg-6">
										<a class="pull-left" href="#" data-tool="panel-collapse" data-toggle="tooltip"
											title="">
											<h5>Bounty Information</h5>
										</a>
									</div>
									<div class="col-lg-6 text-right"></div>
								</div>
							</div>
							<div class="panel-wrapper collapse in">
								<div class="panel-body" id="bounty_info">

								</div>
							</div>
							<div class="panel-footer">
								{%$F.data.alink%}
							</div>
						</div>
					</div>
					<div class="col-lg-12">
						<div class="panel panel-default">
							<div class="panel-heading">
								<div class="row">
									<div class="col-lg-6">
										<a class="pull-left" href="#" data-tool="panel-collapse" data-toggle="tooltip"
											title="">
											<h5>Bounty Payment</h5>
										</a>
									</div>
									<div class="col-lg-6 text-right">
									</div>
								</div>
							</div>
							<div class="panel-wrapper collapse in">
								<div class="panel-body" id="payment_info">

								</div>
							</div>
							<div class="panel-footer">
								{%$F.data.payment%}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
<script type="text/javascript">
	//anchor network functions
	const node="{%ANCHOR_NETWORK_NODE%}";
	let wsAPI = null;
	let pair = null;
	const Decoder = Easy.easyRun;
	const startAPI = {
		common: {
			"latest": AnchorJS.latest,
			"target": AnchorJS.target,
			"history": AnchorJS.history,
			"owner": AnchorJS.owner,
			"subcribe": AnchorJS.subcribe,
			"block": AnchorJS.block,
		}
	};
	const Chain = {
		init: function(ck) {
			if (wsAPI !== null) return ck && ck(wsAPI);
			const {ApiPromise,WsProvider}=window.Polkadot;
			ApiPromise.create({ provider: new WsProvider(node) }).then((api) => {
				AnchorJS.set(api);
				return ck && ck(wsAPI);
			});
		},
		decode: function(json, password, ck) {
			try {
				const {Keyring}=window.Polkadot;
				const keyring = new Keyring({ type: "sr25519" });
				const signer = keyring.createFromJson(json);
				signer.decodePkcs8(password);
				return ck && ck(signer);
			} catch (error) {
				console.log(error);
				return ck && ck({error:"Invalid password."});
			}
		},
		load: function(fa, password, ck) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const sign = JSON.parse(e.target.result);
					Chain.decode(sign, password, ck);
				} catch (error) {
					console.log(error);
					return ck && ck({error:"Invalid account JSON file."});
				}
			};
			reader.readAsText(fa);
		},
	};
</script>

<script type="text/javascript">
	//bounty information
	
</script>

<script type="text/javascript">
	const bounty={%json_encode($F.data)%}
	const self = {
		char: (n, pre) => {
			n = n || 7;
			pre = pre || "";
			for (let i = 0; i < n; i++)
				pre += String.fromCharCode(self.rand(97, 122));
			return pre;
		},
		rand: (m, n) => {
			return Math.round(Math.random() * (m - n) + n);
		},
		approveToChain: (bounty, apply, inft, bonus, result, ck) => {
			const name = self.char(12, "judge_");
			const raw = {
				bounty: bounty,
				apply: apply,
				inft: inft,
				bonus: bonus, //bonus index
				status: "judge",
				result: result, //apply result
			}
			const protocol = {
				fmt: "json",
				type: "data",
				app: "inft",
				ref: bounty,
			}
			//console.log(name,raw,protocol);
			AnchorJS.write(pair, name, raw, protocol, (res) => {
				console.log(res);
				if (res.step === "Finalized") {
					AnchorJS.search(name, (adata) => {
						const dt = {
							alink: `anchor://${name}/${adata.block}`,
						}
						return ck && ck(dt);
					});
				}
			});
		},
		distributeToChain: (bounty, apply, inft, hash, ck) => {
			const name = self.char(12, "distribute_");
			const raw = {
				bounty: bounty,
				apply: apply,
				inft: inft,
				payment: hash,
				status: "distribute"
			}
			const protocol = {
				fmt: "json",
				type: "data",
				app: "inft",
				ref: bounty,
			}
			AnchorJS.write(pair, name, raw, protocol, (res) => {
				//console.log(res);
				if (res.step === "Finalized") {
					AnchorJS.search(name, (adata) => {
						const dt = {
							alink: `anchor://${name}/${adata.block}`,
						}
						return ck && ck(dt);
					});
				}
			});
		},
		enalbeOperation: () => {
			$(".apply_accept").prop("disabled", false);
			$(".apply_refuse").prop("disabled", false);
			$("#distribute_submit").prop("disabled", false);
			$("#payment_record").prop("disabled", false);
			$("#payment_hash").prop("disabled", false);
		},
		disableOperation: () => {
			$(".apply_accept").prop("disabled", true);
			$(".apply_refuse").prop("disabled", true);
			$("#distribute_submit").prop("disabled", true);
			$("#payment_record").prop("disabled", true);
			$("#payment_hash").prop("disabled", true);
		},
		fresh: () => {
			location.reload();
		},
		fillBountyInfo: (bounty) => {
			//console.log(bounty);
			const raw=JSON.parse(bounty.raw);
			console.log(raw);
			$("#bounty_info").html(`
				<div class="row">
					<div class="col-lg-3">Title</div>
					<div class="col-lg-9">${raw.title}</div>
					<div class="col-lg-12">${raw.publisher}</div>
					<div class="col-lg-12">Start from ${raw.period.start} to ${raw.period.end}</div>
				</div>
			`);
		},
		fillPaymentInfo: (payment) => {
			const raw=JSON.parse(payment.raw);
			console.log(raw);
			$("#payment_info").html(`
				<div class="row">
					<div class="col-lg-3">Amount</div>
					<div class="col-lg-9">${raw.amount}</div>
					<div class="col-lg-12">${raw.block}</div>
				</div>
			`);
		},
		autoRun: () => {
			self.disableOperation();
			Chain.init((API) => {
				$("#info").html(`Node linked: ${node}`);
				Decoder("{%$F.data.alink%}",startAPI,(bt)=>{
					if (bt.error.length !== 0) return false;
					const key=`${bt.location[0]}_${bt.location[1]}`;
					self.fillBountyInfo(bt.data[key]);
				});

				console.log("{%$F.data.payment%}");

				Decoder("{%$F.data.payment%}",startAPI,(res)=>{
					if (res.error.length !== 0) return false;
					const key=`${res.location[0]}_${res.location[1]}`;
					self.fillPaymentInfo(res.data[key]);
				});
			});
		},
		decodeRecord: (alink, ck) => {
			Decoder(alink, startAPI, (ank) => {
				if (ank.location) {
					const key=`${ank.location[0]}_${ank.location[1]}`;
					const dt = ank.data[key];
					const raw = JSON.parse(dt.raw);
					const bonus_index = raw.bounty.bonus;
					return ck && ck(bonus_index);
				} else {
					return ck && ck(false);
				}
			});
		},
	}

	$(function() {
		self.autoRun(); //run when the page is ready
	});

	$(".apply_accept").off("click").on("click", function() {
		const index = parseInt($(this).attr("data"));
		const ps = bounty.apply,
			bonus = bounty.detail;
		const current = ps[index];
		self.decodeRecord(current.record, (bonus_index) => {
			//console.log(bonus_index);
			self.approveToChain(bounty.alink, current.record, current.link, bonus_index, true, (res) => {

				//2.update the status on portal
				const id = parseInt(bounty.id);
				const param={id:id,index:index,record:res.alink};
				const cfg = {mod:'bounty',act:'accept',param:param}
				FF.fn.ajax(cfg, false, function(dt) {
					if (dt.success) return self.fresh();
				});
			});
		});
	});

	$(".apply_refuse").off("click").on("click", function() {
		const index = parseInt($(this).attr("data"));
		const ps = bounty.apply,
			bonus = bounty.detail;
		const current = ps[index];

		self.decodeRecord(current.record, (bonus_index) => {
			//1.set anchor to storage the status
			self.approveToChain(bounty.alink, current.record, current.link, bonus_index, false, (res) => {

				//2.update the status on portal
				const id = parseInt(bounty.id);
				const param={id:id,index:index,record:res.alink};
				const cfg = {mod:'bounty',act:'refuse',param:param}
				FF.fn.ajax(cfg, false, function(dt) {
					if (dt.success) return self.fresh();
				})
			});
		})

	});

	let file = null;
	$("#account_json").off("change").on("change", function(ev) {
		file = ev.target.files[0];
	});

	const approver="{%BOUNTY_APPROVER%}";
	$("#account_load").off("click").on("click", function() {
		$("#account_info").html("");
		const me = $(this);
		me.prop("disabled", true);
		const pass = $("#account_password").val();
		$("#account_password").val(""); //clean the password

		if (file === null) {
			me.prop("disabled", false);
			return $("#account_info").html("Select account JSON file first.");
		}
		if (!pass) {
			me.prop("disabled", false);
			return $("#account_info").html("Invalid password.");
		}

		Chain.load(file, pass, (signer) => {
			me.prop("disabled", false);
			if (signer.error) return $("#account_info").html(signer.error);
			if (signer.address !== approver) return $("#account_info").html("Unexcept approver");

			pair = signer;
			self.enalbeOperation();
			$("#con_load").hide();
			$("#con_drop").show();

			file = null; //clean the json cache
			$("#account_json").val("");
		});
	});

	$("#account_drop").off("click").on("click", function() {
		pair = null;
		$("#con_load").show();
		$("#con_drop").hide();
		self.disableOperation();
	});

	$("#distribute_submit").off("click").on("click", function() {
		const index = parseInt($("#payment_record").val());
		const hash = $("#payment_hash").val();
		const me = $(this);
		me.prop("disabled", true);

		if (isNaN(index)) {
			me.prop("disabled", false);
			return $("#distribute_info").html("Please select a approved apply to pay");
		}


		console.log(bounty);
		const aply = bounty.apply[index];
		self.distributeToChain(bounty.alink, aply.record, aply.link, hash, (res) => {

			//2.update the status on portal
			const id = parseInt(bounty.id);
			const param={id:id,index:index,pay:res.alink};
			const cfg = {mod:'bounty',act:'distribute',param:param}
			FF.fn.ajax(cfg, false, function(dt) {
				if (dt.success) return self.fresh();
			})
		});

	});
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}