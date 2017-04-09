$(function() {
	var myScroll = new Refresh('.content', {
		probeType: 3,
		deceleration: 0.002,
		preventDefault: false,
	});
	$('body').on('touchmove', function(event) {
		if(event.cancelable) {
			if(!event.defaultPrevented) {
				event.preventDefault();
			}
		}
	});
	var singer = new Vue({
		el: '#singer',
		data: {
			singerList: [],
			list: [],
			numList: [4, 0, 35, 6, 0, 28, 7, 3, 1, 2, 3, 1, 4, 12, 3, 4, 12, 3, 3, 1, 3, 1, 23, 1, 3, 1],
			type: [{
				'key': 'man',
				'value': '男歌手',
			}, {
				'key': 'woman',
				'value': '女歌手',
			}, {
				'key': 'combine',
				'value': '组合歌手',
			}],
			active: '',
			searchVal: '',
			mWorld: '',
			XhrRequest: null,
		},
		methods: {
			init: function() {
				this.getSingerData();
				myScroll.scrollTo(0, -1, 0);
			},
			openUrl: function(val) {
				window.location.href = val;
			},
			getSingerData: function() {
				var self = this;
				var server = 'http://jcyyh.cctvht.cn/cctv5/getList?function=mSinger&pageSize=2000&pageIndex=1';
				self.XhrRequest = $.ajax({
					url: server,
					type: 'post',
					dataType: 'json',
					data: {},
					timeout: 3000,
					success: function(data) {
						console.log(data.msg);
						for(var i; i < data.msg.firstLetter; i++) {
							data.msg.firstLetter[i] = parseInt(data.msg.firstLetter[i]);
						}
						self.numList = data.msg.firstLetter;
						console.log(self.numList);
						self.singerList = data.msg.list;
						self.singerList.forEach(function(i, n) {
							if(i.headimgurl == "") {
								i.headimgurl = '../img/nodata.jpg';
							}
						});
						var index = [];
						for(var i = 0; i < self.numList.length; i++) {
							var v = 0;
							for(var j = 0; j < i; j++) {
								v += self.numList[j];
							}
							index.push(v);
						}
						var word = ['热', 'A', 'B', 'C', 'D', 'E', 'F',
							'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
							'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
							'W', 'X', 'Y', 'Z'
						];
						index.forEach(function(n, i) {
							self.singerList[n].word = word[i];

						});
						singer.active = '';
						myScroll.scrollTo(0, -1, 0);
					},
					error: function(error) {
						console.log(error);
					}
				});
			},
			search: function() {
				if(singer.searchVal == '') {
					$.alert('请输入要搜索的歌手名！');
					return;
				}
				var self = this;
				console.log(singer.active);
				var server = 'http://jcyyh.cctvht.cn/cctv5/getList?function=mStyle&which_style=' + encodeURIComponent(singer.active) + '&keyword=' + encodeURIComponent(singer.searchVal.trim()) + '&pageSize=2000&pageIndex=1';
				console.log(server);
				$.ajax({
					url: server,
					type: 'post',
					dataType: 'json',
					data: {},
					timeout: 3000,
					success: function(data) {
						console.log(data);
						self.singerList = data.msg.list;
						self.singerList.forEach(function(i, n) {
							if(i.headimgurl == "") {
								i.headimgurl = '../img/nodata.jpg';
							}
						});
					},
					error: function(error) {
					}
				});
				myScroll.scrollTo(0, -1, 0);
			},
			getSingerType: function(val) {
				var self = this;
				singer.active = val;
				console.log(singer.active);
				var server = 'http://jcyyh.cctvht.cn/cctv5/getList?function=mStyle&which_style=' + encodeURIComponent(singer.active) + '&pageSize=2000&pageIndex=1';
				console.log(server);
				self.XhrRequest = $.ajax({
					url: server,
					type: 'post',
					dataType: 'json',
					data: {},
					timeout: 3000,
					success: function(data) {
						console.log(data.msg);
						for(var i; i < data.msg.firstLetter; i++) {
							data.msg.firstLetter[i] = parseInt(data.msg.firstLetter[i]);

						}
						self.numList = data.msg.firstLetter;
						console.log(self.numList);
						self.singerList = data.msg.list;
						self.singerList.forEach(function(i, n) {
							if(i.headimgurl == "") {
								i.headimgurl = '../img/nodata.jpg';
							}
						});
						var index = [];
						for(var i = 0; i < self.numList.length; i++) {
							var v = 0;
							for(var j = 0; j < i; j++) {
								v += self.numList[j];
							}
							index.push(v);
						}
						console.log(index);
						var word = ['热', 'A', 'B', 'C', 'D', 'E', 'F',
							'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
							'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
							'W', 'X', 'Y', 'Z'
						];
						index.forEach(function(n, i) {
							self.singerList[n].word = word[i];
						});

						myScroll.scrollTo(0, -1, 0);
					},
					error: function(error) {
						console.log(error);
					}
				});

			},
			remoteMusic: function(val) {
				console.log(encodeURIComponent(val));
				window.location.href = 'singerDetail.html?keyword=' + encodeURIComponent(val);
			},
			back: function() {
				window.location.href = 'index.html';

			},
			backSearch: function() {
				this.getSingerData();
				this.searchVal='';
			}
		},
		watch: {
			singerList: function(val) {
				if(val.length <= 0) {
					$('#nodate').show();
				} else {
					$('#nodate').hide();
				}
				setTimeout(function() {
					myScroll.refresh();
				}, 0);
			},
			searchVal: function(val) {
				if(val === '') {
//					this.getSingerData();

				}
			}
		}
	});
	singer.init();
	if($(document).height() <= 550) {
		$('.word-list').addClass('scrollBar');
		$('.word-list').css("-webkit-transform", "scale(.78)");
		$('.word-list').css("transform-origin", "top");
		$('.word-list').css("transform", "scale(.78)");
	} 
	$('.content').height($(document).height() - 250);
		

	var pageSize = 6;
	var num = 1;
	var contentHeightDiv = $('.content>div').height();
	var contentHeight = $('.content').height();
	var pageNum = Math.round(contentHeightDiv / contentHeight);
	var itemNum = singer.singerList.length;
	console.log(itemNum);
	console.log(contentHeight);

	var self = 8;
	myScroll.on('scroll', function() {
		var move = this.y >> 0;
		console.log(Math.round((-move) / 30));
		console.log($('.singer-word').length);
		var id = parseInt((-move) / 45) + 10;
		var before = parseInt((-move) / 45);
		for(id; id >= before; id--) {
			$('#img' + id).attr('src', $('#img' + id).data('src'));
		}
	});
	myScroll.onPullToRefresh = function() {
		singer.XhrRequest && singer.XhrRequest.abort && singer.XhrRequest.abort();
		if(singer.singerList.length >= 0) {
			//			myScroll.destroy();
			myScroll.pullToRefresh.type = 'start';
		} else {
			singer.getSingerData();
			myScroll.pullToRefresh.type = 'start';
		}

	}
	var height = $(document).height();
//	if(height <= 480) {
//		$('.content').height(270);
//	}
	$('#word-list>li').on('tap', function() {
		$('#word-list>li').each(function(n, e) {
			$(this).removeClass('li-active');
		});
		var $this = $(this);
		var text = $this.text();
		if(!$this.hasClass('li-active')) {
			$this.addClass('li-active');
		}
		console.log($(this).text());
		$('.popup').show();
		singer.mWorld = text;
		setTimeout(function() {
			$('.popup').hide();
		}, 500)
		myScroll.scrollToElement('#' + text, 500, null, null);
	});
	$('#singer').keydown(function(event) {
		if(event.which === 13) {
			event.preventDefault();
			singer.search();
		}
	});
	if(ismobile()!=0){
		$('.input-cursor').css('margin-top','2px');
	}
	var original = document.documentElement.clientHeight;
	window.addEventListener("resize", function() {
		var resizeHeight = document.documentElement.clientHeight;
		if(resizeHeight != original) {
			$('.bottom-button').css('display', 'none');
		} else {
			$('.bottom-button').css('display', 'block');
		}
	});
	
	var proveUrl = "http://jcyyh-jssdk.h6app.com/Jssdk2/getSignPackage";
	getConfig("setConfig");

	function getConfig(canMethod) {
		var url = encodeURIComponent(window.location.href);
		var sct = document.createElement("script");
		sct.setAttribute("id", "dataProxy");
		sct.src = proveUrl + '?url=' + url + '&callback=' + canMethod + '';
		document.getElementsByTagName("body")[0].appendChild(sct);
	}

	function setConfig(result) {
		console.log(result);
		wx.config(result.data, $.extend(true, result.data, {
			'debug': false
		}));
		wx.ready(function() {
			var imgUrl = "http://jcyyh.cctvht.cn/front/img/wxlogo.png";
			var link = window.location.host + '/front/html/index.html';
			wx.onMenuShareTimeline({
				title: "精彩音乐汇点歌祝福",
				desc: "精彩音乐汇点歌平台开通了，为你的朋友送上祝福吧！",
				link: link,
				imgUrl: imgUrl,
				success: function() {

				},
				cancel: function() {}
			});

			wx.onMenuShareAppMessage({
				title: "精彩音乐汇点歌祝福",
				desc: "精彩音乐汇点歌平台开通了，为你的朋友送上祝福吧！",
				link: link,
				imgUrl: imgUrl,
				success: function() {

				},
				cancel: function() {}
			});

		});

	}
	window.setConfig = setConfig;
	
	
});