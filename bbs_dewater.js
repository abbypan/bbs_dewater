var jq = jQuery || window.jQuery || $;

if(! jq) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = "http://code.jquery.com/jquery-latest.min.js";
        document.getElementsByTagName('head')[0].appendChild(script);
}

var $ = jQuery || window.jQuery || $;

add_dewater_banner();

function add_dewater_banner() {
        var xp = banner_path();
        $dewater_div = $('\
<div id="dewater_div_form" style="align:center;background: #cad6e1;">\
前<input id="max_page_num" name="max_page_num" size="5"/>页,\
前<input id="max_floor_num" name="max_floor_num" size="5"/>楼, \
每楼最少<input id="min_word_num" name="min_word_num" size="5"/>字,\
<input type="checkbox" id="only_poster" name="only_poster">只看楼主,\
<input type="checkbox" id="with_toc" name="with_toc" checked />生成目录, \
<input type="submit" value="脱水" onclick="dewater_thread()" />\
</div>');
$(xp).before($dewater_div);

                         $main_floors = $('\
<div id="dewater_div">\
<div id="dewater_title"></div>\
<div id="dewater_toc"></div>\
<div id="dewater_floors"></div></div>');
$(xp).before($main_floors);
    
}



    function get_dewater_option() {
        return {
            max_page_num: parseInt($("#max_page_num")[0].value),
            max_floor_num: parseInt($("#max_floor_num")[0].value),
            only_poster: $("#only_poster")[0].checked,
            with_toc: $("#with_toc")[0].checked,
            min_word_num: parseInt($("#min_word_num")[0].value)
        };

    }



    function get_page_floors(u) {
        $('#dewater_title').html("正在取 ：" + u);
        var floors_info = new Array();
        var fp = floor_path();
        $.ajax({
            type: "get",
            url: u,
            cache: false,
            async: false,
            beforeSend: function(jqXHR) {
                jqXHR.overrideMimeType('text/html; charset='+ page_charset());
            },
            success: function(data) {
                var $resp = $(data);

                $resp.find(fp).each(function() {
                    var bot = $(this);
                    var f_i = extract_floor_info(bot);
                    floors_info.push(f_i);
                });

            }
        });

        return floors_info;
    }
    

    function get_topic_url() {
        return window.location.href;
    }

    function set_topic(dst) {
        var tp = get_topic_name() ;
        var c = '<a href="' + get_topic_url() + '">' + tp + '</a>';
        $(dst).html(c);
        $('head').html('<meta content="text/html; charset=utf-8" http-equiv="Content-Type">' +
                       '<title>' + tp + '</title>');

    }

    function get_page_urls() {
        var num = get_page_num();

        $('#dewater_title').html("共 " + num + " 页");

        var url = get_topic_url();

        url = format_thread_url_1st(url);

        if (!num) return [url];

        var url_list = new Array();
        for (var i = 1; i <= num; i++) {
            var n_url = format_thread_url_ith(url, i);
            url_list.push(n_url);
        }
        return url_list;
    }

    function select_page_urls(option) {
        var page_urls = get_page_urls();

        if (!option.max_page_num) return page_urls;

        var urls = new Array();
        var n = 1;
        for (var i in page_urls) {
            if (n > option.max_page_num) break;
            var u = page_urls[i];
            urls.push(u);
            ++n;
        }
        return urls;
    }

    function is_floor_overflow(id, option) {
        if (!option.max_floor_num) return 0;
        if (id <= option.max_floor_num) return 0;
        return 1;
    }

    function get_thread_floors(option) {
        var main_floors = new Array();
        var select_urls = select_page_urls(option);
        for (var i in select_urls) {
            var u = select_urls[i];
            var f = get_page_floors(u);
            var flen = f.length;
            for (var j = 0; j < flen; j++) {
                var id = f[j].id;
                if (is_push_floor(main_floors, id)==false) continue;
                if (is_floor_overflow(id, option)) return main_floors;
                main_floors.push(f[j]);
            }
        }
        return main_floors;
    }

    function is_push_floor(floors_info, id){
        var len = floors_info.length;
        if(len<=0) return true;
        var last_id = parseInt(floors_info[len-1].id);
        if(id > last_id) return true;
        return false;
    }

    function is_skip_floor(f, opt) {
        if (opt.only_poster && (f.poster != opt.poster)) return 1;
        if (opt.min_word_num && (f.word_num < opt.min_word_num)) return 1;
        return;
    }

    function add_floor_toc(dst, f) {
        var html = '<p>' + f.id + '# <a href="#floor' + f.id + '">' + f.time + ' ' + f.poster + '</a></p>';
        $floor = $(html);
        $(dst).append($floor);
    }

    function add_floor_content(dst, f) {
        var html = '<div class="floor" id="floor' + f.id + '">' + 
            '<div class="chapter">№' + f.id + '<span class="star">☆☆☆</span>' + f.poster + '<span class="star">于☆☆☆</span>' + f.time + '<span class="star">留言☆☆☆</span></div>' + 
            '<div class="flcontent">' + f.content + '</div>' + 
            '</div>';
        $floor = $(html);
        $(dst).append($floor);
    }

    function set_dewater_css() {

        $('body').css({
            'font-size': 'medium',
            'font-family': 'Verdana, Arial, Helvetica, sans-serif',
            'margin': '1em 8em 1em 8em',
            'text-indent': '2em',
            'line-height': '145%' 
        });

        $('.chapter,#dewater_title,#dewater_toc').css({
            'margin': '0.8em 0.2em 2.8em 0.2em',
            'text-indent': '0em',
            'padding-bottom': '0.25em'
        });

        $('.chapter').css({
            'border-top': '0.2em solid #ee9b73',
        });

        $('#dewater_title,#dewater_toc').css({
            'border-bottom': '0.2em solid #ee9b73',
        });

        $('#dewater_title').css({
            'text-align': 'center',
            'font-size': 'x-large',
        });

        $('.star').css({
            'color': '#99cc00',
        });
    }

    function get_topic_poster(main_floors){
        return main_floors[0].poster;
    }


    function dewater_thread() {
        var option = get_dewater_option();
        var main_floors = get_thread_floors(option);
        option.poster = get_topic_poster(main_floors);

        set_topic('#dewater_title');

        $('#dewater_toc').html('');
        $('#dewater_floors').html('');

        for (var i in main_floors) {
            var f = main_floors[i];
            if (is_skip_floor(f, option)) continue;

            if (option.with_toc) add_floor_toc('#dewater_toc', f);
            add_floor_content('#dewater_floors', f);
        }

        $('body').html($('#dewater_div').html());
        set_dewater_css();
    }
