const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const https = require('https');

// 豆瓣电影排行榜
let url = 'https://movie.douban.com/chart';

https.get(url, (res) => {
	let html = '';
	let movies = [];
	res.setEncoding('utf-8');
	res.on('data', (ht) => {
		html += ht;
	})
	res.on('end',() => {
		let $ = cheerio.load(html);
		$('.item').each(function(){
			let picUrl = $('a.nbg img', this).attr('src');
			let movie = {
				title: $('a.nbg', this).attr('title'),
				star: $('.star .rating_nums', this).text(),
				link: $('a.nbg', this).attr('href'),
				picUrl: /^http/.test(picUrl) ? picUrl : 'https://localhost:8080/' + picUrl
			}
			movies.push(movie);
			downloadImg('img/', movie.picUrl);
		})
		console.log(movies);
		saveData('data/', movies);
	})
}).on('error', (err) => {
	console.log(err);
})

function saveData(path, movies){
	fs.exists(path, (exists) => {
		if (exists) {
			// 文件夹存在
			fs.writeFile(path + 'movies.json', JSON.stringify(movies), {'flag': 'w+'}, (err) => {
				if (err) return console.log(err);
				console.log('Data Saved');
			})
		}else {
			// 文件夹不存在
			fs.mkdir(path, (err) => {
				if (err) return console.log(err);
				fs.writeFile(path + 'movies.json', JSON.stringify(movies), {'flag': 'w+'}, (err) => {
					if (err) return console.log(err);
					console.log('Data Saved');
				})
			})
		}
	})
	
}

function downloadImg(imgDir, url){
	fs.exists(imgDir, (exists) => {
		console.log('exists: ', exists);
		if (exists) {
			// 文件夹存在
			https.get(url, (res) => {
				let img = '';
				res.setEncoding('binary');
				res.on('data', (data) => {
					img += data;
				})
				res.on('end', () => {
					fs.writeFile(imgDir + path.basename(url), img, 'binary', (err) => {
						if(err) return console.log(err);
						console.log('Image downloaded: ', path.basename(url));
					})
				})
			}).on('err', (err) => {
				console.log(err);
			})
		}else {
			// 文件夹不存在
			fs.mkdir(imgDir, (err) => {
				// if (err) return console.log(err);
				https.get(url, (res) => {
					let img = '';
					res.setEncoding('binary');
					res.on('data', (data) => {
						img += data;
					})
					res.on('end', () => {
						fs.writeFile(imgDir + path.basename(url), img, 'binary', (err) => {
							if(err) return console.log(err);
							console.log('Image downloaded: ', path.basename(url));
						})
					})
				}).on('err', (err) => {
					console.log(err);
				})
			})
		}
	})
	
}