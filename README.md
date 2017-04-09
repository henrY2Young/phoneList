# phoneList
基于vue+Iscroll实现类电话簿下拉滑动点击跳转的列表

# 简介
这是一个类似于电话簿的列表，主要功能在于点击右侧字母时跳转到相对应的列表上，运用的框架是vue+Iscroll，同时也利用了gulp编译less等
## 技术实现要点：
  在请求数据时全部请求，然后在渲染列表时候利用延迟加载的方式，每次加载10张图片，这样数据量很大时，也会很流畅，
## 改进点：
  可以利用localStore本地存储一部分数据，当本地数据存在时就不向server请求数据






![例子](https://github.com/henrY2Young/phoneList/blob/master/kk%202017-04_clip.gif)
