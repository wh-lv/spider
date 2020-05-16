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
		saveData('data/movies.json', movies);
	})
}).on('error', (err) => {
	console.log(err);
})

function saveData(path, movies){
	fs.writeFile(path, JSON.stringify(movies), (err) => {
		if (err) return console.log(err);
		console.log('Data Saved');
	})
}

function downloadImg(imgDir, url){
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
}

