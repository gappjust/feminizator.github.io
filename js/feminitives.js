
// Copyright (C) 2016, Maxim Lihachev, <envrm@yandex.ru>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// [ ] TODO: валидация
// [ ] TODO: адаптивная вёрстка

//------------------------------------------------------------------------------

//Вывод справки с примерами использования
function show_help() {
	HTML.content().innerHTML = "<div id='definition-help'>"
	+ "<p>ФЕМИНИТИВЫ – это слова женского рода, "
	+ "альтернативные или парные аналогичным понятиям мужского рода, "
	+ "относящимся ко всем людям независимо от их пола.</p>"
	+ "<p>При помощи <a href='TODO'>этой небольшой программы</a>,"
	+ "реализующей феминистическую логику, "
	+ "вы сами можете создать феминитивы к любому слову.</p>"
	+ "<p>Попробуйте: "
	+ "<a href=javascript:tr('автор');>автор</a>, "
	+ "<a href=javascript:tr('врач');>врач</a>.</p>"
	+ "</div>";
}

//------------------------------------------------------------------------------

//Иерархия элементов на странице
var HTML = {
	container: "",
	_select:    function(element) { return document.getElementById(this.container + "-" + element); },
	input:      function() { return this._select("word"); },
	dict:       function() { return this._select("dict"); },
	content:    function() { return this._select("content"); },
	full:       function() { return this._select("full"); },
	image:      function() { return this._select("image"); }
}

var FEM = {};

//Правила создания феминитивов
FEM.endings = {
	'ка'   : [
			['[аео]р', 0],
			['ан', 0],
			['рг', 1],
			['ст', 0], //специалист -> специалистка
			['ец', 2]  //канадец -> канадка
		],
	'иня'  : [
			['[аео]р', 0],
			['[ои]к', 0],
			['со', 1], //колесо -> колесиня
			['ог', 0], //биолог -> биологиня
			['рг', 0],
			['ач', 0], //врач -> врачиня
			['ст', 0], //специалист -> специалистиня
			['од', 0], //метод -> методиня
			['ец', 2]  //канадец -> канадиня
		],
	'киня' : [
			['[аео]р', 0],
			['ок', 0],
			['ст', 0], //специалист -> специалисткиня
			['ан', 0]
		],
	'есса' : [
			['[аео]р', 0],
			['[ои]к', 0],
			['ог', 0], //биолог -> биологиня
			['ан', 0],
			['рг', 0],
			['ач', 0], //врач -> врачесса
			['ый', 2], //учёный -> учёнесса
			['ст', 0], //специалист -> специалистесса
			['од', 0], //метод -> методесса
			['ец', 2]  //канадец -> канадесса
		],
	'ица'  : [
			['[аео]р', 0],
			['уч', 0],
			['ик', 2],
			['ог', 0], //биолог -> биологиня
			['ан', 0],
			['ив', 0],
			['рг', 0],
			['ач', 0], //врач -> врачица
			['ст', 3], //специалист -> специалица
			['од', 0], //метод -> методица
			['ец', 2]  //канадец -> канадица
		],
	'ница' : [
			['ль', 0],
			['ец', 2]  //канадец -> канадница
		],
	'ая' : [
			['[ыио]й', 2], //учёный -> учёная, знающий -> знающая
		],
	//----- ДАЛЬШЕ ИДЁТ ШИЗА -----
	'ии' : [
			['и[ия]', 2], //металлургии -> металлург_ии, произведения -> произведении
		],
	'ми' : [
			['ми', 2]  //знаниями -> знания_ми
		],
	'ой' : [
			['го', 3]  //художественного -> художественн_ой
		],
	'инь' : [
			['ей', 2]  //людей -> люд_ей
		],
	'ти' : [
			['ти', 2]  //области -> облас_ти
		],
	'ю' : [
			['ью', 1]  //матерью -> матерь_ю
		],
};

//Слова со специфичными определениями
FEM.exceptions = {
	'феминист' : [['профеминист', 'союзник'], "Мифическое создание, якобы поддерживающее феминизм."]
}

//Проверка на исключение
FEM.exceptions.contains = function(word) {
	return Object.keys(this).indexOf(word) === -1 ? false : true;
}

//Список значений
FEM.exceptions.feminitives  = function(word) {
	return [random_word(this[word][0]), this[word][0]];
}

//Дефиниция слова-исключения
FEM.exceptions.definition  = function(word) {
	return this[word][1];
}

//Слова для замены
FEM.words = {
	'тот'     : 'т_а',
	'того'    : 'т_у',
	'кто'     : 'котор_ая',
	'её'      : 'е_ё',
	'ее'      : 'е_е',
	'ий'      : 'ая',
	'человек' : 'человека',
	'муж'     : 'жен'
};

FEM.words.convert = function(string) {
	for (var fem_w in this) {
		string =  string.replace(new RegExp(fem_w, "ig"), this[fem_w])
				.replace(/(.)/, s => s.toUpperCase());
	}
	return string;
}

//------------------------------------------------------------------------------

//Первый элемент списка - окончание (в виде регулярного выражения)
function ending(tuple) {
	return new RegExp("^.*" + tuple[0] + "$", "i");
}

//Второй элемент списка - смещение
function offset(tuple) {
	return tuple[1];
}

//Случайный элемент списка
function random_word(wordlist) {
	return wordlist[Math.floor(Math.random() * wordlist.length)];
}

//Оборачивание в <span> с указанным классом
function html_wrap(str, cl) {
	return "<span class=\"" + cl + "\">" + str + "</span>";
}

