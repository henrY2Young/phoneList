//设置根字体大小
$("html").css('font-size', $(window).width() / 320 * 10);
$(window).on('resize', function() {
	$("html").css('font-size', $(window).width() / 320 * 10);
});
/*按钮点击效果*/
$(document).on('touchstart', '.touch', function() {
	var $self = $(this)
	$self.addClass('touching');
	if(window._touchend) {
		window._touchend();
	}
	window._touchend = function() {
		$self.off('touchend touchmove touchcancel', _touchend);
		$self.removeClass('touching');
		window._touchend = null;
	}
	$self.on('touchend touchmove touchcancel', _touchend);

});
/*打开新页面按钮*/
$(document).on('tap', '[data-open]', function() {
	var pageUrl = $(this).data('open');
	if(pageUrl) {
		ui.page.open(pageUrl);
	}
});
/*在系统浏览器打开新连接*/
$(document).on('tap', '[data-browse]', function() {
	plus.runtime.openURL($(this).data('browse'));
});
//在app内置浏览器打开链接
$(document).on('tap', '[data-appbrowse]', function() {
	var pageUrl = $(this).data('appbrowse');
	if(pageUrl) {
		browse2.openURL(pageUrl);
	}
});
//复制文字
$(document).on('tap', '[data-copy]', function() {
	var text = $(this).data('copy') + '';
	if(text.length == 0) text = $(this).text() + '';
	copyText(text);
});
//下载照片
$(document).on('tap', '[data-save]', function() {
	var files = $(this).data('save') || $(this).data('down');
	if(!files) {
		return
	}
	downPicture(files);
});
//分享单图（自动切分，可选文案）到朋友圈
$(document).on('tap', '[data-shareToTimeLine-pic]', function() {
	var pic = $(this).attr('data-shareToTimeLine-pic');
	var text = $(this).attr('data-shareToTimeLine-text');
	window.wxTimeLine && wxTimeLine.share(pic, text);
});

//修改
if(window.config && 'debug' in config && !config.debug) {
	(function() {
		var console = window.console;
		for(var i in console) {
			var method = console[i];
			if(typeof method === 'function') {
				console[i] = function() {
					//
				}
			}
		}
	})();
}

Object.defineProperty(window, "userInfo", { //定义用户信息读取
	get: function() {
		if(localStorage.userInfo && localStorage.userInfo.length) {
			try {
				return JSON.parse(localStorage.userInfo);
			} catch(e) {
				return {};
			}
		} else {
			return {};
		}

	},
	set: function(data) {
		var oldVal = localStorage.userInfo || '';
		var newVal;
		if(data && typeof data === 'object' && 'sessionID' in data) {
			localStorage.userInfo = newVal = JSON.stringify(data);
			mui.plusReady(function() {
				plus.storage.setItem('myInviteCode', data.myInviteCode);
				plus.storage.setItem('sessionID', data.sessionID);

				if(data.wxOpenId && data.wxOpenId.length) {
					plus.storage.setItem('openid', data.wxOpenId);
				}
				if(data.mobile && data.mobile.length) {
					plus.storage.setItem('mobile', data.mobile);
				}
			});
			//触发app的userInfo的login事件
			if(!oldVal.length) {
				app.userInfo.fireEvent("login");
			}
		} else {
			localStorage.userInfo = newVal = '';
			mui.plusReady(function() {
				plus.storage.removeItem('myInviteCode');
				plus.storage.removeItem('sessionID');
				plus.storage.removeItem('openid');
				plus.storage.removeItem('mobile');
			});
			//触发app的userInfo的logout事件
			if(oldVal.length) {
				app.userInfo.fireEvent("logout");
			}
		}
		//触发所有页面的app的userInfo的change事件
		if(oldVal !== newVal) {
			app.userInfo.fireEvent("change");
		}

	},
	configurable: true
});
//定义设备信息读取
Object.defineProperty(window, "clientInfo", {
	get: function() {
		var clientInfo = {
			system: ui.isAndroid() ? 'Android' : 'iOS',
		};
		var clientInfo_ = localStorage.clientInfo;
		if(clientInfo_ && clientInfo_.length) {
			try {
				$.extend(clientInfo, JSON.parse(clientInfo_));
			} catch(e) {
				throw new Error(e);
			}
		}
		if(!clientInfo.pushID) {
			if(window.plus && plus.push && plus.push.getClientInfo()) {
				clientInfo.pushID = plus.push.getClientInfo().clientid;
			} else {
				clientInfo.pushID = '';
			}
		}
		return clientInfo;
	},
	set: function(data) {
		localStorage.clientInfo = JSON.stringify(data);
		mui.plusReady(function() {
			plus.storage.setItem('clientInfo', JSON.stringify(data));
		});
	}
});

//定义设置信息读取
Object.defineProperty(window, "setting", {
	get: function() {
		var setting = {
			mySwitch1: false,
			mySwitch2: false,
			mySwitch3: true,
			mySwitch4: true, //自动使用分享辅助
		};
		var setting_l = localStorage.setting;
		if(setting_l && setting_l.length) {
			try {
				$.extend(setting, JSON.parse(setting_l));
			} catch(e) {
				throw new Error(e);
			}
		}
		return setting;
	},
	set: function(data) {
		localStorage.setting = JSON.stringify(data);
	}
});

//版本对比：传入两个版本号（字符串），返回0为相等，1为第1个参数版本高，-1为第1个参数版本低
function compareVersion(v1, v2) {
	var v1_ = (v1 || '0').split('.');
	var v2_ = (v2 || '0').split('.');
	for(var i = 0; i < (v1_.length > v2_.length ? v1_.length : v2_.length); i++) {
		var v1__ = v1_[i] || 0;
		var v2__ = v2_[i] || 0;
		if(v1__ < v2__) {
			return -1;
		} else if(v1__ > v2__) {
			return 1;
		}
	}
	return 0;
}

function downPicture(files) {
	plus.downloader.createDownload(files, {
		method: "GET",
		filename: "_doc/case/",
		timeout: 15,
	}, function(task, status) {
		if(status === 200) {
			plus.gallery.save(task.filename, function(d) {
				mui.toast('图片已保存在相册中');
				del_file(task.filename);
			}, function(e) {
				mui.toast('图片保存到相册中失败！');
				console.error(e);
			});
		} else {
			console.log('down-error');
		}
	}).start();
}

