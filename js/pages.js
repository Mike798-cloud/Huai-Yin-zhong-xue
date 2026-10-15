/* ============================================================
   槐隐学园 · 页面渲染与交互
   ============================================================ */

var Pages = {
  data:null,
  afterBindings:[],

  init:function(){
    this.data = {
      stars: buildStars(),
      board: buildBoard(),
      studentDb: buildStudentDb(),
      ranks: buildRanks()
    };
  },

  dispatch:function(rt){
    var p = rt.path;
    switch(p){
      case "/": return this.home(rt);
      case "/about.html": return this.about(rt);
      case "/news.html": return this.news(rt);
      case "/star.html": return this.star(rt);
      case "/teach.html": return this.teach(rt);
      case "/board.html": return this.board(rt);
      case "/radio.html": return this.radio(rt);
      case "/student.html": return this.student(rt);
      case "/admin.html": return this.admin(rt);
      case "/verify.html": return ArchiveTools.verify(rt);
      case "/search.html": return ArchiveTools.searchPage(rt);
      case "/recovery.html": return ArchiveTools.recovery(rt);
      case "/diary.html": return this.diaryPage(rt);
      case "/about-site.html": return this.aboutSite(rt);
      case "/sitemap.html": return this.sitemap(rt);
      default: return null;
    }
  },

  /* 通用侧栏 */
  sidebar:function(active){
    var quick = [
      ["学籍查询","/student.html"],
      ["成绩查询","/student.html?tab=score"],
      ["留言板","/board.html"],
      ["广播站","/radio.html"]
    ];
    var qhtml = quick.map(function(q){
      return '<li><a href="'+q[1]+'" data-go="'+q[1]+'">'+q[0]+'</a></li>';
    }).join("");
    return '<div class="site-side">'+
      '<div class="side-box"><h3>站内搜索</h3><div class="sb-body">'+
        '<div class="search-box"><input id="sideSearch" placeholder="输入关键词…"><button id="sideSearchBtn">搜索</button></div>'+
        '<div class="board-search-hint" id="sideSearchHint"></div>'+
      '</div></div>'+
      '<div class="side-box"><h3>快速入口</h3><div class="sb-body"><ul>'+qhtml+'</ul></div></div>'+
      '<div class="side-box"><h3>本周通知</h3><div class="sb-body"><ul>'+
        HOME_NOTICES.map(function(n){return '<li>'+n+'</li>';}).join("")+
      '</ul></div></div>'+
    '</div>';
  },

  bindSidebar:function(root){
    var btn = root.querySelector("#sideSearchBtn");
    var input = root.querySelector("#sideSearch");
    var hint = root.querySelector("#sideSearchHint");
    if(btn){
      var doSearch = function(){
        var v=(input.value||"").trim();Audio.click();
        if(v)Shell.go("/search.html?q="+encodeURIComponent(v));
        else{hint.textContent="请输入新闻、文件或栏目中的关键词。";input.focus();}
      };
      btn.onclick = doSearch;
      input.onkeydown = function(e){ if(e.keyCode===13) doSearch(); };
    }
  },

  /* ============ 首页 ============ */
  home:function(rt){
    Game.visit("home");
    var slides = [
      ["assets/images/carousel-sports.jpg","我校2007年秋季运动会隆重举行"],
      ["assets/images/carousel-opening.jpg","2007年秋季开学典礼"],
      ["assets/images/carousel-plaque.jpg","我校获颁省级幸福校园示范校牌匾"]
    ];
    var slideHtml = slides.map(function(s,i){
      var hot = (i===2 && Game.ngplus) ? '<span class="h-corner-hot" id="frag1Hot"></span>' : "";
      return '<div class="slide'+(i===0?" on":"")+'" style="background-image:url('+s[0]+')">'+hot+'<div class="cap">'+s[1]+'</div></div>';
    }).join("");

    var newsHtml = HOME_NEWS.map(function(n){
      return '<li><a href="/news.html?id='+n.id+'" data-go="/news.html?id='+n.id+'">'+n.headline+'</a>'+
             '<span class="n-date">'+n.date+'</span></li>';
    }).join("");

    /* 幸福之星预览：第二名浅灰 */
    var star = this.data.stars.slice(0,5);
    var grayCls = Game.has("deletedMsg")||Game.has("recordFound")||Game.has("audioSecret") ? "gray-name stronger" : "gray-name";
    var starRows = star.map(function(s,i){
      if(i===1){
        return '<tr><td>'+s.rank+'</td><td>'+s.cls+'</td><td class="'+grayCls+'" id="homeGrayName" title="">　</td><td>'+s.reason+'</td></tr>';
      }
      return '<tr><td>'+s.rank+'</td><td>'+s.cls+'</td><td>'+s.name+'</td><td>'+s.reason+'</td></tr>';
    }).join("");

    var inner =
      '<div class="site-body">'+
        '<div class="site-main">'+
          '<div class="h-carousel" id="carousel"><div class="slides">'+slideHtml+'</div>'+
            '<div class="dots">'+[0,1,2].map(function(i){return '<span class="dot'+(i===0?" on":"")+'" data-slide="'+i+'">'+(i+1)+'</span>';}).join("")+'</div>'+
          '</div>'+
          '<div class="h-quick">'+
            '<div class="q-btn" data-go="/student.html">学籍查询</div>'+
            '<div class="q-btn" data-go="/student.html?tab=score">成绩查询</div>'+
            '<div class="q-btn" data-go="/board.html">留言板</div>'+
            '<div class="q-btn" data-go="/radio.html">校园之声</div>'+
          '</div>'+
          '<div class="h-two-col">'+
            '<div class="h-news"><h3>校园新闻 <a href="/news.html" data-go="/news.html">更多»</a></h3><ul>'+newsHtml+'</ul></div>'+
            '<div class="h-notice"><h3>本周通知</h3><ul>'+
              HOME_NOTICES.map(function(n){return '<li>· '+n+'</li>';}).join("")+
            '</ul></div>'+
          '</div>'+
          '<div class="h-stars" style="margin-top:12px;">'+
            '<h3>本周幸福之星预览 <a href="/star.html" data-go="/star.html">完整名单»</a></h3>'+
            '<table>'+starRows+'</table>'+
          '</div>'+
        '</div>'+
        this.sidebar("home")+
      '</div>';
    return Shell.frame(inner, "index");
  },

  /* ============ 学校概况 ============ */
  about:function(rt){
    Game.visit("about");
    var gallery = [
      ["assets/images/campus-gate.jpg","学校大门"],
      ["assets/images/campus-building.jpg","教学楼"],
      ["assets/images/campus-tree.jpg","校园老槐树"],
      ["assets/images/campus-canteen.jpg","学生食堂"],
      ["assets/images/campus-lab.jpg","实验楼外景"]
    ];
    var galHtml = '<div class="gallery">'+gallery.map(function(g,i){
      if(i===4){
        return '<div class="g-item"><div class="g-frame"><img src="'+g[0]+'" alt="'+g[1]+'">'+
          '<span class="g-roof-hot" id="roofHot"></span></div><div class="g-cap">'+g[1]+'</div></div>';
      }
      return '<div class="g-item"><div class="g-frame"><img src="'+g[0]+'" alt="'+g[1]+'"></div><div class="g-cap">'+g[1]+'</div></div>';
    }).join("")+'</div>';

    var graduates = [
      ["1998届","赵　明","知名工程师"],
      ["2001届","陈　雪","高校教师"],
      ["2005届","周　航","优秀毕业生"],
      ["2007届","林　晚","<span style='font-size:11px;color:#bbb;'>——</span>"],
      ["2008届","王　毅","在读"],
    ];
    var graHtml = graduates.map(function(g){
      if(g[1].indexOf("林")>=0){
        return '<tr><td>'+g[0]+'</td><td><span class="faint-name" id="faintGrad">林晚</span></td><td>——</td></tr>';
      }
      return '<tr><td>'+g[0]+'</td><td>'+g[1]+'</td><td>'+g[2]+'</td></tr>';
    }).join("");

    var teacherHtml = TEACHERS.map(function(t){
      var note = t.note ? '<div class="teacher-note">'+t.note+'</div>' : "";
      return '<tr><td style="width:150px;">'+t.cls+'</td><td style="width:90px;">'+t.name+'</td><td>'+t.desc+note+'</td></tr>';
    }).join("");

    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 学校概况</div>'+
      '<div class="site-body"><div class="site-main">'+
        '<div class="article-box">'+
          '<div class="page-title">学校简介</div>'+
          SCHOOL_INTRO.map(function(p){return '<p>'+p+'</p>';}).join("")+
          '<div class="section-h">校园风光</div>'+
          galHtml+
          '<div class="section-h">历届优秀毕业生</div>'+
          '<table class="data-table"><tbody><tr><th>毕业届别</th><th>姓名</th><th>去向</th></tr>'+graHtml+'</tbody></table>'+
          '<div class="section-h">师资力量</div>'+
          '<table class="data-table"><tbody>'+teacherHtml+'</tbody></table>'+
          '<div class="section-h">办学设施</div>'+
          '<p>学校建有教学楼、实验楼、图书馆、学生食堂、宿舍楼各一栋，配备微机室2间、多媒体教室8间、理化生实验室6间。操场西侧的老槐树被师生亲切地称为“槐隐的根”，是历届毕业生合影的首选地点。</p>'+
        '</div>'+
      '</div>'+this.sidebar("about")+'</div>';
    return Shell.frame(inner, "about");
  },

  /* ============ 新闻中心 ============ */
  news:function(rt){
    Game.visit("news");
    var q = rt.q;
    if(q.id){
      var n = NEWS.filter(function(x){return x.id===q.id;})[0];
      if(!n) return Shell.frame('<div class="article-box">未找到该新闻。</div>', "news");
      var bodyHtml = n.body.map(function(p,idx){
        var cls = "";
        if(n.overlay && p.indexOf("昂扬向上")>=0){
          return '<p class="over-sent" data-overlay="'+n.overlay+'">'+p+'</p>';
        }
        if(n.id==="n07"){
          p = p.replace(/林晚/g,'<span class="strike-name">林晚</span>');
        }
        return '<p>'+p+'</p>';
      }).join("");
      var inner =
        '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; <a href="/news.html" data-go="/news.html">新闻中心</a> &gt; 正文</div>'+
        '<div class="site-body" style="position:relative;"><div class="site-main">'+
          '<div class="article-box">'+
            '<h2>'+n.headline+'</h2>'+
            '<div class="meta">发布时间：'+n.date+'　来源：槐隐学园办公室</div>'+
            bodyHtml+
            '<div class="back-up"><button class="ie-btn" data-go="/news.html">返回新闻列表</button></div>'+
          '</div>'+
        '</div>'+this.sidebar("news")+'</div>';
      return Shell.frame(inner, "news");
    }

    var rows = NEWS.map(function(n){
      return '<div class="nl-row'+(n.hot?' headline':'')+'"><span class="nl-date">'+n.date+'</span>'+
        '<a href="/news.html?id='+n.id+'" data-go="/news.html?id='+n.id+'">'+n.headline+'</a></div>';
    }).join("");
    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 新闻中心</div>'+
      '<div class="site-body" style="position:relative;"><div class="site-main">'+
        '<div class="section-h" style="margin-top:0;">新闻列表</div>'+
        '<div class="news-list">'+rows+'</div>'+
        '<div class="section-h">通知公告栏</div>'+
        '<div class="article-box" style="position:relative;">'+
          '<p>· 关于2007年秋季作息时间调整的通知</p>'+
          '<p>· 关于规范学生仪容仪表的通知</p>'+
          '<p>· 关于幸福指数月度统计的通知</p>'+
          '<p>· 关于实验楼暂停开放的通知（9月7日—9月9日）</p>'+
          '<span class="paperclip" id="paperclip" title=""></span>'+
        '</div>'+
      '</div>'+this.sidebar("news")+'</div>';
    return Shell.frame(inner, "news");
  },

  /* ============ 幸福之星公示 ============ */
  star:function(rt){
    Game.visit("star");
    var page = parseInt(rt.q.page||"1",10);
    if(page<1) page=1; if(page>3) page=3;
    var rows = this.data.stars.slice((page-1)*15, page*15);
    var trHtml = rows.map(function(s){
      if(s._gray){
        var cls = "gray-row-name";
        if(Game.has("recordFound")) cls += " underlined";
        return '<tr><td>'+s.rank+'</td><td>'+s.cls+'</td><td class="'+cls+'" id="starGrayRow">　</td><td>——</td><td>　</td></tr>';
      }
      return '<tr><td>'+s.rank+'</td><td>'+s.cls+'</td><td>'+s.name+'</td><td>'+s.reason+'</td><td>'+s.status+'</td></tr>';
    }).join("");
    if(Game.has("audioSecret") && page===3){
      trHtml += '<tr class="ghost-row"><td>　</td><td>　</td><td>　</td><td>　</td><td>　</td></tr>';
    }

    var pgBtns = [1,2,3].map(function(i){
      return '<span class="pg'+(i===page?" on":"")+'" data-go="/star.html?page='+i+'">'+i+'</span>';
    }).join("");

    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 德育工作 &gt; 幸福之星公示</div>'+
      '<div class="site-body"><div class="site-main">'+
        '<div class="article-box">'+
          '<div class="page-title">本周幸福之星公示名单</div>'+
          '<table class="data-table" id="starTable"><thead><tr>'+
            '<th style="width:60px;">排名</th><th style="width:130px;">班级</th><th style="width:100px;">姓名</th><th>评选理由</th><th style="width:90px;">公示状态</th>'+
          '</tr></thead><tbody>'+trHtml+'</tbody></table>'+
          '<div id="frag2Hot" style="height:40px;"></div>'+
          '<div class="pager">'+pgBtns+'</div>'+
          '<div class="table-note" id="starNote">特殊学生不纳入评选<span style="position:relative;">'+
            '<span class="hidden-underlay" style="position:absolute;left:0;top:0;opacity:0;white-space:nowrap;">她不算在里面</span></span>'+
          '</div>'+
          '<div style="margin-top:14px;font-size:12px;color:#666;">公示说明：本名单由各班民主评议与幸福指数系统综合评定，公示期三天，如有异议请联系德育处。</div>'+
          '<div class="back-up"><button class="ie-btn" data-go="/">返回首页</button></div>'+
        '</div>'+
      '</div>'+this.sidebar("star")+'</div>';
    return Shell.frame(inner, "star");
  },

  /* ============ 教学教研 ============ */
  teach:function(rt){
    Game.visit("teach");
    var docHtml = TEACH_DOCS.map(function(d,i){
      var ico = d.broken ? '<span class="file-icon xls"></span>' : '<span class="file-icon"></span>';
      return '<div class="file-row">'+ico+
        '<a href="javascript:void(0)" data-doc="'+i+'" data-name="'+d.name+'">'+d.name+'</a>'+
        '<span style="color:#888;font-size:12px;margin-left:auto;">'+d.size+'</span>'+
        '<span style="color:#888;font-size:12px;width:90px;text-align:right;">'+d.date+'</span>'+
        '</div>';
    }).join("");

    var recHtml = TEACH_RECORDS.map(function(r){
      var content = r[2]==="smear"
        ? r[1]+'<span class="redacted" style="display:inline-block;width:36%;height:1.05em;vertical-align:middle;margin-left:4px;">内容封存</span>'
        : r[1];
      return '<div class="file-row" style="cursor:text;"><span style="color:#666;width:100px;flex:0 0 100px;">'+r[0]+'</span><span>'+content+'</span></div>';
    }).join("");

    var essayHtml = ESSAY.body.map(function(p){return '<p>'+p+'</p>';}).join("");

    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 教学教研</div>'+
      '<div class="site-body"><div class="site-main">'+
        '<div class="article-box">'+
          '<div class="section-h" style="margin-top:0;">优秀作业展示 · 高二语文</div>'+
          '<h2 style="cursor:pointer;" id="essayTitle" title="">《'+ESSAY.title+'》</h2>'+
          '<div class="meta">作者：佚名（高二3班）</div>'+
          essayHtml+
          '<div class="section-h">课件下载区</div>'+
          docHtml+
          '<div class="section-h">教研组会议记录</div>'+
          recHtml+
        '</div>'+
      '</div>'+this.sidebar("teach")+'</div>';
    return Shell.frame(inner, "teach");
  },

  /* ============ 家长留言板 ============ */
  board:function(rt){
    Game.visit("board");
    var q = rt.q;
    var page = parseInt(q.page||"1",10);
    var cat = q.cat || "全部";
    var hidden = q.hidden==="1";
    var html = "";

    if(hidden){
      Game.setFlag("hiddenPage4");
      Game.setFlag("classClue");
      var rows = BLOCKED_MSGS.map(function(m,i){
        var needle = (i===0 && Game.ngplus) ? '<span class="needle-paper" id="frag3Hot" title=""></span>' : "";
        return '<tr class="board-row'+(Game.has("noteOverlay")?" blood-corner":"")+'">'+
          '<td style="width:44px;position:relative;">'+needle+'<div class="avatar">匿</div></td>'+
          '<td style="width:130px;"><span class="nick">'+m[0]+'</span></td>'+
          '<td style="width:70px;" class="time">'+m[1]+'</td>'+
          '<td>'+m[2]+'</td>'+
          '<td style="width:100px;"><span class="status-tag">审核不通过</span></td>'+
        '</tr>';
      }).join("");
      html = this.boardFrame(rt,
        '<div class="article-box" style="background:#fff;">'+
          '<table class="board-table"><thead><tr><th></th><th>昵称</th><th>时间</th><th>内容</th><th>状态</th></tr></thead><tbody>'+
          rows+
          '</tbody></table>'+
          this.boardPager(4,true,cat)+
          '<div class="board-online"><span>在线人数：1</span><span style="color:#b93a2b;">本页留言未通过审核，已被屏蔽</span><span>发帖统计：50</span></div>'+
        '</div>', cat);
      return html;
    }

    /* 正常页 */
    if(page<1)page=1; if(page>5)page=5;
    var list = this.data.board[page-1];
    var cats = ["全部","教学咨询","后勤反馈","心理关怀"];
    var catHtml = cats.map(function(c){
      return '<span class="cat'+(c===cat?" on":"")+'" data-cat="'+c+'">'+c+'</span>';
    }).join("");

    var rows = list.map(function(m,i){
      if(m.deleted){
        var cells = m.revealed ?
          '<td>'+m.content+'</td>' :
          '<td><span class="redacted" id="redactedMsg">'+m.content+'</span></td>';
        return '<tr class="board-row">'+
          '<td style="width:44px;"><div class="avatar">长</div></td>'+
          '<td style="width:130px;"><span class="nick">'+m.nick+'</span></td>'+
          '<td style="width:70px;" class="time">'+m.date+'</td>'+
          cells+
          '<td style="width:150px;"><span class="status-tag del">'+m.status+'</span> '+
          '<button class="del-btn bad" id="redelBtn" title="">删除</button></td>'+
        '</tr>';
      }
      if(m.type==="admin"){
        return '<tr class="board-row"><td><div class="avatar">管</div></td>'+
          '<td><span class="nick">'+m.nick+'</span> <span class="admin-tag">[管理员]</span></td>'+
          '<td class="time">'+m.date+'</td><td>'+m.content+'</td><td><span class="status-tag del">'+m.status+'</span></td></tr>';
      }
      return '<tr class="board-row">'+
        '<td><div class="avatar">长</div></td>'+
        '<td><span class="nick">'+m.nick+'</span></td>'+
        '<td class="time">'+m.date+'</td>'+
        '<td>'+m.content+'<br><span style="color:#5577aa;">回复：'+m.reply+'</span> <span class="admin-tag">[班主任]</span></td>'+
        '<td><span class="status-tag del">'+m.status+'</span> <button class="del-btn">删除</button></td>'+
      '</tr>';
    }).join("");

    var hint = (q.q==="林晚") ? "<div class='board-search-hint'>她坐最后一排。</div>" : "";

    /* 铭记结局：自动发布的新留言 */
    var rememberRow = "";
    if(q.post==="remember" && Game.flags.__observerPost){
      rememberRow = '<tr class="board-row" id="rememberRow" style="background:#fdf6df;"><td><div class="avatar">？</div></td>'+
        '<td><span class="nick" style="color:#9a8f6a;">无署名</span></td>'+
        '<td class="time">09-08</td>'+
        '<td style="font-family:&quot;Kaiti SC&quot;,&quot;STKaiti&quot;,&quot;楷体&quot;,serif;font-size:16px;color:#7a6a4a;">'+Game.flags.__observerPost+'</td>'+
        '<td><span class="status-tag del">已发布</span></td></tr>';
    }

    return this.boardFrame(rt,
      '<div class="board-toolbar">'+
        '<span style="font-size:12px;">搜索：</span>'+
        '<input type="text" id="boardSearch" value="'+(q.q||"").replace(/"/g,"&quot;")+'" placeholder="搜索留言内容">'+
        '<button class="ie-btn" id="boardSearchBtn">搜索</button>'+
        '<button class="ie-btn" id="boardPostBtn">发帖</button>'+
        '<div class="board-cats" style="margin-left:auto;">'+catHtml+'</div>'+
      '</div>'+
      '<div class="article-box" style="background:#fff;margin-top:8px;">'+
        (q.q==="林晚" ? '<div class="int-note" style="color:#888;display:block;padding:14px;text-align:center;">没有找到与“林晚”相关的留言。'+hint+'</div>' :
        '<table class="board-table"><thead><tr><th></th><th>昵称</th><th>时间</th><th>内容</th><th>状态</th></tr></thead><tbody>'+rememberRow+rows+'</tbody></table>')+
        this.boardPager(page,false,cat)+
        '<div class="board-online"><span>在线人数：37</span><span>累计发帖：248</span></div>'+
      '</div>', cat);
  },

  boardFrame:function(rt, inner, cat){
    var real = this;
    return Shell.frame(
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 家长互动 &gt; 家长留言板</div>'+
      '<div class="site-body"><div class="site-main">'+inner+'</div>'+real.sidebar("board")+'</div>',
      "board");
  },

  boardPager:function(page, hidden, cat){
    var btns = [1,2,3,4,5].map(function(i){
      var cls = "pg";
      if(hidden && i===4) cls += " on";
      if(!hidden && i===page) cls += " on";
      if(i===4) cls += " secret";
      var href = hidden && i===4 ? "/board.html?page=4&hidden=1" :
                 i===4 ? "/board.html?page=4&hidden=1" :
                 "/board.html?page="+i;
      var style = (i===4) ? 'style="position:relative;top:1px;"' : '';
      return '<span class="'+cls+'" data-go="'+href+'" '+style+'>'+i+'</span>';
    }).join("");
    return '<div class="pager">'+btns+'</div>';
  },

  /* ============ 广播站 ============ */
  radio:function(rt){
    Game.visit("radio");
    var q = rt.q;
    var progRows = [];
    RADIO_PROGRAMS.forEach(function(day){
      day.slots.forEach(function(s){
        var secret = s.type==="secret";
        var progress = secret
          ? '<div class="progress" id="secretProgress" data-secret="1"><div class="pfill"></div><div class="pseek" id="pseek"></div></div>'
          : '<div class="progress" data-prog="'+s.type+'"><div class="pfill"></div></div>';
        progRows.push('<tr><td style="width:70px;">'+day.day+'</td><td style="width:100px;">'+s.t+'</td>'+
          '<td>'+s.name+'</td>'+
          '<td><div class="prog-player">'+
            '<button class="play-btn" data-play="'+s.type+'" data-name="'+s.name+'">▶</button>'+
            progress+
            '<span class="dl-link"><a href="javascript:void(0)" data-dl="'+s.name+'">下载</a></span>'+
            '<span class="dl-time" data-time="'+s.dur+'">'+s.dur+'</span>'+
          '</div></td></tr>');
      });
    });

    var dedRows = DEDICATIONS.map(function(d,i){
      if(d[1]==="《虫儿飞》"){
        return '<tr><td style="width:140px;">匿名</td>'+
          '<td style="width:140px;"><span class="song-name song-ghost" id="songCF" data-ghost="飞" title="">'+d[1]+'</span></td>'+
          '<td>'+d[2]+'</td></tr>';
      }
      return '<tr><td>'+d[0]+'</td><td>'+d[1]+'</td><td>'+d[2]+'</td></tr>';
    }).join("");

    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 校园之声 &gt; 本周节目</div>'+
      '<div class="site-body"><div class="site-main">'+
        '<div class="article-box">'+
          '<div class="radio-header">'+
            '<span class="speaker-gif" id="speakerGif"></span>'+
            '<h2>校园之声 · 本周节目单</h2>'+
          '</div>'+
          '<table class="prog-table"><thead><tr><th>星期</th><th>时段</th><th>节目名称</th><th>收听</th></tr></thead><tbody>'+
            progRows.join("")+
          '</tbody></table>'+
          '<div class="dedication">'+
            '<h3>点歌台（匿名点歌）</h3>'+
            '<table><tbody>'+dedRows+'</tbody></table>'+
          '</div>'+
        '</div>'+
      '</div>'+this.sidebar("radio")+'</div>';
    return Shell.frame(inner, "radio");
  },

  /* ============ 学籍档案查询（内网） ============ */
  student:function(rt){
    Game.visit("student");
    var q = rt.q;
    var clsOpts = ["全部"].concat(CLASSES).map(function(c){
      return '<option value="'+c+'"'+(q.cls===c?" selected":"")+'>'+c+'</option>';
    }).join("");
    var yearOpts = ["全部","2007","2006","2005"].map(function(y){
      return '<option value="'+y+'"'+(q.year===y?" selected":"")+'>'+y+'</option>';
    }).join("");

    var result = this.studentResult(rt);

    var html =
      '<div class="intranet">'+
        '<div class="int-head"><span>槐隐学园学籍管理系统 V2.1</span>'+
          '<span class="v">内部系统 · 仅限校内访问 · <a href="/" data-go="/" style="color:#cfe0ff;">返回首页</a></span></div>'+
        '<div class="int-body">'+
          '<div class="int-left">'+
            '<div class="int-title">查询条件</div>'+
            '<label>姓名</label><input id="qName" value="'+(q.name||"").replace(/"/g,"&quot;")+'">'+
            '<label>学号</label><input id="qId" value="'+(q.id||"").replace(/"/g,"&quot;")+'">'+
            '<label>班级</label><select id="qClass">'+clsOpts+'</select>'+
            '<label>入学年份</label><select id="qYear">'+yearOpts+'</select>'+
            '<div class="int-btns"><button class="ie-btn" id="qBtn">查询</button><button class="ie-btn" id="qReset">重置</button></div>'+
            '<div class="int-note" style="margin-top:18px;">说明：本系统数据每周一凌晨自动备份，导出功能仅限管理员使用。</div>'+
          '</div>'+
          '<div class="int-right">'+
            result.html+
            '<div class="log-fold" id="logFold">'+
              '<div class="log-head" id="logHead">▶ 操作日志（点击展开）</div>'+
              '<div class="log-body" id="logBody">'+this.logRows()+
                (Game.has("audioSecret") ? '<div class="log-row blink"><span style="width:140px;">2007-09-08 02:00</span><span>系统自动</span><span>数据修正中……</span></div>' : "")+
              '</div>'+
            '</div>'+
            '<div style="margin-top:14px;"><button class="ie-btn" id="qExport">导出当前结果</button> <button class="ie-btn" data-go="/">返回首页</button></div>'+
          '</div>'+
        '</div>'+
      '</div>';
    return html;
  },

  studentResult:function(rt){
    var q = rt.q;
    if(q.tab==="score"){
      return {html:'<div class="int-title">成绩查询</div><div class="int-note" style="color:#555;">成绩查询系统维护中，请联系教务处。</div>'};
    }
    var name = q.name||"";
    var cls = q.cls||"";
    var id = q.id||"";
    /* 直接搜林晚 */
    if(name.indexOf("林晚")>=0){
      return {html:'<div class="int-title">查询结果</div>'+
        '<div style="background:#fff;border:1px solid #8a929a;padding:26px;text-align:center;color:#7a828a;">'+
        '查无此人。<br><br><span style="font-size:12px;">错误代码：NO_RECORD · 已同步至操作日志</span></div>'+
        '<div class="int-note">建议：检查姓名是否正确，或按班级查询。</div>', linwan:true};
    }
    /* 学号直查 */
    if(id){
      if(id.indexOf("063143")>=0){
        return {html:'<div class="int-title">查询结果</div>'+
          '<div style="background:#fff;border:1px solid #8a929a;padding:26px;text-align:center;color:#7a828a;">该学号不存在。</div>'};
      }
      return {html:'<div class="int-title">查询结果</div>'+
        '<div style="background:#fff;border:1px solid #8a929a;padding:26px;text-align:center;">请使用姓名或班级进行查询。</div>'};
    }
    /* 班级查询 */
    var target = cls || (q.year ? "高一(1)班" : "");
    if(!target){
      return {html:'<div class="int-title">请输入查询条件</div>'+
        '<div class="int-note" style="color:#555;">请在左侧输入姓名、学号或选择班级后点击“查询”。</div>'};
    }
    var list = this.data.studentDb[target];
    if(!list){
      return {html:'<div class="int-title">查询结果</div><div style="background:#fff;padding:20px;">无该班级数据。</div>'};
    }
    var blankHeight = (target==="高二(3)班" && Game.has("classClue")) ? "normalheight" : "";
    var rows = list.map(function(s){
      if(s._blank){
        return '<tr class="blank-row '+blankHeight+'" id="blankRow">'+
          '<td id="blankIdCell" data-frag="4">'+s.id+'</td>'+
          '<td>　</td><td>　</td><td>　</td><td>　</td></tr>';
      }
      return '<tr><td>'+s.id+'</td><td>'+s.name+'</td><td>'+s.gender+'</td><td>'+s.cls+'</td><td>'+s.status+'</td></tr>';
    }).join("");
    return {html:'<div class="int-title">'+target+' 学生名册（共 '+list.length+' 条）</div>'+
      '<table class="int-table"><thead><tr><th style="width:110px;">学号</th><th style="width:90px;">姓名</th><th style="width:60px;">性别</th><th style="width:120px;">班级</th><th style="width:80px;">状态</th></tr></thead><tbody>'+
      rows+'</tbody></table>'+
      '<div class="int-note">提示：名册以学籍管理系统当前记录为准。</div>'};
  },

  logRows:function(){
    return LIN_WAN.logs.map(function(l){
      var cls = l[2].indexOf("删除")>=0 ? 'style="color:#a03020;"' : "";
      return '<div class="log-row" '+cls+'><span style="width:150px;">'+l[0]+'</span><span style="width:90px;">'+l[1]+'</span><span>'+l[2]+'</span></div>';
    }).join("");
  },

  recordDetail:function(){
    Game.setFlag("recordFound");
    var fields = [
      ["学号", LIN_WAN.id, true],
      ["姓名", LIN_WAN.name, true],
      ["性别", LIN_WAN.gender, true],
      ["班级", LIN_WAN.cls, true],
      ["出生日期", LIN_WAN.birth, false],
      ["入学年份", LIN_WAN.enyear, false],
      ["当前状态", LIN_WAN.status, true]
    ];
    var rowsHtml = fields.map(function(f){
      return '<div class="rd-row"><div class="rd-k">'+f[0]+'</div>'+
        '<div class="rd-v">'+f[1]+(f[2]?'<span class="stamp">已修正</span>':"")+'</div></div>';
    }).join("");
    return '<div class="record-detail">'+
      '<div class="int-title" style="text-align:center;">学生档案详情</div>'+
      rowsHtml+
      '<div class="rd-row"><div class="rd-k">备注</div><div class="rd-v">'+
        '<div class="overlap-text" id="noteOverlay">'+
          '<span class="layer-top">'+LIN_WAN.noteTop+'</span>'+
          '<span class="layer-bottom">'+LIN_WAN.noteBottom+'</span>'+
        '</div>'+
        '<button class="text-action" id="revealOriginal" type="button">查看覆盖前的备注</button>'+
        '<div id="recordReceipt" class="record-receipt"></div>'+
      '</div></div>'+
    '</div>';
  },

  /* ============ 管理后台 ============ */
  admin:function(rt){
    if(!Game.specialEnabled()){
      return ArchiveTools.verify(rt);
    }
    Game.setFlag("inAdmin");
    Game.visit("admin");
    var rankRows = this.data.ranks.map(function(r){
      var cls = "r-row" + (r.val<60?" low":"") + (r.lin?" lin":"");
      return '<div class="'+cls+'"><span class="r-rk">'+r.rank+'</span><span class="r-nm">'+r.cls+'　'+r.name+'</span>'+
        '<span class="r-val">'+r.val+'</span><span class="r-st">'+r.st+'</span></div>';
    }).join("");
    var logRows = ADMIN_LOGS.map(function(l,i){
      var voiceCls = l[2] ? " l-voice" : "";
      var row = '<div class="l-row'+(i>=ADMIN_LOGS.length-3?" final":"")+voiceCls+'" data-voice="'+i+'"><span class="l-t">'+l[0]+'</span><span>'+l[1]+'</span></div>';
      if(l[2]){
        row += '<div class="l-voice-body" id="voice'+i+'">'+l[2]+'</div>';
      }
      return row;
    }).join("");
    var diaryBtn = Game.allFragments() ? '<button class="ad-btn secret show" id="btnDiary">查看日记</button>' : '<button class="ad-btn secret" id="btnDiary">查看日记</button>';

    var html =
      '<div class="admin-dark">'+
        '<div class="ad-head">幸福指数管理后台 V1.0　<span style="font-size:12px;color:#8b8f96;font-weight:normal;">— 内部系统，请勿外传 —</span></div>'+
        '<div class="ad-body">'+
          '<div class="ad-col"><h3>学生幸福指数排行榜（实时）</h3><div class="ad-rank">'+rankRows+'</div></div>'+
          '<div class="ad-col"><h3>幸福干预操作记录</h3><div class="ad-logs">'+logRows+'</div></div>'+
        '</div>'+
        '<div class="ad-note">系统备注：为了集体的幸福，少数人的牺牲是必要的。</div>'+
        '<div class="ad-btns">'+
          '<button class="ad-btn" id="btnReset">重置数据</button>'+
          '<button class="ad-btn" id="btnObserver">新增观测者</button>'+
          diaryBtn+
        '</div>'+
      '</div>';
    return html;
  },

  /* ============ 隐藏日记 ============ */
  diaryPage:function(rt){
    if(!Game.allFragments()){
      return this.notFound("页面不存在。");
    }
    Game.visit("diary");
    var pages = DIARY.map(function(d,i){
      return '<div class="diary-page"><div class="diary-date">'+d.date+'</div>'+
        '<div class="diary-text">'+d.text+'</div></div>';
    }).join("");
    var html =
      '<div class="p-diary"><div class="diary-book">'+
        '<h2>林晚的日记</h2>'+
        pages+
        '<div class="diary-thanks">谢谢你。</div>'+
        '<div style="text-align:center;margin-top:26px;"><button class="ie-btn" id="diaryBack">合上</button></div>'+
      '</div></div>';
    return html;
  },

  /* ============ 关于本站 ============ */
  aboutSite:function(rt){
    Game.visit("aboutsite");
    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 关于本站</div>'+
      '<div class="site-body"><div class="site-main">'+
        '<div class="article-box">'+
          '<div class="page-title">关于本站</div>'+
          '<p><b>站点名称：</b>'+SITE.full+'官方网站</p>'+
          '<p><b>原域名：</b>http://'+SITE.domain+'</p>'+
          '<p><b>站点存续时间：</b>'+SITE.archiveRange+'</p>'+
          '<p><b>建站单位：</b>槐隐学园信息中心</p>'+
          '<p><b>技术支持：</b>槐隐市教育信息中心</p>'+
          '<p>本站为槐隐学园官方网站的离线归档镜像，页面内容均为当时的原始快照。</p>'+
          '<p style="margin-top:30px;text-align:center;color:#bbb;font-size:12px;cursor:pointer;" id="saveForever">本页面永久保存</p>'+
          '<div class="back-up"><button class="ie-btn" data-go="/">返回首页</button></div>'+
        '</div>'+
      '</div>'+this.sidebar("about")+'</div>';
    return Shell.frame(inner, "about");
  },

  /* ============ 站点地图 ============ */
  sitemap:function(rt){
    Game.visit("sitemap");
    var links = [
      ["/","首页"],
      ["/about.html","学校概况"],
      ["/news.html","新闻中心"],
      ["/star.html","德育工作 · 幸福之星公示"],
      ["/teach.html","教学教研"],
      ["/board.html","家长互动 · 家长留言板"],
      ["/radio.html","校园之声 · 广播站"],
      ["/student.html","学籍档案查询"],
      ["/about-site.html","关于本站"]
    ];
    var inner =
      '<div class="crumb"><a href="/" data-go="/">首页</a> &gt; 站点地图</div>'+
      '<div class="site-body"><div class="site-main">'+
        '<div class="article-box">'+
          '<div class="page-title">站点地图</div>'+
          '<ul style="line-height:2.4;font-size:14px;">'+
            links.map(function(l){return '<li><a href="'+l[0]+'" data-go="'+l[0]+'">'+l[1]+'</a></li>';}).join("")+
          '</ul>'+
        '</div>'+
      '</div>'+this.sidebar("sitemap")+'</div>';
    return Shell.frame(inner, "sitemap");
  },

  notFound:function(msg){
    return '<div style="background:#f0f0e8;padding:60px 40px;min-height:600px;">'+
      '<div style="font-size:18px;color:#b93a2b;font-weight:bold;">无法显示该页</div>'+
      '<p style="margin-top:14px;line-height:2;font-size:14px;">'+(msg||"您要访问的页面当前不可用。")+'</p>'+
      '<p style="margin-top:20px;font-size:13px;color:#555;">请确认地址是否正确，或返回<a href="/" data-go="/">网站首页</a>。</p>'+
      '</div>';
  },

  /* ============================================================
     挂载后交互绑定
     ============================================================ */
  after:function(rt, root){
    var p = rt.path;
    this._garble();
    Shell.bindNav(root);
    this.bindSidebar(root);

    /* ---------- 首页 ---------- */
    if(p==="/"){
      var slides = root.querySelectorAll("#carousel .slide");
      var dots = root.querySelectorAll("#carousel .dot");
      var idx = 0, timer = null;
      var show = function(i){
        idx = i;
        slides.forEach(function(s,k){ s.classList.toggle("on",k===i); });
        dots.forEach(function(d,k){ d.classList.toggle("on",k===i); });
      };
      timer = ArchiveTools.every(function(){ if(slides.length) show((idx+1)%3); }, 4200);
      dots.forEach(function(d){
        d.onclick = function(){ Audio.click(); show(parseInt(d.getAttribute("data-slide"),10)); };
      });
      /* 幸福之星预览第二名浅灰 */
      var hg = root.querySelector("#homeGrayName");
      if(hg){
        hg.style.cursor = "pointer";
        hg.onclick = function(){
          Game.setFlag("starClick");
          Shell.go("/student.html?name="+encodeURIComponent("林晚"));
        };
      }
      /* 碎片1：轮播第三张右下角 */
      var f1 = root.querySelector("#frag1Hot");
      if(f1){
        f1.onclick = function(){
          Audio.click();
          Shell.fragment(0);
        };
      }
    }

    /* ---------- 学校概况 ---------- */
    if(p==="/about.html"){
      var roof = root.querySelector("#roofHot");
      if(roof){
        roof.onclick = function(e){
          var x = e.offsetX/roof.offsetWidth, y = e.offsetY/roof.offsetHeight;
          /* 天台围栏区域：右上角 */
          if(x>0.78 && y<0.28){
            Game.setFlag("roofSeen");
            if(Game.ngplus){
              Audio.click();
              Shell.fragment(5);
            } else if(!ArchiveTools.settings.reducedFlash){
              Audio.staticHit(0.05);
              var img = roof.parentElement.querySelector("img");
              img.style.filter = "sepia(1) hue-rotate(-30deg) saturate(3)";
              ArchiveTools.later(function(){ img.style.filter=""; }, 90);
            }
          }
        };
      }
      var fg = root.querySelector("#faintGrad");
      if(fg){
        fg.onclick = function(){
          Audio.staticHit(0.02);
          Shell.pageFlash();
        };
      }
    }

    /* ---------- 新闻 ---------- */
    if(p==="/news.html"){
      if(rt.q.id){
        var sent = root.querySelector(".over-sent");
        if(sent){
          document.onselectionchange = function(){
            var sel = window.getSelection().toString();
            if(sel.indexOf("昂扬向上")>=0 || sel.indexOf("全校师生")>=0){
              if(!sent.getAttribute("data-revealed")){
                sent.setAttribute("data-revealed","1");
                var span = document.createElement("span");
                span.style.cssText = "color:#b03020;display:block;text-indent:2em;";
                span.textContent = "（底层叠字：无人提及。）";
                sent.parentNode.insertBefore(span, sent.nextSibling);
              }
            }
          };
        }
      } else {
        var clip = root.querySelector("#paperclip");
        if(clip){
          clip.onclick = function(){
            Audio.click();
            var pop = document.createElement("div");
            pop.className = "scratch-pop";
            pop.innerHTML = "9月7日　实验楼　处理";
            pop.style.left = (clip.offsetLeft+20)+"px";
            pop.style.top = (clip.offsetTop+20)+"px";
            clip.parentElement.appendChild(pop);
            ArchiveTools.later(function(){ pop.remove(); }, 5200);
          };
        }
      }
    }

    /* ---------- 幸福之星 ---------- */
    if(p==="/star.html"){
      var gr = root.querySelector("#starGrayRow");
      if(gr){
        gr.style.cursor = "pointer";
        gr.onclick = function(){
          Game.setFlag("starClick");
          Shell.go("/student.html?name="+encodeURIComponent("林晚")+"&from=star");
        };
      }
      /* 极淡小字选中显示底层 */
      var note = root.querySelector("#starNote");
      if(note){
        note.onmouseup = function(){
          var sel = window.getSelection().toString();
          if(sel.indexOf("特殊学生")>=0){
            var under = note.querySelector(".hidden-underlay");
            under.style.opacity = "1";
            under.style.color = "#b03020";
            under.style.background = "#fff7d6";
          }
        };
      }
      /* 碎片2：第3页表格下方双击 */
      var f2 = root.querySelector("#frag2Hot");
      if(f2 && parseInt(rt.q.page||"1",10)===3){
        f2.ondblclick = function(){
          if(Game.ngplus){ Shell.fragment(1); }
        };
      }
    }

    /* ---------- 教学教研 ---------- */
    if(p==="/teach.html"){
      var et = root.querySelector("#essayTitle");
      if(et){
        et.onclick = function(){
          var main = root.querySelector(".article-box");
          main.style.position = "relative";
          main.style.top = (parseInt(main.style.top||"0")+1)+"px";
        };
      }
      root.querySelectorAll("[data-doc]").forEach(function(a){
        if(a.getAttribute("data-name")==="高二3班_座位表.xls"){
          var clicks = 0;
          a.onclick = function(){
            clicks++;
            if(clicks>=3){
              var orig = a.textContent;
              a.textContent = "最后一排.xls";
              Game.setFlag("classClue");
              Audio.staticHit(0.05);
              Shell.status("文件名异常：最后一排.xls");
              Shell.flash(a);
              ArchiveTools.later(function(){ a.textContent = orig; }, 2200);
            } else {
              /* 非阻塞提示，保证连续点击可触发 */
              Audio.staticHit(0.03);
              Shell.status("文件已损坏，无法下载。（高二3班_座位表.xls）");
              Shell.flash(a);
            }
          };
        } else {
          a.onclick = function(){
            Shell.alert("文件下载", "该文件为离线归档内容，下载通道已关闭。", {icon:""});
          };
        }
      });
    }

    /* ---------- 留言板 ---------- */
    if(p==="/board.html"){
      var redBtn = root.querySelector("#redelBtn");
      if(redBtn){
        redBtn.onclick = function(){
          Game.setFlag("deletedMsg");
          var msg = root.querySelector("#redactedMsg");
          if(msg){
            msg.classList.add("revealed");
            msg.textContent = "老师，我女儿说班里有个女生被欺负，你们能不能管管？高二3班的";
          }
          redBtn.textContent = "已撤销";
          redBtn.disabled = true;
          Audio.click();
        };
      }
      var postBtn = root.querySelector("#boardPostBtn");
      if(postBtn){
        postBtn.onclick = function(){
          Shell.alert("家长留言板", "发帖功能已关闭。\n\n本留言板为离线归档页面，仅保留快照数据。", {icon:""});
        };
      }
      var bsBtn = root.querySelector("#boardSearchBtn");
      var bsInput = root.querySelector("#boardSearch");
      if(bsBtn){
        var doBoardSearch=function(){
          var v=(bsInput.value||"").trim();
          if(v.indexOf("林晚")>=0)Game.setFlag("searchLinWan");
          Shell.go("/board.html"+(v?"?q="+encodeURIComponent(v):""));
        };
        bsBtn.onclick = doBoardSearch;
        bsInput.onkeydown = function(e){ if(e.keyCode===13) doBoardSearch(); };
      }
      root.querySelectorAll("[data-cat]").forEach(function(c){
        c.onclick = function(){
          Audio.click();
          var cat = c.getAttribute("data-cat");
          if(cat==="心理关怀"){
            var hidden = rt.q.hidden==="1";
            Shell.go("/board.html?page=1&cat="+encodeURIComponent(cat));
          } else {
            Shell.go("/board.html?page=1&cat="+encodeURIComponent(cat));
          }
        };
      });
      /* 碎片3：隐藏页第一条留言左侧针尖纸张 */
      var f3 = root.querySelector("#frag3Hot");
      if(f3){
        f3.onclick = function(){ Audio.click(); Shell.fragment(2); };
      }
      /* 铭记结局：页面泛黄，定格新留言 */
      var rr = root.querySelector("#rememberRow");
      if(rr){
        ArchiveTools.later(function(){
          document.getElementById("page-mount").classList.add("remember-sepia");
          rr.scrollIntoView({block:"center"});
          rr.classList.add("remember-glow");
        }, 200);
      } else {
        document.getElementById("page-mount").classList.remove("remember-sepia");
      }
    }

    /* ---------- 广播站 ---------- */
    if(p==="/radio.html"){
      /* 小喇叭动画 */
      var sp = root.querySelector("#speakerGif");
      if(sp){
        sp.innerHTML = '<svg width="40" height="40" viewBox="0 0 40 40">'+
          '<rect x="4" y="14" width="8" height="12" fill="#8a6a30"/>'+
          '<polygon points="12,10 22,4 22,36 12,30" fill="#5a4420"/>'+
          '<g class="wave" stroke="#b93a2b" stroke-width="2" fill="none">'+
          '<path d="M26 14 q5 6 0 12"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite"/></path>'+
          '<path d="M30 10 q8 10 0 20"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" begin="0.3s" repeatCount="indefinite"/></path>'+
          '</g></svg>';
      }
      /* 节目播放 */
      root.querySelectorAll("[data-play]").forEach(function(btn){
        btn.onclick = function(){
          var type = btn.getAttribute("data-play");
          var bar = btn.parentElement.querySelector(".progress");
          var fill = bar.querySelector(".pfill");
          Audio.playProgram(type);
          if(type!=="secret"){
            fill.style.transition = "width 7s linear";
            fill.style.width = "100%";
            ArchiveTools.later(function(){ fill.style.transition=""; fill.style.width="0"; }, 7500);
          } else {
            /* 心灵驿站：3分钟，点击进度条定位 */
            fill.style.width = "0%";
          }
        };
      });
      /* 非secret进度条点击快进 */
      root.querySelectorAll(".progress:not([data-secret])").forEach(function(bar){
        bar.onclick = function(e){
          var x = (e.offsetX/bar.offsetWidth);
          bar.querySelector(".pfill").style.width = (x*100)+"%";
        };
      });
      /* 心灵驿站进度条 2:10-2:25 */
      var secBar = root.querySelector("#secretProgress");
      if(secBar){
        var seek = function(e){
          var rect = secBar.getBoundingClientRect();
          var x = (e.clientX-rect.left)/rect.width;
          if(x<0)x=0; if(x>1)x=1;
          var sec = Math.round(x*180);
          var fill = secBar.querySelector(".pfill");
          fill.style.width = (x*100)+"%";
          var mm = Math.floor(sec/60), ss = sec%60;
          /* 2:10-2:25 = 130-145s */
          if(sec>=130 && sec<=145){
            var first = !Game.has("audioSecret");
            Game.setFlag("audioSecret");
            Audio.secretWhisper(!first);
            var pseek = secBar.querySelector(".pseek");
            if(pseek){
              pseek.style.display = "block";
              pseek.style.left = (130/180*100)+"%";
              pseek.style.width = (15/180*100)+"%";
            }
          }
        };
        secBar.onclick = seek;
        secBar.onmousemove = function(e){ if(e.buttons===1) seek(e); };
      }
      root.querySelectorAll("[data-dl]").forEach(function(a){
        a.onclick = function(){
          Shell.alert("文件下载", "音频归档通道已关闭，无法下载。", {icon:""});
        };
      });
      /* 虫儿飞 */
      var cf = root.querySelector("#songCF");
      if(cf){
        var cfClick = function(){
          Game.setFlag("songClick");
          Audio.songBox();
          Shell.pageFlash();
          Shell.status("已记录点歌请求：送给最后一排的同学");
          /* 地址栏新增参数（不重新渲染，保证双击可触发） */
          var addr = document.getElementById("addr-url");
          if(addr) addr.textContent = Shell.urlFor("/radio.html")+"?song=cf";
        };
        cf.onclick = cfClick;
        cf.ondblclick = function(e){
          if(Game.ngplus){
            e.preventDefault();
            Audio.click();
            Shell.fragment(4);
          }
        };
      }
    }

    /* ---------- 学籍系统 ---------- */
    if(p==="/student.html"){
      var qBtn = root.querySelector("#qBtn");
      if(qBtn){
        qBtn.onclick = function(){
          Audio.click();
          var name = root.querySelector("#qName").value;
          var id = root.querySelector("#qId").value;
          var cls = root.querySelector("#qClass").value;
          var year = root.querySelector("#qYear").value;
          var qs = [];
          if(name) qs.push("name="+encodeURIComponent(name));
          if(id) qs.push("id="+encodeURIComponent(id));
          if(cls!=="全部") qs.push("cls="+encodeURIComponent(cls));
          if(year!=="全部") qs.push("year="+encodeURIComponent(year));
          if(rt.q.tab==="score") qs.push("tab=score");
          Shell.go("/student.html"+(qs.length?"?"+qs.join("&"):""));
        };
      }
      var qReset = root.querySelector("#qReset");
      if(qReset){ qReset.onclick = function(){ Shell.go("/student.html"); }; }
      /* 切换班级/学号时清空姓名输入，避免残留姓名拦截班级查询 */
      var qNameI = root.querySelector("#qName");
      var qClassI = root.querySelector("#qClass");
      var qIdI = root.querySelector("#qId");
      if(qClassI){ qClassI.onchange = function(){ if(qNameI) qNameI.value=""; }; }
      if(qIdI){ qIdI.onchange = function(){ if(qNameI) qNameI.value=""; }; }
      if(qNameI){
        qNameI.oninput = function(){
          if(qClassI) qClassI.value="全部";
          if(qIdI) qIdI.value="";
        };
      }
      var exp = root.querySelector("#qExport");
      if(exp){
        exp.onclick = function(){
          Shell.alert("学籍管理系统", "导出失败：数据不完整。\n\n错误代码：EXPORT_DENIED（缺少 1 条记录）", {icon:"warn"});
        };
      }
      /* 空白行 */
      var blank = root.querySelector("#blankRow");
      if(blank){
        if(Game.has("classClue")){
          ArchiveTools.later(function(){
            var vp = document.getElementById("viewport");
            blank.scrollIntoView({block:"center"});
          }, 300);
        }
        blank.onclick = function(){
          Audio.click();
          Shell.openWindow("学籍管理系统 V2.1 - 档案详情", Pages.recordDetail(), 680);
          ArchiveTools.later(function(){ Pages.bindRecordDetail(); }, 60);
        };
        /* 碎片4：右键学号单元格 */
        var idCell = root.querySelector("#blankIdCell");
        if(idCell){
          idCell.oncontextmenu = function(e){
            e.preventDefault();
            e.stopPropagation();
            if(Game.ngplus){ Shell.fragment(3); }
          };
        }
      }
      /* 操作日志展开 */
      var logHead = root.querySelector("#logHead");
      var logBody = root.querySelector("#logBody");
      if(logHead){
        logHead.onclick = function(){
          Game.setFlag("logExpanded");
          logBody.classList.toggle("open");
          logHead.textContent = logBody.classList.contains("open") ? "▼ 操作日志（点击折叠）" : "▶ 操作日志（点击展开）";
        };
      }
    }

    /* ---------- 后台 ---------- */
    if(p==="/admin.html"){
      var b1 = root.querySelector("#btnReset");
      var b2 = root.querySelector("#btnObserver");
      var b3 = root.querySelector("#btnDiary");
      if(b1) b1.onclick = function(){ Audio.click(); Endings.reset(); };
      if(b2) b2.onclick = function(){ Audio.click(); Endings.observer(); };
      if(b3) b3.onclick = function(){ Audio.click(); Shell.go("/diary.html"); };
      /* 配角视角：双击带“原始录入”光标的记录，展开第一人称批注 */
      root.querySelectorAll(".l-voice").forEach(function(v){
        v.ondblclick = function(){
          var i = v.getAttribute("data-voice");
          var body = root.querySelector("#voice"+i);
          if(body){
            var open = body.classList.contains("open");
            if(!open){ Audio.staticHit(0.04); body.classList.add("open"); }
          }
        };
      });
    }

    /* ---------- 日记页 ---------- */
    if(p==="/diary.html"){
      var db = root.querySelector("#diaryBack");
      if(db){ db.onclick = function(){ Shell.go("/admin.html"); }; }
    }

    /* ---------- 关于本站 ---------- */
    if(p==="/about-site.html"){
      var sf = root.querySelector("#saveForever");
      if(sf){
        var sfHits = 0;
        sf.ondblclick = function(){
          Audio.click();
          Game.setFlag("saveClick");
          if(Game.ngplus){
            sfHits++;
            if(sfHits>=1){ Shell.fragment(6); }
          }
        };
      }
    }

    /* 始终运行一次异化更新 */
    Game.applyCorruption();
  },

  bindRecordDetail:function(){
    var note=Shell.modalLayer.querySelector("#noteOverlay");if(!note)return;
    var reveal=function(){
      note.classList.add("revealed");note.querySelector(".layer-top").style.display="none";
      Game.setFlag("noteOverlay");
      var b=Shell.modalLayer.querySelector("#revealOriginal");if(b){b.textContent="覆盖前备注已显示";b.disabled=true;}
      var r=Shell.modalLayer.querySelector("#recordReceipt");
      if(r){r.innerHTML='<p>原始备注与学号 063143 已对应，档案核验完成。</p>'+ArchiveTools.accessLinks();Shell.bindNav(r);}
    };
    note.onmouseup=reveal;
    note.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();reveal();}};
    note.tabIndex=0;
    var btn=Shell.modalLayer.querySelector("#revealOriginal");if(btn)btn.onclick=reveal;
    if(Game.has("noteOverlay"))reveal();
  },

  /* ---------- 四阶乱码 ---------- */
  _garbleTimer:null,
  _garble:function(){
    clearInterval(this._garbleTimer);
    var self = this;
    this._garbleTimer = ArchiveTools.every(function(){
      if(Game.tier()<4||ArchiveTools.settings.reducedFlash) return;
      var texts = document.querySelectorAll("#page-mount .data-table th, #page-mount .ad-head, #page-mount .int-title");
      if(!texts.length) return;
      var t = texts[Math.floor(Math.random()*texts.length)];
      var orig = t.getAttribute("data-otext") || t.textContent;
      if(!t.getAttribute("data-otext")) t.setAttribute("data-otext", orig);
      var chars = "▓▒░□■?#%&$@錯誤無法讀取";
      var pos = Math.floor(Math.random()*orig.length);
      var arr = orig.split("");
      arr[pos] = chars[Math.floor(Math.random()*chars.length)];
      t.textContent = arr.join("");
      ArchiveTools.later(function(){ t.textContent = orig; }, 350);
    }, 1400);
  }
};