//Цветовое выделение текста
function css_end(ending)  { return html_wrap(ending, "ending");  }

//Символ gender gap
function css_gender_gap() { return html_wrap(' \u26A7 ', "queer"); }

//Конструирование феминитива с gender_gap
function construct_feminitive(stem, ending, gap) {
	return gap ? stem + css_gender_gap() + css_end(ending) : stem + "_" + ending;
}

//Сохранение изображения с феминитивом
function download_image() {
	html2canvas(HTML.image(), {
		onrendered: function (canvas) {
			var a = document.createElement('a');
			a.href = canvas.toDataURL();
			a.download = HTML.content().innerHTML + '.png';
			a.click();
		}
	});
};

//Создание феминитива
function make_feminitives(word) {
	var stem           = "";             //Основа слова
	var current_ending = word.slice(-2); //Текущее окончание
	var feminitives    = new Array();    //Массив феминитивов
	var femicards      = new Array();    //Массив феминитивов для карточки

	for (var fem_ending in FEM.endings) {
		FEM.endings[fem_ending].forEach(function(end) {
			if (ending(end).test(current_ending)) {
				//Удаление лишних букв из основы
				stem = offset(end) == 0 ? word : word.slice(0, -offset(end));

				//Добавление фем-варианта слова в массив
				feminitives.push(construct_feminitive(stem, fem_ending, 1));
				femicards.push(construct_feminitive(stem, fem_ending, 0));
			}
		});
	};
	//При отсутствии феминитивов считать корректным исходное слово
	return [random_word(femicards) || word, feminitives];
}

//Запрос значения слова в викисловаре
function get_wiktionary(term) {
	var cors_url = "https://cors.now.sh/";
	var wiki_url = cors_url + "https://ru.wiktionary.org/w/index.php?title=" + term + "&action=raw";

	var definition = "";

	var parseWikiPage = function(page) {
		var wiki = page.split("\\n");

		for(var line = 0; line < wiki.length; line++){
			if (wiki[line].match(/^.*==== Значение ====.*$/)) {
				console.log(wiki[line+1]); //DEBUG
				definition = wiki[line+1]
				.replace(/^# ?/, "")                         //# дефиниция
				.replace(/\[{2}([^\]\|]*)\]{2}/g, "$1")      //[[1]]
				.replace(/\[{2}[^\|]*\|([^\]]*)\]{2}/g, "$1") //[[1|2]]
				.replace(/\[{2}([^\]\|]*)\}{2}/g, "$1")      //{{1}}
				.replace(/\{{2}[^\{\}]*\}{2} ?/g, "")        //{{1|2}}
				.replace(/\{{2}[^\{\}]*\}{2} ?/g, "")        //~ : возможна вложенность
				.replace(/\[[0-9]{1,}\]/g, "")               //ссылки [n]
				.replace(/^ *, */g, "")                      //^, ...
				.replace(/ ?$/,".")                          //Точка в конце предложения
				break;
			}
		}

		//Разделение дефиниции на массив слов и знаков препинания
		var current_word = "";
		var tokens = new Array();
		for (var l = 0; l <= definition.length; l++) {
			if (/[^\wа-яА-Я]/.test(definition[l])) {
				tokens.push(current_word);
				tokens.push(definition[l]);
				current_word = "";
				continue;
			} else {
				current_word += definition[l];
			}
		}

		//Феминизация слов
		var true_definition = new Array();
		tokens.forEach(function(word) {
			true_definition.push((word.length > 3) ? make_feminitives(word)[0] : word);
		});

		//Замена местоимений, предлогов и проч.
		var article = FEM.words.convert(true_definition.join(""));

		//DEBUG
		console.log(tokens.join(""));
		console.log(true_definition);
		console.log(article);

		HTML.full().innerHTML = article;
	}

	xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			parseWikiPage(xmlhttp.responseText);
		}
	}

	xmlhttp.open("GET", wiki_url, true);
	xmlhttp.send();
}

//Создание и вывод феминитива
function tr(word) {
	//Исходное слово
	var wd = word || HTML.input().value.trim().toLowerCase().split(" ")[0];
	var feminitives = "";

	HTML.dict().innerHTML = "";
	HTML.content().innerHTML = "";

	//Вывод информации
	if (!wd) {
		show_help();
	} else if (FEM.exceptions.contains(wd)) {
		HTML.full().innerHTML = FEM.exceptions.definition(wd);
		feminitives = FEM.exceptions.feminitives(wd);
	} else {
		get_wiktionary(wd);
		feminitives = make_feminitives(wd);
	}
	//Вывод информации
	HTML.input().value = wd;
	HTML.content().innerHTML = feminitives[0].replace(/(.)/, s => s.toUpperCase());
	HTML.dict().innerHTML    = feminitives[1].join(" | ")
				|| "Это слово и так прекрасно. Оставим его как есть.";
}

//------------------------------------------------------------------------------

//Инициализация с разбором адресной строки
function init(container) {
	//Задание базового id для всех элементов
	HTML.container = container;

	//Конвертирование по нажатию <Enter>
	HTML.input().addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode == 13) {
			tr();
		}
	});

	//Разбор адреса
	querySt = function(option) {
		gy = window.location.search.substring(1).split("&");

		for (i=0; i < gy.length; i++) {
			ft = gy[i].split("=");
			if (ft[0] == option) {
				return ft[1];
			}
		}
	}

	var query = decodeURIComponent(querySt("word"));
	if (query !== 'undefined') {
		HTML.input().value = query.replace(/\+/g," ");
		tr();
	} else {
		show_help();
	}
}