(function() {
	var app = {
		api: function(api, data, success, wrong, error, always, alwaysAfter) { //api请求的封装
			/*
			api:对应的api名称
			data：数据对象
			success：成功的回调函数
			wrong：code不为0的回调
			error：失败的回调函数
			always:总是执行的回调
			alwaysAfter：always回调在其他回调之后
			*/
			var url;
			var query = {};
			api = config[api];
			query.module = api.replace(/\/\w*/, '');
			query.function = api.replace(/\w*\//, '');
			$.extend(query, data);
			var client = {
				sessionID: (userInfo && userInfo.sessionID) ? userInfo.sessionID : null,
			};
			$.extend(client, clientInfo);

			url = (config.debug ? config.testHost : config.host) + config.server + '?query=' + encodeURIComponent(JSON.stringify(query)) + '&client=' + encodeURIComponent(JSON.stringify(client));
			console.log(url);
			return $.ajax({
				type: "post",
				url: url,
				timeout: 10000,
				crossDomain: true,
				data: {},
				success: function(data) {
					if(typeof always === 'function' && !alwaysAfter) {
						always(data);
					}
					if(!('code' in data)) {
						postServerError({
							req_url: url,
							res_status: data.code,
							res_message: data.msg || data,
						});
					}
					if(data.code.toString().match(/[a-zA-Z]/)) {
						postServerError({
							req_url: url,
							res_status: data.code,
							res_message: data.msg || data,
						});
					}
					if('code' in data && data.code == 0) {
						if(typeof success === 'function') {
							success(data);
						} else {
							console.log(data);
							waiting.hide();
						}
					} else {
						if(typeof wrong === 'function') {
							wrong(data);
						} else {
							mui.toast(data.msg);
							waiting.hide();
						}
						if(data.code == 1007) {
							userInfo = null;
						}
					}
					if(data.sessionId && data.sessionId.length && 'sessionID' in userInfo && data.sessionId !== userInfo.sessionID) {
						userInfo = $.extend({}, userInfo, {
							sessionID: data.sessionId
						});
					}
					if(typeof always === 'function' && alwaysAfter) {
						always(data);
					}
				},
				error: function(e, textStatus, errorThrown) {
					if('abort' === textStatus) {
						return;
					}
					postServerError({
						req_url: url,
						res_status: textStatus,
						res_message: errorThrown,
					});
					if(typeof always === 'function' && !alwaysAfter) {
						always(data);
					}
					if(typeof error === 'function') {
						error(e);
					} else {
						console.error(e);
						mui.toast('网络错误');
						waiting.hide();
					}
					if(typeof always === 'function' && alwaysAfter) {
						always(data);
					}
				}
			});
		},
		errorLog: { //错误日志-数据格式为数组，倒序
			init: function() { //初始化
				var $this = this;
				window.onerror = function(message, file, line) { //获取错误并记录
					if(typeof message !== 'string') {
						try {
							message = JSON.stringify(message)
						} catch(e) {
							console.error(e);
							message = message + ''
						}
					}

					function getName(file) {
						var fileName = file.match(/\/([A-Za-z-_]+)\.[a-z]+(?:$|#|\?)/);
						fileName = (fileName && fileName.length === 2) ? fileName[1] : 'null';
						return fileName;
					}
					//^版本号@页面>js文件名:行号
					var err = message + '^' + clientInfo.version + '@' + getName(location.href) + '>' + getName(file) + ':' + line + ';';
					mui.plusReady(function() {
						plus.statistic.eventTrig('jsError', err); //触发友盟统计-js错误
					});
					$this.set(err);
				};
			},
			set: function(msg) {
				if(typeof msg !== 'string') {
					msg = JSON.stringify(msg);
				}
				mui.plusReady(function() {
					var log = plus.storage.getItem('errorLog') || '';
					plus.storage.setItem('errorLog', msg + log);
				});
			},
			get: function() {
				var errorLog = window.plus && plus.storage.getItem('errorLog');
				return errorLog;
			},
			clear: function() {
				mui.plusReady(function() {
					plus.storage.setItem('errorLog', '');
				});
			}
		},
		wrong: function(name, message) { //错误记录，方法名字，消息
			var $this = this;
			if(typeof message !== 'string') {
				try {
					message = JSON.stringify(message)
				} catch(e) {
					console.error(e);
					message = message + ''
				}
			}
			//^版本号@方法名
			var err = message + '^' + clientInfo.version + '@' + name + ';';
			mui.plusReady(function() {
				plus.statistic.eventTrig('jsWrong', err); //触发友盟统计-js错误
			});
			$this.errorLog.set(err);
		}
	}
	$.extend(app);
	$.errorLog.init();
}());
//图缓存控制-未完成
// var imageCache = {
// path: '_doc/imageCache',
// get size() {
// var size;
// return size;
// },
// query: function(url) {
// return _urlToPath(url);
// },
// down: function(img) {//传入图片地址或者对象
// var self = this;
// var canvas = document.createElement("canvas");
// var c2x = canvas.getContext('2d');
// var pic = new Image;
// var pic_url;
// var file_url;
// if(typeof img === 'string') {
// pic.onload = draw;
// pic.src = img;
// } else if(typeof img === 'object' && img.toString() = '[object HTMLElement]') {
// pic = img;
// draw();
// } else {
// throw new Error('pic type error');
// }
// 
// function draw() {
// pic_url = pic.src;
// file_url = _urlToPath(pic_url);
// canvas.width = pic.width;
// canvas.height = pic.height;
// c2x.drawImage(pic, 0, 0, pic.width, pic.height);
// var base64 = canvas.toDataURL();
// mui.plusReady(function() {
// plus.myPlus.base64ToFile(pic_url, file_url, function(data) {
// console.log(data);
// }, function(e) {
// console.error(e);
// });
// });
// }
// },
// clear: function() {
// //
// },
// _urlToPath: function(url) {
// var self = this;
// var path;
// return path;
// },
// }

//自定义UI模块
var ui = {
	page: { //页面管理
		page: [], //预加载页面
		PAGEMAX: 3, //预加载页面的最大数量
		_lockVal: false,
		unlock: null,
		get lockType() {
			var val = this._lockVal
			return val;
		},
		set lockType(data) {
			var self = this;
			self._lockVal = data;
			if(data === true) {
				self.unlock = setTimeout(function() { //5s后自动解锁
					self._lockVal = false;
				}, 5000);
			} else {
				clearTimeout(self.unlock);
			}
		},
		pageHistory: [], //页面历史
		pageWaiting: null, //等待加载的页面
		duration: mui.os.android ? 250 : 300, //动画持续时间
		animationTypeShow: mui.os.android ? 'slide-in-right' : 'pop-in', //窗口显示动画类型
		// animationTypeShow: 'pop-in',
		// animationTypeShow: 'slide-in-right',
		animationTypeClose: mui.os.android ? 'slide-out-right' : 'pop-out', //窗口隐藏动画类型
		// animationTypeClose: 'pop-out',
		// animationTypeClose: 'slide-out-right',
		hardwareAccelerated: null, //硬件加速
		init: function() { //初始化新页面
			var page = this;
			mui.plusReady(function() {
				page.hardwareAccelerated = plus.webview.defauleHardwareAccelerated();
				page._create();
			});
		},
		_create: function() {
			var page = this;
			var loadUrl;
			if(page.pageWaiting) {
				loadUrl = 'html/' + page.pageWaiting;
				page.pageWaiting = null;
			} else {
				loadUrl = 'html/page.html';
			}
			var webview = plus.webview.create(loadUrl, '_page' + page.page.length, {
				popGesture: 'hide',
				scrollIndicator: 'none',
				hardwareAccelerated: page.hardwareAccelerated,
				scrollsToTop: false,
				bounce: 'none', //反弹
				render: ui.isWhiteScreenDevice() ? 'always' : 'onscreen', //页面渲染模式
				decelerationRate: 0.99, //窗口内容停止滑动的减速度
				kernel: 'UIWebview', //iOS使用的浏览器内核-WKWebview UIWebview
				cachemode: 'noCache', //缓存模式
			});
			// webview.hide();
			webview.loadType = 'created';
			webview.addEventListener('loading', function(e) { //加载中
				webview.loadType = 'loading';
			}, false);
			webview.addEventListener('loaded', function(e) { //加载完成
				webview.loadType = 'loaded';
				if(page.pageWaiting && webview.getURL().indexOf('page.html') > 0) {
					page._load(webview, page.pageWaiting);
					page.pageWaiting = null;
				}
				if(webview.isVisible()) {
					webview.evalJS('ui.pageReady()');
				}
			}, false);

			function oneLoaded() {
				webview.removeEventListener('loaded', oneLoaded, false);
				if(loadUrl.indexOf('page.html') < 0) {
					webview.show(page.animationTypeShow, page.duration, {
						acceleration: 'none'
					});
					page.pageHistory.push(loadUrl);
				}
			}
			webview.addEventListener('loaded', oneLoaded, false);

			webview.addEventListener('show', function() { //显示
				var index = page.page.indexOf(webview);
				webview.evalJS('ui.pageReady()');
				if(ui.isIos()) {
					webview.setStyle({
						scrollsToTop: true
					});
					if(index === 0) {
						plus.webview.getLaunchWebview().setStyle({
							scrollsToTop: false,
						});
					} else {
						page.page[index - 1].setStyle({
							scrollsToTop: false,
						});
					}
				}
				webview.pageUrl = page.pageHistory[page.pageHistory.length - 1];
				page.lockType = false;
				page.pageWaiting = null;

			}, false);

			function oneShow() {
				if(page.page.length >= page.PAGEMAX) {
					return;
				}
				setTimeout(function() {
					page._create();
				}, 0);
				webview.removeEventListener('show', oneShow, false);
			}
			webview.addEventListener('show', oneShow, false);

			webview.addEventListener('hide', function(e) { //隐藏
				var index = page.page.indexOf(webview);
				if(ui.isIos()) {
					webview.setStyle({
						scrollsToTop: false
					});
					if(index === 0) {
						plus.webview.getLaunchWebview().setStyle({
							scrollsToTop: true,
						});
					} else {
						page.page[index - 1].setStyle({
							scrollsToTop: true,
						});
					}
				}
				if(index >= page.PAGEMAX) { //大于最大值
					webview.close();
				} else {
					waiting.hide();
					index = page.pageHistory.indexOf(webview.pageUrl);
					if(index >= 0) {
						page.pageHistory.splice(index, 1);
					}
					page._reset(webview);
					webview.loadType = 'hide';
					page.pageWaiting = null;
					delete webview.pageUrl;
				}
			}, false);
			webview.addEventListener('close', function(e) { //关闭
				var index;
				waiting.hide();
				index = page.pageHistory.indexOf(webview.pageUrl);
				if(index >= 0) {
					page.pageHistory.splice(index, 1);
				}
				page.pageWaiting = null;
				index = page.page.indexOf(webview);
				if(index >= 0) {
					page.page.splice(index, 1);
				}
			}, false);

			page.page.push(webview);
		},
		open: function(pageUrl) { //打开新页面
			var page = this;
			var hasSamePage = false;
			var loginPages = ['cardExchange.html', 'changePassword.html', 'exchangeLog.html' //
				, 'fans.html', 'level.html', 'myQrcode.html' //
				, 'personal.html', 'phoneExchange.html', 'profitLog.html', 'sign.html' //
				, 'snatch.html', 'verification.html', 'wxExchange.html', 'zfbExchange.html' //
				, 'myTasks.html', 'redPacketAwardRecord.html', 'redPacketCreate.html' //
				, 'invite.html', 'inviteDetail.html', 'message.html' //
				, 'present.html', 'presentGet.html', 'presentShow.html' //
				, 'contractTask.html', 'contractTaskDetail.html', 'investAccount.html' //
			]; //需登录页面列表
			if(loginPages.indexOf(pageUrl.split('?')[0]) >= 0 && !('sessionID' in userInfo)) {
				pageUrl = 'login.html';
			}
			if(this.lockType) { //锁定中
				return;
			}
			mui.plusReady(function() {
				plus.statistic.eventTrig('pageOpen', pageUrl.split('.')[0]) //触发友盟页面访问统计
			});
			if(!ui.isApp()) { //非app内
				if(!ui.isPage()) { //主页
					pageUrl = 'html/' + pageUrl;
				}
				location.href = pageUrl;
				return;
			}
			if(ui.isPage()) { //非主页
				mui.plusReady(function() {
					plus.webview.getLaunchWebview().evalJS('ui.page.open("' + pageUrl + '")');
				});
				return;
			}
			page.lockType = true;

			function pageWaiting(noPage) { //加入等待队列
				page.pageWaiting = pageUrl;
				if(noPage) {
					mui.plusReady(function() {
						page._create();
					});
				}
			}

			if(!page.page.length) { //无预加载窗口
				pageWaiting(true);
			}

			function resetPage(webview) {
				webview.evalJS('ui.preloadPage.reset("' + pageUrl + '")');
				page.lockType = false;
			}
			for(var i = 0; i <= page.page.length; i++) {
				var webview = page.page[i];
				if(i === page.page.length && !hasSamePage) { //预加载窗口全部占用
					pageWaiting(true);
					break;
				}
				if(webview.isVisible()) { //窗口占用
					var now = webview.pageUrl.split('.')[0];
					var next = pageUrl.split('.')[0];
					if(hasSamePage) { //已有同名页面
						webview.hide();
						continue;
					}
					if(now === next) { //同名页面
						hasSamePage = true;
						resetPage(webview);
					} else {
						continue;
					}
				} else { //窗口可用
					if(!hasSamePage) {
						if(webview.loadType === 'loaded') { //已加载
							page._load(webview, pageUrl);
							break;
						}
						pageWaiting();
					}
					break;
				}
			}
		},
		_load: function(webview, pageUrl) {
			var page = this;
			webview.evalJS('ui.preloadPage.load("' + pageUrl + '")');
			if(!ui.isAndroid()) {
				setTimeout(function() {
					webview.show(page.animationTypeShow, page.duration, {
						acceleration: 'none'
					});
				}, 20);
			}
			page.pageHistory.push(pageUrl);
		},
		hide: function(backType) { //type：是否忽略回退强制关闭
			if(!ui.isApp()) { //非app内
				history.back();
				return;
			}
			var page = this;
			var webview = plus.webview.currentWebview();
			var opened = webview.opened();

			function hide() {
				waiting.hide();
				webview.hide(page.animationTypeClose, page.duration, {
					acceleration: 'none'
				});
			}

			if(opened && opened.length) {
				opened = opened[0];
				if(backType) {
					hide();
				} else {
					opened.canBack(function(data) {
						if(data.canBack) {
							opened.back();
						} else {
							hide();
						}
					});
				}

			} else {
				hide();
			}
		},
		_reset: function(webview) {
			var page = this;

			function getWebView() {
				for(var i = 0; i < page.page.length; i++) {
					webview = page.page[i];
					if(!webview.isVisible()) {
						page = webview;
						break;
					}
				}
			}
			if(!webview) {
				getWebView();
			}
			//清除子窗口
			var open_list = webview.opened() || [];
			for(var i = 0; i < open_list.length; i++) {
				open_list[i].close();
			}
			webview.evalJS('ui.preloadPage.reset()');
		},
		hideAll: function() { //隐藏所有新页面
			if(!ui.isApp()) { //非app内
				location.href = '../index.html';
				return;
			}
			var page = this;
			if(ui.isPage()) { //非主页
				plus.webview.getLaunchWebview().evalJS('ui.page.hideAll()');
				return;
			}
			page.page.forEach(function(webview) {
				if(webview && webview.isVisible()) {
					webview.hide(page.animationTypeClose, page.duration, {
						acceleration: 'none'
					});
				}
			})
			waiting.hide();
		}
	},
	preloadPage: { //预加载页面
		cssMatch: null,
		jsMatch: null,
		$head: null,
		$body: null,
		$title: null,
		init: function() {
			var $this = this;
			var csss, jss;
			var cssMatch = [],
				jsMatch = [];

			if(!window.gulp_preload) { //非gulp预处理页面
				this._getPage(location.href, function(data) {
					csss = data.match(/<link(?:\s+rel="stylesheet")?(?:\s+type="text\/css")?\s+href="(?:[\w\.]+\/)+[-\.\w]+"\s*\/?>/g) || [];
					jss = data.match(/<script\s+src="(?:[\w\.]+\/)+([-\.\w])+"\s*><\/script>/g) || [];
					for(var c = 0; c < csss.length; c++) {
						cssMatch[c] = '(' + csss[c].match(/(?:href="(?:[\w\.]+\/)+)([-\.\w]+)"/)[1].replace(/\./g, '\\.') + ')';
					}
					cssMatch = '<link(\\s+rel="stylesheet")?(\\s+type="text\\\/css")?\\s+href="([\\w\.]+\\\/)+((?!' + cssMatch.join('|') + ')[-\\.\\w])+"\\s*/?>';

					for(var j = 0; j < jss.length; j++) {
						jsMatch[j] = '(' + jss[j].match(/src="(?:[\w\.]+\/)+([-\.\w]+)"/)[1].replace(/\./g, '\\.') + ')';
					}
					jsMatch = '<script\\s+src="([\\w\\.]+\\\/)+((?!' + jsMatch.join('|') + ')[-\\.\\w])+"\\s*><\/script>';
					$this.cssMatch = cssMatch;
					$this.jsMatch = jsMatch;
				});
			}

			$this.$head = $("head");
			$this.$body = $("body");
			$this.$title = $('title');
		},
		load: function(page) {
			var $this = this;
			var pageName = page.split(".")[0];
			history.replaceState({}, '', page);

			function addJS(newScripts, callback) {
				function loadScript(url, fn) {
					var script = document.createElement("script");
					script.type = "text/javascript";
					script.onload = script.onreadystatechange = function() {
						if(!script.readyState || 'loaded' === script.readyState || 'complete' === script.readyState) {
							fn && fn();
						}
					};
					script.src = url;
					document.head.appendChild(script);
				}
				(function scriptRecurse(count) {
					if(count == newScripts.length) {
						callback && callback();
					} else {
						var newScript = newScripts[count];
						var js = newScript.match(/src="([A-Za-z-_\d\.\/]+)"/);
						if(js && js.length === 2) {
							js = js[1];
						} else {
							js = newScript;
						}
						loadScript(js, function() {
							scriptRecurse(++count);
						});
					}
				})(0);
			}

			function load(id, css, body, js, title) {
				css && css.length && $this.$head.append(css);
				$this.$body.html(body)[0].id = id;
				if(js && js.length) {
					var v = Number(mui.os.version.split('.')[0]);
					if(mui.os.android && v < 5) {
						addJS(js);
					} else {
						$this.$head.append(js);
					}
				}
				title && $this.$title.text(title);
				if(mui.os.android) {
					setTimeout(function() {
						ui.plusReady(function() {
							plus.webview.currentWebview().show(ui.page.animationTypeShow, ui.page.duration, {
								acceleration: 'none'
							});
						});
					}, 200);
				}
			}
			if(!window.gulp_preload) { //非gulp预处理页面
				this._getPage(page, function(data) {
					load(pageName, data.match(new RegExp($this.cssMatch, 'g')), data.match(/<body(?:\sid="[\w]+")?>([\s\S]+)<\/body>/)[1], data.match(new RegExp($this.jsMatch, 'g')), data.match(/<title>([\s\S]+)<\/title>/)[1]);
				}, function(e) { //页面加载失败-需通知主页进行修正-待完善
					console.error(e);
				});
			} else {
				load(pageName, null, gulp_preload[pageName].body, gulp_preload[pageName].js, gulp_preload[pageName].title);
			}
		},
		reset: function(pageUrl) {
			location.replace(pageUrl || "page.html");
		},
		_getPage: function(page, su, er) {
			$.ajax({
				type: "get",
				url: page,
				async: true,
				dataType: 'html',
				success: function(data) {
					if(typeof su === 'function') su(data);
				},
				error: function(e) {
					console.error(e);
					if(typeof er === 'function') er(e);
				}
			});
		}
	},
	isApp: function() {
		return !!navigator.userAgent.match(/Html5Plus/i);
	},
	isAndroid: function() {
		return !!navigator.userAgent.match(/android/i);
	},
	isIos: function() {
		return !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	isPage: function() { //新页面
		return location.href.indexOf('/html/') > 0;
	},
	isWhiteScreenDevice: function() {
		//**三星  GALAXY A8->无法打开index.html file error
		//测试回退白屏的机型
		//小米 5 6.0.1（MIUI8）
		//三星 S6 edge SM-G9250 6.0.1
		//三星 A9100 SM-A9100 6.0.1
		//三星 C5000 SM-C5000 6.0.1
		//LG G5 LG-H868 6.0.1
		//三星  GALAXY S7 SM-G9300
		//三星  Note 5 SM-N9200
		//三星 s7 Mozilla/5.0 (Linux; Android 6.0.1; SM-G935T Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/49.0.2623.105 Mobile Safari/537.36 Html5Plus/1.0 (Immersed/24.0)
		//判断策略-LG和三星 6.0.1及以上系统（vendor samsung）
		/*新UI版本出现白屏*/
		// LG nexus4 5.1.1
		//魅蓝3 5.1回退闪烁
		/*新执行策略，安卓5.1及以上*/
		var type;
		if(ui.isAndroid() && compareVersion(mui.os.version, '5.1') >= 0) {
			// type = !!navigator.userAgent.match(/\s(SM|LG)-[\S\w]*\s/);
			type = true;
		} else {
			type = false;
		}
		return type;
	},
	plusReady: function(callback) {
		if(window.plus) {
			callback();
		} else {
			document.addEventListener("plusready", function() {
				callback();
			}, false);
		}
		return this;
	},
	pageReadyCallback: [],
	pageReady: function(callback) {
		var $this = this;
		if(!this.isApp()) { //app外部
			$(callback);
			return;
		}
		if(!callback) { //触发事件
			if(window._pageState) {
				return;
			}
			window._pageState = true;
			this.pageReadyCallback.forEach(function(callback) {
				if(typeof callback === 'function') {
					callback();
				}
			});
			return;
		}
		if(window._pageState || (window.plus && plus.webview.currentWebview().isVisible())) { //已显示
			$(callback);
			return;
		}
		this.pageReadyCallback.push(callback);
	},
}

//重置返回
;
(function() {
	var pageName;
	var notPageList = ['index', 'indexHome', 'indexMe', 'indexProfit', 'indexTry'];
	try {
		pageName = location.href.match(/\/([0-9a-zA-Z]+)\.html/)[1];
	} catch(e) {
		pageName = '';
		console.error(e);
	}
	if(notPageList.indexOf(pageName) < 0) {
		mui.back = function() {
			ui.page.hide();
		}
	}
})();

//定义app
var app = {
	userInfo: { //用户信息操作与事件监听
		_listener: {
			change: [],
			login: [],
			logout: [],
		},
		on: function(eventName, callback) { //监听事件，事件名称空格分隔
			var self = this;
			var events = eventName.split(' ');
			events.forEach(function(eventName) {
				if(typeof callback === 'function') {
					self._listener[eventName].push(callback);
				}
			})

		},
		off: function(eventName, callback) {
			var self = this;
			var events = eventName.split(' ');
			events.forEach(function(eventName) {
				if(callback) {
					var index = self._listener[eventName].indexOf(callback);
					self._listener[eventName].splice(index, 1);
				} else {
					self._listener[eventName] = [];
				}
			});
		},
		fireEvent: function(eventName, stop) {
			var listener = this._listener[eventName];
			if(listener && listener.length) {
				listener.forEach(function(event) {
					event();
				});
			}
			if(!stop) {
				mui.plusReady(function() {
					var id = plus.webview.currentWebview().id;
					plus.webview.all().forEach(function(webview) {
						id === webview.id || webview.evalJS('window.app&&app.userInfo&&app.userInfo.fireEvent("' + eventName + '","true")');
					});
				});
			}
		},
		get: function(fn) {
			$.api('userInfo', {}, function(data) {
				data = data.data;
				userInfo = data;
				if(typeof fn === 'function') {
					fn(data);
				}
			});
		},
		set: function(data, fn) {
			$.api('updateUserInfo', data, function(data) {
				data = data.data;
				userInfo = data;
				if(typeof fn === 'function') {
					fn(data);
				}
			});
		},
		// get data() {},
		// set data() {},
		get isSign() { //是否签到
			if('signDate' in userInfo && userInfo.signDate) {
				var signDate = new Date(userInfo.signDate);
				return Date.now() - signDate < 86400000;
			} else {
				return false;
			}
		},
		get isLogin() { //是否登录
			return 'sessionID' in userInfo && userInfo.sessionID;
		},
	}

}

/*
 * 自定义plus插件
 * guoshegnqiang 20160412
 * */
mui.plusReady(function() {
	var MyPlus = {
		/**
		 * 分享
		 * @param {Object} var1 分享对象
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		share: function(var1, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== 'function' ? null : function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null : function(code) {
					errorCallback(code);
				};
			var callbackID = bridge.callbackId(success, fail);

			return bridge.exec('MyPlus', "share", [callbackID, var1.imgs || [], var1.title || '', var1.link || '']);
		},
		/**
		 * 分享多图和文案到朋友圈
		 * @param {Array} var1 图片url数组
		 * @param {String} var2 分享文案
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		shareToTimeLine: function(var1, var2, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== 'function' ? null : function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null : function(code) {
					errorCallback(code);
				};
			var callbackID = bridge.callbackId(success, fail);

			return bridge.exec('MyPlus', "shareToTimeLine", [callbackID, var1, var2]);
		},
		/**
		 * 分享多图到朋友
		 * @param {Array} var1 图片数组
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		shareToFriendsImg: function(var1, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== 'function' ? null : function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null : function(code) {
					errorCallback(code);
				};
			var callbackID = bridge.callbackId(success, fail);

			return bridge.exec('MyPlus', "shareToFriendsImg", [callbackID, var1]);
		},
		/**
		 * 分享文案到朋友
		 * @param {String} var1 分享文案
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		shareToFriendsTest: function(var1, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== 'function' ? null : function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null : function(code) {
					errorCallback(code);
				};
			var callbackID = bridge.callbackId(success, fail);

			return bridge.exec('MyPlus', "shareToFriendsTest", [callbackID, var1]);
		},
		/**
		 * 获取IDFA，仅支持iOS
		 * @example
		 * plus.myPlus.getIDFA();
		 */
		getIDFA: function() {
			var bridge = window.plus.bridge;
			return bridge.execSync('MyPlus', "getIDFA", [null]);
		},
		/**
		 * base64存储为文件
		 * @param {String} base64Code base64字符串
		 * @param {String} savePath 存储路径
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		base64ToFile: function(base64Code, savePath, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== 'function' ? null : function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null : function(code) {
					errorCallback(code);
				};
			var callbackID = bridge.callbackId(success, fail);

			return bridge.exec('MyPlus', "base64ToFile", [callbackID, base64Code, savePath]);
		},
		/**
		 * 复制文本
		 * @param {String} 要复制的文本
		 */
		copyText: function(text) {
			var bridge = window.plus.bridge;
			try {
				bridge.execSync('MyPlus', "copyText", [text.toString()]);
			} catch(e) {
				console.log(e)
			}
		},
		/**
		 * 获取AnroidManifest.xml内的metaData，仅支持安卓
		 * @param {String} 要获取的metaData名
		 */
		getAppMeta: function(text) {
			var bridge = window.plus.bridge;
			text += '';
			if(text.length) {
				return bridge.execSync('MyPlus', "getAppMeta", [text]);
			} else {
				return '';
			}
		},
		/**
		 * 获取mac地址
		 */
		getMacAddress: function() {
			var bridge = window.plus.bridge;
			return bridge.execSync('MyPlus', "getMacAddress", [null]).replace(/'/g, '');
		},
		/**
		 * 测试打开scheme,安卓返回包名，ios返回scheme
		 * @param {String} 要测试打开的scheme
		 */
		canOpen: function(scheme) {
			var bridge = window.plus.bridge;
			return bridge.execSync('MyPlus', "canOpen", [scheme]);
		},
		/**
		 * 退出程序，仅支持iOS
		 */
		exit: function(animation) {
			var bridge = window.plus.bridge;
			return bridge.execSync('MyPlus', "exit", [null]);
		},
		/**
		 * 设置用于微信分享的信息，仅支持安卓
		 * @param {String} 调用的appid
		 * @param {String} 调用的app包名
		 */
		setShareInfo: function(appid, apkId) {
			var bridge = window.plus.bridge;
			return bridge.execSync('MyPlus', "setShareInfo", [appid, apkId]);
		},
		/**
		 * 获取app签名的md5值，仅支持安卓
		 * @param {String} 要获取的app包名
		 */
		getAppSign: function(name) {
			var bridge = window.plus.bridge;
			return bridge.execSync('MyPlus', "getAppSign", [name]);
		},
		/**
		 * 分享到微信（openShare），仅支持iOS
		 * @param {String} 分享类型 friend、timeline、favorite
		 * @param {Object} 分享数据对象 image（本地图片地址） title link desc
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		wxShare: function(scene, message, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== "function" ? null : function(args) {
				successCallback(args);
			};
			var fail = typeof errorCallback !== "function" ? null : function(code) {
				errorCallback(code);
			};
			var callbackID = bridge.callbackId(success, fail);
			var options = $.extend(message, {
				scene: scene
			});
			var str = JSON.stringify(options);
			return bridge.exec("MyPlus", "wxShare", [callbackID, str]);
		},
		/**
		 * 设置微信分享配置（openShare），仅支持iOS
		 * @param {Object} 微信分享配置对象 appid
		 * @param {Function} successCallback 成功的回调
		 * @param {Function} errorCallback 错误的回调
		 */
		wxSetConfig: function(option, successCallback, errorCallback) {
			var bridge = window.plus.bridge;
			var success = typeof successCallback !== "function" ? null : function(args) {
				successCallback(args);
			};
			var fail = typeof errorCallback !== "function" ? null : function(code) {
				errorCallback(code);
			};
			var callbackID = bridge.callbackId(success, fail);
			return bridge.exec("MyPlus", "setWxShareConfig", [callbackID, JSON.stringify(option)]);
		},
	};
	window.plus.myPlus = MyPlus;
});

function hidePage() {
	ui.page.hide();
}

function copyText(text, toast) { //复制文字到剪贴板
	plus.myPlus.copyText(text);
	if(!(toast === false)) {
		mui.toast(toast || '复制成功');
	}
}

/*密码加密*/
var encryptionPassword = function(password) {
	var rsa_n = "D34E1699AF7FA04370F497AEA326ED9340F53AE46E6EEC22C08F35C21411CD56F1838DEE6F897737FA0D7E00571020738730BB94C7A01853C78A4D4DBAAF9CF91D6705BF3ADDAE321B453C813E439443A7F956113674F2F24118F8865720CC78E70FD57A6404FFC7E3FC8D549BE90EAF4E430216D35495539464AF3D1EF16693B21F70F45EE6762EAE39EC1E4A63A11E5BBDA9ED4D76432D66892F0CC6A807F3963AC17EA6D2993DD70F760DD6D72B90EEF70D0C23EF2DA4ED8C5C861BC0C2FF411E62F357DBFB99547CCE82F68FA1B80D1A939586D0AD45FABEBFB84EB250ACEE99CD7DE40D0A20CE7EB5E919E0F2EFCABF583EF581A7536E4B89C52D4949FB";
	setMaxDigits(rsa_n.length / 2 + 3);
	var key = new RSAKeyPair("10001", '', rsa_n);
	password = encryptedString(key, password + '');
	return password;
}
var ep = encryptionPassword;
/*内置浏览器打开*/
var browse2 = {
	openURL: function(str) {
		var page = 'browse2.html?webUrl=' + encodeURIComponent(str);
		ui.page.open(page);
	}
}
var waiting = { //等待框
	show: function(str, type, back) {
		var text = typeof str === "string" ? str : '';
		var modal = typeof str === "boolean" ? str : type;
		try {
			plus.nativeUI.showWaiting(text, {
				modal: modal,
				color: '#f82566',
				background: 'rgba(255,255,255,' + (text.length ? '0.8' : '0') + ')',
				back: back || 'close',
				loading: {
					icon: '_www/img/loading.png',
					interval: 20,
					height: '60px',
				}

			});
		} catch(e) {
			console.warn(e);
		}
	},
	hide: function() {
		try {
			plus.nativeUI.closeWaiting();
		} catch(e) {
			console.warn(e);
		}
	}
}

function wxBind() {
	mui.confirm('继续操作需要绑定微信，是否立即绑定？', '绑定微信', ['是', '否'], function(e) {
		if(e.index == 0) {
			if(typeof wxlogin === 'function') {
				wxlogin(function(data) {
					mui.toast("绑定成功");
				});
			} else {
				mui.plusReady(function() {
					plus.webview.getLaunchWebview().evalJS('wxlogin(function(data) {mui.toast("绑定成功")})');
				});
			}
		} else {
			mui.toast('你取消了绑定');
		}
	});

}

function phoneBind() {
	mui.confirm('需要绑定手机才能继续，是否立即绑定', '绑定手机', ['确定', '取消'], function(e) {
		if(e.index == 0) {
			ui.page.open('verification.html');
		} else {
			mui.toast('您取消了绑定');
		}
	});
}

//解析页面操作指令
window.evalJSON = function(pageHref) {
	var pageId = pageHref.page;
	var pageData = pageHref.data;
	var source = pageHref.source;
	var newsID = pageHref.newsID;
	if(!pageId) {
		return;
	}
	if(source && newsID) {
		$.api('hasRead', {
			newsID: newsID,
			source: source,
		}, function(data) {
			data = data.data;
			if(data && 'unread' in data) {
				userInfo = $.extend(userInfo, {
					unread: data.unread,
				});
			}
		}, function() {}, function() {});
	}
	if(pageId === 'share') { //打开分享
		if('myInviteCode' in userInfo) {
			if(window.ui && ui.share && typeof ui.share.open === 'function') {
				ui.share.open();
			} else {
				mui.plusReady(function() {
					plus.webview.getLaunchWebview().evalJS('ui.share.open()');
				})
			}
		} else {
			mui.confirm('登录后才能邀请好友，是否立即登录？', '立即登录', ['是', '否'], function(e) {
				if(e.index == 0) {
					ui.page.open('login.html', true);
				} else {
					mui.toast('您取消了登录');
				}
			});
		}
	} else if(pageId == 'checkUpdata') { //检测更新
		checkUpdate();
	} else if(pageId === 'home' || pageId === 'try' || pageId === 'profit' || pageId === 'coupon') { //切换主页tab
		ui.page.hideAll();
		ui.pageTab.change(pageId);
	} else if(pageId === 'browse2' && pageData) { //浏览网址（内置）
		browse2.openURL(pageData);
	} else if(pageId === 'browse0' && pageData) { //浏览网址（系统）
		plus.runtime.openURL(pageData);
	} else if((pageId === 'taskDetails' || pageId === 'taskDetail') && pageData) { //任务详情
		ui.page.open('taskDetails.html?task=' + pageData, true);
	} else { //直接开新页面
		ui.page.open(pageId + '.html');
	}
}

function del_file(url) { //删除文件 url支持相对路径URL、本地路径URL、网络路径URL(http://localhost:13131/开头)
	plus.io.resolveLocalFileSystemURL(url, function(entry) {
		entry.remove(function(data) {
			console.log('del-ok');
		}, function(e) {
			throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
		});
	}, function(e) {
		throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
	});
}

function write_file(file_path, str, add) { //写入文件
	plus.io.resolveLocalFileSystemURL(file_path, function(entry) {
		entry.createWriter(function(writer) {
			writer.onwrite = function(e) {
				console.log('write——ok');
				writer.abort();
			};
			writer.onerror = function(e) {
				throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
			};
			if(add) {
				writer.seek(writer.length);
			}
			writer.write(str);
		}, function(e) {
			throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
		});
	}, function(e) {
		throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
	});
}

//监测沉浸式状态栏
(function() {
	var _statusbar;
	window.ui = window.ui || {};
	Object.defineProperty(ui, 'statusbar', {
		set: function(data) {
			if(data) {
				_statusbar = $.extend(_statusbar, data);
			}
		},
		get: function() {
			if(_statusbar) {
				return _statusbar
			} else {
				var immersed = 0;
				var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
				var type = false;
				var height = 0;
				if(ms && ms.length >= 3) { // 当前环境为沉浸式状态栏模式
					type = true;
					immersed = parseFloat(ms[2]);
					if(immersed === 0) {
						type = false;
					} else if(immersed >= 0 && immersed < 20) {
						height = 20;
					} else if(immersed >= 20 && immersed < 23) {
						height = 20;
					} else if(immersed >= 23 && immersed < 28) {
						height = 25;
					} else if(immersed >= 28) {
						height = 25;
					} else {
						height = 25;
					}
				}
				_statusbar = {
					type: type,
					immersed: immersed,
					height: height,
				}
				return _statusbar;
			}
		},
		configurable: true,
	});
	$(function() {
		if(ui.statusbar.type) {
			$("body").addClass('ui-statusbar');
			$("body").addClass('ui-statusbar-' + ui.statusbar.height);
		}
	});
})();

//报告服务的错误
function postServerError(data) {
	// channel: 'z800',
	// req_url: data.req_url,
	// req_post_data: data.req_post_data,
	// res_status: data.res_status,
	// res_message: data.res_message,
	try {
		$.ajax({
			type: 'post',
			url: config.serverError,
			dataType: 'json',
			data: $.extend({
				channel: 'z800',
			}, data),
			success: function(data) {
				console.log(data);
			},
			error: function(e) {
				console.error(e);
			}
		});
	} catch(e) {
		console.error(e);
	}
}

//图片上传
function uploadImgToQiniu(filesOrFile, succesCB, errorCB) {
	//要返回的图片地址列表
	var urls = [];
	//原始文件数组
	var files = [];
	if(Array.isArray(filesOrFile)) {
		files = filesOrFile;
	} else {
		files.push(filesOrFile);
	}
	//获取token
	$.api('token', {}, function(data) {
		var token = data.data.token;
		//遍历图片
		files.forEach(function(imgFile) {
			//加载图片
			var img = new Image();
			img.onload = function() {
				var w = img.width;
				var h = img.height;
				var newW;
				var newH;
				var MAX = 1200;
				//计算压缩分辨率
				if(w > MAX || h > MAX) {
					if(w >= h) {
						newW = MAX + 'px';
						newH = 'auto';
					} else {
						newH = MAX + 'px';
						newW = 'auto';
					}
				}

				var imgName = userInfo.myInviteCode + '_' + Date.now() + '.jpg';
				var imgUrl = '_downloads/' + imgName;
				//压缩图片
				plus.zip.compressImage({
					src: imgFile,
					dst: imgUrl,
					overwrite: true,
					format: 'jpg',
					quality: 60,
					width: newW,
					height: newH,
				}, function(event) {
					var imgFile = event.target;
					//上传图片
					var upload = plus.uploader.createUpload(config.qiniuUpload, {
						method: "POST"
					}, function(t, status) {
						// 上传完成
						if(status == 200) { //上传成功
							var data = JSON.parse(t.responseText);
							urls.push(data.key);
							if(urls.length === files.length) {
								succesCB(urls);
							}
						} else {
							errorCB('上传失败');
						}
						//删除压缩后的文件
						del_file(imgUrl);
					});
					upload.addData("token", token);
					upload.addFile(imgFile, {
						key: 'file'
					});
					upload.addData("key", imgName);
					upload.start();
				}, function(e) {
					errorCB('上传失败');
				});
			}
			img.src = imgFile;
		});
	}, function(data) {
		errorCB('上传失败');
	}, function() {
		errorCB('网络错误，上传失败')
	}, function() {
		// waiting.hide();
	});
}
// utf8编码
(function(global) {
	'use strict';

	var log = function() {},
		padding = '=',
		chrTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
		'0123456789+/',
		binTable = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
			52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
			15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
			41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
		];
	if(global.console && global.console.log) {
		log = function(message) {
			global.console.log(message);
		};
	}

	// internal helpers //////////////////////////////////////////////////////////

	function utf8Encode(str) {
		var bytes = [],
			offset = 0,
			length, char;

		str = encodeURI(str);
		length = str.length;

		while(offset < length) {
			char = str[offset];
			offset += 1;

			if('%' !== char) {
				bytes.push(char.charCodeAt(0));
			} else {
				char = str[offset] + str[offset + 1];
				bytes.push(parseInt(char, 16));
				offset += 2;
			}
		}

		return bytes;
	}

	function utf8Decode(bytes) {
		var chars = [],
			offset = 0,
			length = bytes.length,
			c, c2, c3;

		while(offset < length) {
			c = bytes[offset];
			c2 = bytes[offset + 1];
			c3 = bytes[offset + 2];

			if(128 > c) {
				chars.push(String.fromCharCode(c));
				offset += 1;
			} else if(191 < c && c < 224) {
				chars.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
				offset += 2;
			} else {
				chars.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
				offset += 3;
			}
		}

		return chars.join('');
	}

	// public api ////////////////////////////////////////////////////////////////

	function encode(str) {
		var result = '',
			bytes = utf8Encode(str),
			length = bytes.length,
			i;

		// Convert every three bytes to 4 ascii characters.
		for(i = 0; i < (length - 2); i += 3) {
			result += chrTable[bytes[i] >> 2];
			result += chrTable[((bytes[i] & 0x03) << 4) + (bytes[i + 1] >> 4)];
			result += chrTable[((bytes[i + 1] & 0x0f) << 2) + (bytes[i + 2] >> 6)];
			result += chrTable[bytes[i + 2] & 0x3f];
		}

		// Convert the remaining 1 or 2 bytes, pad out to 4 characters.
		if(length % 3) {
			i = length - (length % 3);
			result += chrTable[bytes[i] >> 2];
			if((length % 3) === 2) {
				result += chrTable[((bytes[i] & 0x03) << 4) + (bytes[i + 1] >> 4)];
				result += chrTable[(bytes[i + 1] & 0x0f) << 2];
				result += padding;
			} else {
				result += chrTable[(bytes[i] & 0x03) << 4];
				result += padding + padding;
			}
		}

		return result;
	}

	function decode(data) {
		var value, code, idx = 0,
			bytes = [],
			leftbits = 0, // number of bits decoded, but yet to be appended
			leftdata = 0; // bits decoded, but yet to be appended

		// Convert one by one.
		for(idx = 0; idx < data.length; idx++) {
			code = data.charCodeAt(idx);
			value = binTable[code & 0x7F];

			if(-1 === value) {
				// Skip illegal characters and whitespace
				log("WARN: Illegal characters (code=" + code + ") in position " + idx);
			} else {
				// Collect data into leftdata, update bitcount
				leftdata = (leftdata << 6) | value;
				leftbits += 6;

				// If we have 8 or more bits, append 8 bits to the result
				if(leftbits >= 8) {
					leftbits -= 8;
					// Append if not padding.
					if(padding !== data.charAt(idx)) {
						bytes.push((leftdata >> leftbits) & 0xFF);
					}
					leftdata &= (1 << leftbits) - 1;
				}
			}
		}

		// If there are any bits left, the base64 string was corrupted
		if(leftbits) {
			log("ERROR: Corrupted base64 string");
			return null;
		}

		return utf8Decode(bytes);
	}

	global.base64 = {
		encode: encode,
		decode: decode
	};
}(window));