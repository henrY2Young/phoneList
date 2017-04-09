/*
 * gulp 发布
 * 
 * gulp less 重新编译css文件夹下所以less为min.css
 * */
var gulp = require('gulp');
var clean = require('gulp-clean');
var imagemin = require('gulp-imagemin');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var stream = require('event-stream');
var child_process = require('child_process');
var less = require('gulp-less');
var cleancss = require('gulp-clean-css');
var rename = require('gulp-rename');
var lec = require('gulp-line-ending-corrector');
var PluginError = gutil.PluginError;
var autoprefixer = require('gulp-autoprefixer');
var map = stream.map;
//[配置文件]
var config = {
	build_path: '../webroot',
	rev_path: 'temp/rev_json',
	debug: false,

};
gulp.task('html', ['css', 'js', 'img', 'fonts', 'media'], function() {
	return gulp.src(['*.html', config.rev_path + '/**/*.json'])
		.pipe(htmlmin({
			removeComments: !config.debug, //清除HTML注释
			removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
		}))
		.pipe(revCollector())
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(gulp.dest(config.build_path));
});
gulp.task('css', function() {
	return gulp.src('css/**/*.css')
		.pipe(rev())
		.pipe(gulp.dest(config.build_path + '/css'))
		.pipe(rev.manifest())
		 pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
		.pipe(gulp.dest(config.rev_path + '/css'));
});
gulp.task('js', function() {
	if(config.debug) {
		return gulp.src('js/**/*.js')
			.pipe(lec({
				eolc: 'CRLF'
			}))
			.pipe(rev())
			.pipe(gulp.dest(config.build_path + '/js'))
			.pipe(rev.manifest())
			.pipe(gulp.dest(config.rev_path + '/js'));
	} else {
		return gulp.src('js/**/*.js')
			.pipe(lec({
				eolc: 'CRLF'
			}))
			.pipe(rev())
			.pipe(uglify())
			.pipe(gulp.dest(config.build_path + '/js'))
			.pipe(rev.manifest())
			.pipe(gulp.dest(config.rev_path + '/js'));
	}

});
gulp.task('img', function() {
	if(config.debug) {
		return gulp.src('img/**').pipe(gulp.dest(config.build_path + '/img'));
	} else {
		return gulp.src('img/**').pipe(imagemin()).pipe(gulp.dest(config.build_path + '/img'));
	}
});
gulp.task('media', function() {
	return gulp.src('media/**').pipe(gulp.dest(config.build_path + '/media'));
});
gulp.task('fonts', function() {
	return gulp.src('fonts/**').pipe(gulp.dest(config.build_path + '/fonts'));
});
//清除js和css
gulp.task('cleanCss', function() {
	return gulp.src([config.build_path + '/css/**/*.css'], {
		read: false
	}).pipe(clean({
		force: true
	}));
});
gulp.task('cleanJs', function() {
	return gulp.src([config.build_path + '/js/**/*.js'], {
		read: false
	}).pipe(clean({
		force: true
	}));
});
// 清除输出文件夹
gulp.task('clean', ['cleanCss', 'cleanJs'], function() {
	return gulp.src([config.rev_path], {
		read: false
	}).pipe(clean({
		force: true
	}));
});
//默认的任务-生成发布资源
gulp.task('default', ['clean'], function() {
	return gulp.start('html');
});
//重新编译less
gulp.task('less', function() {
	return gulp.src('css/*.less')
		.pipe(less())
		.pipe(cleancss())
		.pipe(rename({
			suffix: '.min'
		})).pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(gulp.dest('css'));
});
gulp.task('build-less', function() {
	return gulp.src('css/*.less')
		.pipe(less())
		.pipe(cleanCss())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('css'));
});

gulp.task('watch-less', function() {
	gulp.watch('css/*.less', ['less']);
});