/*
 * 基于iscroll（probe版本）的上拉加载下拉刷新，同时依赖jQuery
 * 样式依赖mui.css和iscroll-refresh.min.css
 * Refresh.pullToRefresh.type 设置和获取下拉刷新状态['start', 'loading', 'end']
 * Refresh.pullToLoadMore.type 设置和获取上拉加载更多状态['none','start', 'loading', 'end']
 * Refresh.onPullToRefresh 下拉刷新回调
 * Refresh.onPullToLoadMore 上拉加载更多回调
 * Refresh对象为包装后的Iscroll对象，其他使用方法参加iscroll：http://iscrolljs.com
 */
(function($, IScroll) {
	if(!$) {
		throw new Error('no jQuery');
	}
	if(!IScroll) {
		throw new Error('no IScroll');
	}
	var Refresh = function(el, opation) {
		var _opation = {
			probeType: 3, //滚动事件触发等级
			bounce: true, //反弹
			momentum: true, //惯性
		}
		var myScroll = new IScroll(el, $.extend(opation, _opation));
		var iscroll = $(el).children(':first-child');
		var pullToRefresh = iscroll.find('.iscroll-refresh');
		var pullToLoadMore = iscroll.find('.iscroll-loadMore');
		var touchY0;
		var moveDown;
		var moveY = 0;
		iscroll.css('min-height', '100%');
		$(el).on('touchmove', function(e) {
			e.preventDefault();
		});
		if(!pullToRefresh.length) {
			pullToRefresh = $('<div class="iscroll-refresh start">\
						<div class="mui-spinner"></div>\
						<div class="mui-icon mui-icon-pulldown"></div>\
						<div class="text"></div>\
					</div>');

			iscroll.prepend(pullToRefresh);
		}
		if(!pullToLoadMore.length) {
			pullToLoadMore = $('<div class="iscroll-loadMore "></div>');

			iscroll.append(pullToLoadMore);
		}
		//下拉刷新状态读写
		pullToRefresh._type = 'start';
		Object.defineProperty(pullToRefresh, "type", {
			get: function() {
				return this._type;
			},
			set: function(type) {
				var types = ['start', 'loading', 'end'];
				var index = types.indexOf(type);

				for(var i = 0; i < types.length; i++) {
					if(index === i) {
						this.addClass(types[i]);
					} else {
						this.removeClass(types[i]);
					}
				}
				switch(type) {

					case 'loading':
						iscroll.css({
							'transition': 'transform 0.3s ease-out',
							'transform': 'translate3d(0px, ' + 14 + 'px, 0px) translateZ(0px)',
						});
						break;
					case 'start':
						if(this._type === 'loading') {
							iscroll.css({
								'transition': 'transform 0.3s ease-out',
								'transform': 'translate3d(0px, ' + 0 + 'px, 0px) translateZ(0px)',
							});
						}
						break;
				}
				this._type = type;
			}
		});
		// 上拉加载状态读写
		pullToLoadMore._type = '';
		Object.defineProperty(pullToLoadMore, "type", {
			get: function() {
				return this._type;
			},
			set: function(type) {
				var types = ['none', 'start', 'loading', 'end'];
				var index = types.indexOf(type);
				this._type = type;
				for(var i = 0; i < types.length; i++) {
					if(index === i) {
						this.addClass(types[i]);
					} else {
						this.removeClass(types[i]);
					}
				}
			}
		});
		//触摸记录
		var identifier;
		// 下拉刷新
		function touchmove(e) {
			var touches = e.originalEvent.changedTouches;
			var touchY;

			for(var i = 0; i < touches.length; i++) {
				var toucher = touches[i];
				if(toucher.identifier === identifier) {
					touchY = toucher.pageY;
					break;
				} else if(i === touches.length - 1) {
					e.stopPropagation();
					return;
				}
			}
			if(!moveDown) {
				if(touchY < touchY0) {
					iscroll.off('touchmove', touchmove);
					return;
				} else {
					moveDown = true;
				}
			}
			var moveY1 = ((touchY - touchY0) / 2) | 0;
			if(moveY1 !== moveY) {
				moveY = moveY1;
				iscroll.css('transform', 'translate(0px, ' + moveY + 'px) translateZ(0px)');
				//下拉刷新状态
				if(moveY > 14) {
					myScroll.pullToRefresh.type = 'end';
				} else {
					myScroll.pullToRefresh.type = 'start';

				}
			}
			//判断触摸超出了屏幕y轴，触发touchend
			// if(touchY>window.innerHeight){
			// 	console.log(touchY)
			// }
			e.stopPropagation();
		}
		//触摸结束
		function touchend(e) {
			identifier = null;
			iscroll.off('touchmove', touchmove);

			if(moveDown) {
				if(moveY > 44) {
					myScroll.pullToRefresh.type = 'loading';

					if(typeof myScroll.onPullToRefresh === 'function') {
						setTimeout(function() {
							myScroll.onPullToRefresh();
						}, 200);
					}
				} else {
					iscroll.css({
						'transition': 'transform 0.3s ease-out',
						'transform': 'translate3d(0px, ' + 0 + 'px, 0px) translateZ(0px)',
					});
				}
			}
		}
		iscroll.on('touchstart', function(e) {
			var toucher = e.originalEvent.changedTouches[0];
			if(identifier !== toucher.identifier) {
				if(identifier) {
					touchend(e);
				}
				identifier = toucher.identifier;
			}
			if(myScroll.y === 0) {
				touchY0 = toucher.pageY;
				moveDown = false;
				iscroll.on('touchmove', touchmove);
			}
			iscroll.css({
				'transition': 'none',
			});
		}).on('touchend', function(e) {
			var touches = e.originalEvent.changedTouches;
			for(var i = 0; i < touches.length; i++) {
				var toucher = touches[i];
				if(toucher.identifier === identifier) {
					touchend(e);
					break;
				}
			}
			if(moveDown) {
				e.stopPropagation();
			}
		}).on('touchcancel', function(e) {
			touchend(e);
		});
		// 上拉加载
		myScroll.on('scroll', function() {
			var num = myScroll.y;
			if((-num - 10) > -myScroll.maxScrollY && pullToLoadMore.type === 'start') {
				myScroll.pullToLoadMore.type = 'loading';
				if(typeof myScroll.onPullToLoadMore === 'function') {
					myScroll.onPullToLoadMore();
				}
			}
		});

		myScroll.pullToRefresh = pullToRefresh;
		myScroll.pullToLoadMore = pullToLoadMore;
		myScroll.onPullToRefresh = function() {
			console.log('onPullToRefresh');
		}
		myScroll.onPullToLoadMore = function() {
			console.log('onPullToLoadMore');
		}
		return myScroll;
	}
	window.Refresh = Refresh;
})(jQuery, IScroll);