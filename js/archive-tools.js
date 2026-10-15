/* 槐隐学园：归档关联、可访问操作与显示选项。原剧情文本与图片保持原样。 */
var ArchiveTools={
  settings:{reducedFlash:true},timers:new Set(),revision:0,
  esc:function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');},
  link:function(route,text){return '<a href="'+this.esc(route)+'" data-go="'+this.esc(route)+'">'+this.esc(text)+'</a>';},
  norm:function(v){return String(v||'').toLowerCase().replace(/高二[（(]?3[）)]?班/g,'高二3班').replace(/9[月.·\/-]0?7[日号]?/g,'9月7日').replace(/实验室/g,'实验楼').replace(/\s/g,'');},
  later:function(fn,ms){var revision=this.revision,id=setTimeout(function(){ArchiveTools.timers.delete(id);if(revision===ArchiveTools.revision)fn();},ms);this.timers.add(id);return id;},
  every:function(fn,ms){var revision=this.revision,id=setInterval(function(){if(revision===ArchiveTools.revision&&!document.hidden)fn();},ms);this.timers.add(id);return id;},
  beginPage:function(){this.revision++;this.timers.forEach(function(id){clearTimeout(id);clearInterval(id);});this.timers.clear();},
  init:function(){
    try{var s=JSON.parse(localStorage.getItem('huaiyin_display_v2'));if(s&&typeof s.reducedFlash==='boolean')this.settings.reducedFlash=s.reducedFlash;}catch(e){}
    this.applyDisplay();
    var b=document.createElement('button');b.type='button';b.id='archiveDisplay';b.className='ie-btn';b.textContent='显示';b.title='显示选项：减弱频闪';b.onclick=function(){ArchiveTools.displaySettings();};document.getElementById('toolbar').appendChild(b);
    Shell._menuItems.help.push({t:'查阅提示 / 核验进度',fn:function(){ArchiveTools.showHelp();}});
    var result=Pages.studentResult;
    Pages.studentResult=function(rt){
      var q=rt.q||{};q.id=(q.id||'').trim();q.name=(q.name||'').trim();var target=(q.name||'').indexOf('林晚')>=0||q.id==='063143';
      if(target&&q.tab!=='score'){
        if(q.name)Game.setFlag('searchLinWan');
        return {html:'<div class="int-title">查询结果 · 记录已被修正</div><div class="archive-document"><p>当前名册中没有可公开显示的该生记录。</p><p>操作日志仍保留学号 <b>063143</b>，可与高二(3)班名册中的空白行对应。</p><button class="ie-btn" data-record-open>查看该学号的归档详情</button><p>'+ArchiveTools.link('/student.html?cls='+encodeURIComponent('高二(3)班')+'&focus=063143','按班级查看名册')+'</p><p class="archive-small">姓名查询没有结果，不代表归档详情已全部丢失。</p></div>'};
      }
      if(q.name&&q.name.trim()&&!q.cls){
        var found=[];Object.keys(Pages.data.studentDb).forEach(function(c){Pages.data.studentDb[c].forEach(function(s){if(s.name.indexOf(q.name.trim())>=0)found.push(s);});});
        return {html:'<div class="int-title">姓名查询结果</div>'+(found.length?'<table class="int-table"><tr><th>学号</th><th>姓名</th><th>班级</th><th>状态</th></tr>'+found.map(function(s){return '<tr><td>'+s.id+'</td><td>'+ArchiveTools.esc(s.name)+'</td><td>'+s.cls+'</td><td>'+s.status+'</td></tr>';}).join('')+'</table>':'<p class="int-note">没有匹配的公开记录。可以清空姓名，改用班级查询。</p>')};
      }
      return result.call(Pages,rt);
    };
    var board=Pages.board;
    Pages.board=function(rt){
      var html=board.call(Pages,rt);if(!rt.q.q&&!rt.q.cat)return html;
      var box=document.createElement('div');box.innerHTML=html;
      var article=box.querySelector('.site-main .article-box');if(!article)return html;
      var query=(rt.q.q||'').trim(),needle=ArchiveTools.norm(query),cat=rt.q.cat||'全部',matches=[];
      Pages.data.board.forEach(function(list,pi){if(pi===3)return;list.forEach(function(m){
        if(m.deleted&&!m.revealed&&!Game.has('deletedMsg'))return;
        var txt=m.content+' '+m.reply+' '+m.nick;
        var category=cat==='全部'||(cat==='心理关怀'?/心理|欺负|压力|心情|哭|谈心/.test(txt):cat==='后勤反馈'?/食堂|宿舍|校服|饮水|饭|车|图书|住校/.test(txt):!/心理|食堂|宿舍|校服/.test(txt));
        if(category&&(!needle||ArchiveTools.norm(txt).indexOf(needle)>=0))matches.push({m:m,page:pi+1});
      });});
      if(rt.q.hidden==='1')return html;
      article.innerHTML='<div class="search-summary">'+(query?'“'+ArchiveTools.esc(query)+'”':'分类：'+ArchiveTools.esc(cat))+' · 公开留言匹配 '+matches.length+' 条</div>'+matches.map(function(o){return '<div class="search-result"><b>'+ArchiveTools.esc(o.m.nick)+'</b>　'+o.m.date+'<p>'+ArchiveTools.esc(o.m.content)+'</p><p class="archive-small">'+ArchiveTools.esc(o.m.reply)+'</p>'+ArchiveTools.link('/board.html?page='+o.page,'回到原留言页')+'</div>';}).join('')+(!matches.length?'<p class="archive-small">公开索引没有匹配内容。被删除、审核不通过的留言不会出现在公开结果中。</p>':'')+'<p>'+ArchiveTools.link('/board.html?page=3','查看删除记录所在页')+'　'+ArchiveTools.link('/board.html?page=4&hidden=1','查看审核未通过的留言')+'</p>'+(query.indexOf('林晚')>=0?'<p class="record-receipt">“她坐最后一排”对应的是座位与学籍线索。'+ArchiveTools.link('/teach.html?doc=seat','查看座位表归档预览')+'</p>':'');
      return box.innerHTML;
    };
    window.addEventListener('beforeunload',function(){ArchiveTools.checkpoint();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&Shell.modalLayer.classList.contains('show')){var b=Shell.modalLayer.querySelector('[data-close]');if(b)b.click();}});
  },
  applyDisplay:function(){
    document.body.classList.toggle('reduce-flash',this.settings.reducedFlash);
    document.querySelectorAll('svg').forEach(function(s){if(ArchiveTools.settings.reducedFlash&&s.pauseAnimations)s.pauseAnimations();else if(s.unpauseAnimations)s.unpauseAnimations();});
    if(this.settings.reducedFlash){var vp=document.getElementById('viewport');vp.style.opacity='1';vp.style.background='';document.querySelectorAll('.steady-cue').forEach(function(e){e.style.opacity='1';});}
  },
  displaySettings:function(){
    Shell.openWindow('显示选项','<div class="display-settings"><label><input id="reduceFlash" type="checkbox" '+(this.settings.reducedFlash?'checked':'')+'> 减弱频闪（推荐）</label><p>关闭全屏明暗闪动、动态噪点、文字快速闪烁和瞬间变色。线索出现时改用稳定边框提示。</p><p class="archive-small">剧情、图片、档案内容和结局条件不受影响。选项会保存在当前浏览器中。</p><button class="ie-btn" id="displayDone">完成</button></div>',480);
    document.getElementById('reduceFlash').onchange=function(){ArchiveTools.settings.reducedFlash=this.checked;ArchiveTools.applyDisplay();try{localStorage.setItem('huaiyin_display_v2',JSON.stringify(ArchiveTools.settings));}catch(e){}};
    document.getElementById('displayDone').onclick=function(){Shell.modalLayer.querySelector('[data-close]').click();};
  },
  checkpoint:function(){
    if(!Game.currentRoute||document.body.classList.contains('on-archive')||(window.Endings&&Endings.active))return;
    try{localStorage.setItem('huaiyin_progress_v2',JSON.stringify({flags:Game.flags,visits:Game.visits,route:Game.currentRoute,ngplus:Game.ngplus,elapsed:Date.now()-Game.startTime}));}catch(e){}
  },
  clearCheckpoint:function(){try{localStorage.removeItem('huaiyin_progress_v2');}catch(e){}Game.currentRoute='';},
  addResumeButton:function(){
    var snap=null;try{snap=JSON.parse(localStorage.getItem('huaiyin_progress_v2'));}catch(e){}
    if(!snap||!snap.route||!snap.flags)return;
    var b=document.createElement('button');b.type='button';b.className='ie-btn archive-resume';b.textContent='继续上次查阅';
    b.onclick=function(){
      Game.flags=snap.flags;Game.visits=snap.visits||{};Game.ngplus=!!snap.ngplus;Game.startTime=Date.now()-Math.max(0,Number(snap.elapsed)||0);
      Shell.history=[{route:snap.route}];Shell.future=[];Audio.init();Audio.resume();Shell.mountRoute(Shell.parseRoute(snap.route),{});if(window.Support)Support.arm();
    };
    document.getElementById('archiveBody').appendChild(b);
  },
  accessLinks:function(){
    if(Game.specialEnabled())return '<p>'+this.link('/admin.html','打开特殊档案 · 幸福干预操作记录')+'</p>';
    if(Shell.currentPath()==='/verify.html')return '<p>本次已核对 '+(Number(Game.has('noteOverlay'))+Number(Game.has('audioSecret')))+'/2 份材料；完成上面的待核验项后即可进入。</p>';
    return '<p>'+this.link('/verify.html','查看特殊档案核验要求')+'</p>';
  },
  next:function(){
    if(Game.has('inAdmin'))return {route:'/admin.html',text:'幸福干预记录中，带“查看原始批注”的两条记录可以展开；页面底部保留两种处理方式。'};
    if(Game.specialEnabled())return {route:'/admin.html',text:'两项核验均已完成，可以查看特殊档案内的幸福干预操作记录。'};
    if(Game.has('noteOverlay'))return {route:'/radio.html?segment=tail',text:'档案已核验。另一份材料是广播站《心灵驿站》02:10—02:25 的附加片段。'};
    if(Game.has('recordFound'))return {route:'/student.html?id=063143',text:'已找到原档案。备注有覆盖痕迹，查看覆盖前的文字才能完成档案核验。'};
    if(Game.has('classClue')||Game.has('searchLinWan')||Game.has('starClick')||Game.has('deletedMsg'))return {route:'/student.html?cls='+encodeURIComponent('高二(3)班')+'&focus=063143',text:'姓名被清掉后，学号仍能对上。高二(3)班名册的最后一行可以打开。'};
    if(Game.has('songClick')||Game.has('audioSecret'))return {route:'/teach.html?doc=seat',text:'点歌送给了最后一排的同学。教学教研里还留着这个班的座位表文件。'};
    return {route:'/star.html',text:'公示名单中有一行只剩排名和班级；也可以从新闻、留言和广播站继续查阅。'};
  },
  showHelp:function(){var n=this.next();Shell.openWindow('查阅提示','<div class="archive-document"><p>'+this.esc(n.text)+'</p><p>'+this.link(n.route,'前往对应原页')+'</p><p>'+this.link('/verify.html','核验进度与资料位置')+'</p>'+(Game.ngplus?'<p>'+this.link('/recovery.html','查看二周目散页索引')+'</p>':'')+'</div>',520);Shell.bindNav(Shell.modalLayer);},
  refreshAccess:function(){
    var nav=document.getElementById('siteNav');
    if(nav&&Game.specialVisible()){
      var dropdown=nav.querySelector('.nav-dropdown'),sp=dropdown&&dropdown.querySelector('[data-special]');
      if(dropdown&&!sp){sp=document.createElement('div');sp.dataset.special='1';dropdown.appendChild(sp);}
      if(sp){sp.className='dd-item dd-special'+(Game.specialEnabled()?' unlocked highlight':'');sp.textContent='特殊档案'+(Game.specialEnabled()?'（已核验）':'（待核验）');sp.onclick=function(e){e.preventDefault();e.stopPropagation();Shell.go(Game.specialEnabled()?'/admin.html':'/verify.html');};}
      var strip=document.getElementById('archiveAccess');if(!strip){strip=document.createElement('div');strip.id='archiveAccess';strip.className='archive-access';nav.after(strip);}
      strip.innerHTML='内部资料：'+this.link(Game.specialEnabled()?'/admin.html':'/verify.html',Game.specialEnabled()?'特殊档案 · 已开放':'特殊档案 · 查看核验要求');Shell.bindNav(strip);
    }
    document.querySelectorAll('[data-access-summary]').forEach(function(el){el.innerHTML=ArchiveTools.accessLinks();Shell.bindNav(el);});
    var help=document.getElementById('archiveNext');if(help){var n=this.next();help.innerHTML='<h3>关联资料</h3><p>'+this.esc(n.text)+'</p>'+this.link(n.route,'查看对应资料');Shell.bindNav(help);}
  },
  verify:function(){
    Game.setFlag('specialAttempt');
    var cached=Game.profile.unlocked,doc=Game.has('noteOverlay'),audio=Game.has('audioSecret');
    var inner='<div class="crumb">'+this.link('/','首页')+' &gt; 特殊档案 · 关联核验</div><div class="article-box verification"><div class="page-title">特殊档案访问核验</div><p>核验要求是确认两份原始材料对应同一条被修正记录。</p><ol class="verification-list"><li><h3>档案核验 <span class="check-state">'+(doc?'已完成':cached?'已保留上次核验结果':'未完成')+'</span></h3><p>打开学号 063143 的归档详情，查看备注被覆盖前的文字。</p>'+this.link('/student.html?id=063143','查看原始档案备注')+'</li><li><h3>音频核验 <span class="check-state">'+(audio?'已完成':cached?'已保留上次核验结果':'未完成')+'</span></h3><p>核对广播站《心灵驿站》02:10—02:25 的附加片段。可收听，也可使用归档信息文字入口。</p>'+this.link('/radio.html?segment=tail','查看录音尾段与归档信息')+'</li></ol><div data-access-summary>'+this.accessLinks()+'</div><p class="archive-small">两项材料都已核对后，特殊档案中才会显示“幸福干预操作记录”。核验状态会随查阅进度保存。</p>'+this.link('/','返回首页')+'</div>';
    return Shell.frame(inner,'verify');
  },
  index:function(){
    var entries=[];function add(title,text,route){entries.push({title:title,text:text,route:route});}
    NEWS.forEach(function(n){add(n.headline,n.date+' '+n.body.join(' '),'/news.html?id='+n.id);});
    add('高二3班_座位表.xls','最后一排 靠窗 高二3班 座位 表 文件名异常','/teach.html?doc=seat');
    add('幸福之星公示名单','评选 名单 她不算在里面 特殊学生 排名','/star.html');
    add('9月7日—9月9日实验楼暂停开放通知','9月7日 9.7 实验楼 实验室 天台 处理 隐形圈 回形针','/news.html?notice=lab');
    add('校园之声 · 匿名点歌台','虫儿飞 最后一排 点歌 广播','/radio.html?song=cf');
    add('心灵驿站 · 录音归档','广播 音频 核验 心理 尾段 2:10 02:10 130秒','/radio.html?segment=tail');
    add('学籍档案查询','学籍 学号 学生 名册 高二3班 063143 林晚 删除 转学','/student.html?cls='+encodeURIComponent('高二(3)班')+'&focus=063143');
    add('特殊档案 · 核验入口','后台 幸福干预 操作记录 两个核验 管理 特殊档案','/verify.html');
    add('家长留言板 · 删除记录','欺负 女生 被删除 审核 家长 高二3班','/board.html?page=3');
    if(Game.has('hiddenPage4'))add('家长留言板 · 审核未通过记录',BLOCKED_MSGS.map(function(m){return m[2];}).join(' '),'/board.html?page=4&hidden=1');
    if(Game.has('noteOverlay'))add('学生档案 · 覆盖前备注',LIN_WAN.noteBottom,'/student.html?id=063143');
    return entries;
  },
  searchPage:function(rt){
    var query=(rt.q.q||'').trim();if(query.indexOf('林晚')>=0)Game.setFlag('searchLinWan');
    var norm=this.norm(query),terms=query.split(/[\s，,、;；]+/).filter(Boolean).map(this.norm);if(terms.length===1&&norm.indexOf('9月7日')>=0&&norm!=='9月7日')terms=['9月7日',norm.replace('9月7日','')];
    var hits=norm?this.index().filter(function(e){var t=ArchiveTools.norm(e.title+' '+e.text);return terms.length>0&&terms.every(function(n){return t.indexOf(n)>=0;});}):[];
    var html='<div class="crumb">'+this.link('/','首页')+' &gt; 站内搜索</div><div class="site-body"><div class="site-main"><div class="article-box"><div class="page-title">站内搜索</div><form id="archiveSearchForm" class="archive-search"><label for="archiveSearchInput">关键词</label><input id="archiveSearchInput" value="'+this.esc(query)+'"><button class="ie-btn" type="submit">搜索</button></form><p class="archive-small">索引范围：新闻正文、栏目、文件名与可读的归档说明。内部记录仅提供核验入口。</p><p class="search-summary">“'+this.esc(query)+'” · '+hits.length+' 条关联结果</p>'+hits.map(function(e){return '<div class="search-result">'+ArchiveTools.link(e.route,e.title)+'<p>'+ArchiveTools.esc(e.text.slice(0,140))+'</p></div>';}).join('')+(!hits.length?'<p>没有匹配结果。可以尝试页面中出现的姓名、学号、日期、文件名或节目名。</p>':'')+(query.indexOf('林晚')>=0?'<p class="record-receipt">姓名仍出现在旧新闻中，现行名册的姓名字段却已清空。核对时可以继续使用班级和学号。</p>':'')+'</div></div>'+Pages.sidebar('search')+'</div>';
    return Shell.frame(html,'search');
  },
  openRecord:function(){Audio.click();Shell.openWindow('学籍管理系统 V2.1 - 档案详情',Pages.recordDetail(),680);Pages.bindRecordDetail();},
  seatPreview:function(){
    Game.setFlag('classClue');
    Shell.openWindow('最后一排.xls — 归档文本预览','<div class="archive-document"><p class="archive-small">原文件：高二3班_座位表.xls。下载副本已损坏，镜像仍保留下列可读字段。</p><table class="int-table"><tr><th>班级</th><th>位置</th><th>学号</th><th>姓名</th></tr><tr><td>高二(3)班</td><td>最后一排，靠窗</td><td>063143</td><td>字段已清空</td></tr></table><p>该学号还保留在班级名册的空白行里。</p>'+this.link('/student.html?cls='+encodeURIComponent('高二(3)班')+'&focus=063143','到学籍系统核对这一行')+'</div>',660);Shell.bindNav(Shell.modalLayer);
  },
  labNotice:function(){
    Game.setFlag('labClue');
    Shell.openWindow('实验楼暂停开放通知 — 关联记录','<div class="archive-document"><h3>关于实验楼暂停开放的通知</h3><p>暂停开放时间：9月7日—9月9日。</p><p>回形针下压着的原字：<b>9月7日　实验楼　处理</b></p><p class="archive-small">通知没有说明“处理”的具体内容；可以核对同一天的学籍操作日志和内部干预记录。</p><p>'+this.link('/student.html?view=logs','查看9月7日的学籍操作日志')+'</p><p>'+this.link('/verify.html','查看内部记录核验入口')+'</p></div>',560);Shell.bindNav(Shell.modalLayer);
  },
  audioReceipt:function(play){
    var first=!Game.has('audioSecret');Game.setFlag('audioSecret');if(play)Audio.secretWhisper(!first);
    var receipt=document.getElementById('audioReceipt');if(receipt){receipt.hidden=false;receipt.innerHTML='<h3>音频核验已完成</h3><p>已核对《心灵驿站》02:10—02:25 的附加片段。它与当前镜像中的被修正学籍记录关联。</p><p class="archive-small">这里显示的是归档索引信息，不是录音逐字转写。原始备注保留在学生档案详情中。</p><button class="ie-btn" id="replayTail">重播附加音轨</button><div data-access-summary>'+this.accessLinks()+'</div>';document.getElementById('replayTail').onclick=function(){Audio.init();Audio.secretWhisper(true);};Shell.bindNav(receipt);}
    Shell.status('音频核验完成；可查看特殊档案核验进度。');
  },
  radio:function(rt,root){
    var sec=root.querySelector('#secretProgress');if(!sec)return;
    var player=sec.parentElement,row=sec.closest('tr'),time=player.querySelector('.dl-time');
    var panel=document.createElement('div');panel.className='radio-inspection';panel.id='radioInspection';panel.innerHTML='<h3>《心灵驿站》录音归档</h3><p class="archive-small">归档时间轴 00:00—03:00。音频仅保留部分音轨；可拖动定位，不必等待整段播放。</p><label for="archiveSeek">定位：<output id="radioClock">00:00</output></label><input type="range" id="archiveSeek" min="0" max="180" step="1" value="0" aria-label="心灵驿站时间轴"><p class="archive-small" id="tailHint">剪接标记：02:10—02:25。可核对附加音轨或其归档信息。</p><button class="ie-btn" id="reviewTail">核对尾段归档信息（文字）</button><div id="audioReceipt" class="record-receipt" hidden></div>';
    var table=row.closest('table'),wrap=document.createElement('div');wrap.className='table-scroll';table.before(wrap);wrap.appendChild(table);wrap.after(panel);
    var range=panel.querySelector('#archiveSeek'),clock=panel.querySelector('#radioClock'),pos=0,timer=null,playing=false;
    function seek(s,reveal){pos=Math.max(0,Math.min(180,Math.round(s)));range.value=pos;var str=String(Math.floor(pos/60)).padStart(2,'0')+':'+String(pos%60).padStart(2,'0');clock.textContent=str;sec.querySelector('.pfill').style.width=(pos/180*100)+'%';if(time)time.textContent=str+' / 3:00';if(reveal&&pos>=130&&pos<=145)ArchiveTools.audioReceipt(true);}
    range.oninput=function(){seek(+range.value,true);};
    sec.onclick=function(e){var rect=sec.getBoundingClientRect();seek((e.clientX-rect.left)/rect.width*180,true);};sec.onmousemove=null;
    panel.querySelector('#reviewTail').onclick=function(){seek(130,false);ArchiveTools.audioReceipt(false);};
    var btn=player.querySelector('[data-play]');btn.onclick=function(){
      Audio.init();if(playing){playing=false;clearInterval(timer);Audio.stopProgram();btn.textContent='▶';return;}
      if(pos>=180)seek(0,false);playing=true;btn.textContent='Ⅱ';Audio.playProgram('secret');
      timer=ArchiveTools.every(function(){if(!playing)return;seek(pos+1,pos===129);if(pos===180){clearInterval(timer);playing=false;btn.textContent='▶';Audio.stopProgram();}},1000);
    };
    if(Game.has('audioSecret'))this.audioReceipt(false);
    if(rt.q.segment==='tail'){seek(130,false);this.later(function(){panel.scrollIntoView({block:'center'});},100);}
    var song=root.querySelector('#songCF');if(song){
      song.setAttribute('role','button');song.tabIndex=0;song.title='查看这条点歌的归档说明';
      song.onclick=function(){Game.setFlag('songClick');Audio.songBox();Shell.pageFlash();var note=root.querySelector('#songReceipt');if(!note){note=document.createElement('div');note.id='songReceipt';note.className='record-receipt';song.closest('.dedication').appendChild(note);}note.innerHTML='<p>点歌原文：“送给最后一排的同学。”</p><p>点歌行还在，完整歌曲文件没有归档。广播站另外保留了《心灵驿站》的时间轴与剪接标记。</p><button class="ie-btn" id="goRadioTail">查看《心灵驿站》的尾段</button><p>'+ArchiveTools.link('/teach.html?doc=seat','核对“最后一排”的座位表')+'</p>'+(Game.ngplus?'<button class="text-action" data-fragment="4">查看点歌行夹页</button>':'');note.querySelector('#goRadioTail').onclick=function(){seek(130,false);panel.scrollIntoView({block:'center'});};Shell.bindNav(note);ArchiveTools.bindFragments(note);};
      song.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();song.click();}};
      if(rt.q.song==='cf')song.click();
    }
  },
  bindFragments:function(root){root.querySelectorAll('[data-fragment]').forEach(function(b){b.onclick=function(){if(Game.ngplus)Shell.fragment(+b.dataset.fragment);};});},
  recovery:function(){
    if(!Game.ngplus)return Shell.frame('<div class="article-box"><p>本次镜像尚未出现散页索引。散页属于重新查阅后的附加内容，不影响首次进入特殊档案。</p>'+this.link('/verify.html','查看当前核验进度')+'</div>','recovery');
    var locations=[['首页 · 第三张轮播照片','照片右下角的纸角','/'],['幸福之星 · 第三页','表格下方的夹页','/star.html?page=3'],['留言板 · 审核未通过页','第一条留言旁的纸片','/board.html?page=4&hidden=1'],['学籍名册 · 高二(3)班','063143 单元格的批注','/student.html?cls='+encodeURIComponent('高二(3)班')+'&focus=063143'],['广播站 · 虫儿飞','点歌行夹页','/radio.html?song=cf'],['学校概况 · 实验楼','天台围栏旁的纸片','/about.html'],['关于本站','永久保存处的残页','/about-site.html']];
    return Shell.frame('<div class="article-box"><div class="page-title">镜像散页索引 · '+Game.fragmentCount()+'/7</div><p>这些是二周目保留下来的日记散页，首次进入后台不需要集齐它们。</p><table class="data-table"><tr><th>原页位置</th><th>可检查处</th><th>状态</th></tr>'+locations.map(function(x,i){return '<tr><td>'+ArchiveTools.link(x[2],x[0])+'</td><td>'+ArchiveTools.esc(x[1])+'</td><td>'+(Game.profile.fragments[i]?'已读':'未读')+'</td></tr>';}).join('')+'</table>'+this.accessLinks()+'</div>','recovery');
  },
  enhance:function(rt,root){
    var self=this;
    root.querySelectorAll('[data-record-open]').forEach(function(b){b.onclick=function(){self.openRecord();};});
    var form=root.querySelector('#archiveSearchForm');if(form)form.onsubmit=function(e){e.preventDefault();var v=root.querySelector('#archiveSearchInput').value.trim();if(v)Shell.go('/search.html?q='+encodeURIComponent(v));};
    var side=root.querySelector('.site-side');if(side){var next=document.createElement('div');next.className='side-box archive-next';next.id='archiveNext';side.appendChild(next);}
    var inner=root.querySelector('.int-right');if(inner){var nav=document.createElement('div');nav.className='record-receipt';nav.innerHTML='<p>档案详情、操作日志与特殊档案是不同层级的材料。</p><div data-access-summary>'+this.accessLinks()+'</div>';inner.appendChild(nav);}
    if(rt.path==='/student.html'){
      if(rt.q.view==='logs'){root.querySelector('#logHead').click();this.later(function(){root.querySelector('#logFold').scrollIntoView({block:'center'});},150);}
      var blank=root.querySelector('#blankRow');if(blank){blank.setAttribute('role','button');blank.tabIndex=0;blank.title='查看学号063143的归档详情';blank.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();blank.click();}};
        var label=document.createElement('p');label.className='record-receipt';label.innerHTML='空白行仍保留学号 063143。<button type="button" class="text-action" data-record-open>查看这一行的档案详情</button>'+(Game.ngplus?'<button class="text-action" data-fragment="3">查看学号单元格批注</button>':'');root.querySelector('.int-table').after(label);label.querySelector('[data-record-open]').onclick=function(){self.openRecord();};
        if(rt.q.focus==='063143')this.later(function(){blank.scrollIntoView({block:'center'});},100);
      }
      root.querySelectorAll('.log-row').forEach(function(row){if(row.textContent.indexOf('删除学生档案')>=0){var b=document.createElement('button');b.className='text-action';b.textContent='关联原档案';b.onclick=function(){self.openRecord();};row.appendChild(b);}});
    }
    if(rt.path==='/teach.html'){
      var seat=root.querySelector('[data-name="高二3班_座位表.xls"]');if(seat){seat.onclick=function(){self.seatPreview();};seat.title='查看损坏文件中仍可读的文本预览';}
      if(rt.q.doc==='seat')this.later(function(){self.seatPreview();},80);
    }
    if(rt.path==='/news.html'){
      var clip=root.querySelector('#paperclip');if(clip){clip.title='查看回形针下的纸条及关联记录';clip.tabIndex=0;clip.onclick=function(){self.labNotice();};clip.onkeydown=function(e){if(e.key==='Enter')clip.click();};
        var notes=root.querySelector('.article-box');var a=document.createElement('button');a.className='text-action';a.textContent='查看实验楼通知的附页';a.onclick=function(){self.labNotice();};notes.appendChild(a);
      }
      if(rt.q.notice==='lab')this.later(function(){self.labNotice();},80);
    }
    if(rt.path==='/star.html'){
      var note=root.querySelector('#starNote');if(note){var b=document.createElement('button');b.className='text-action';b.textContent='查看这行附注';note.after(b);b.onclick=function(){var old=note.querySelector('.hidden-underlay');if(old){old.style.opacity='1';old.style.color='#a03020';old.style.position='static';}Game.setFlag('classClue');var receipt=root.querySelector('#starReceipt');if(!receipt){receipt=document.createElement('p');receipt.id='starReceipt';receipt.className='record-receipt';b.after(receipt);}receipt.innerHTML='“她不算在里面”对应的是名单中被清空的姓名字段。'+self.link('/student.html?cls='+encodeURIComponent('高二(3)班')+'&focus=063143','对照同班名册');Shell.bindNav(receipt);};}
    }
    if(rt.path==='/radio.html')this.radio(rt,root);
    if(rt.path==='/admin.html'){
      root.querySelectorAll('.l-voice').forEach(function(row){var b=document.createElement('button');b.className='text-action';b.textContent='查看原始批注';row.appendChild(b);var open=function(e){e.stopPropagation();var body=root.querySelector('#voice'+row.dataset.voice);body.classList.toggle('open');b.textContent=body.classList.contains('open')?'收起原始批注':'查看原始批注';};b.onclick=open;row.ondblclick=open;});
      var details=document.createElement('div');details.className='ad-links';details.innerHTML=self.link('/verify.html','返回核验记录')+'　'+self.link('/','返回学校首页')+(Game.ngplus?'　'+self.link('/recovery.html','散页索引（'+Game.fragmentCount()+'/7）'):'');root.querySelector('.ad-head').after(details);
      if(Game.ngplus&&!Game.allFragments()){var hint=document.createElement('p');hint.className='ad-links';hint.innerHTML='查看完整日记需补齐散页；已有 '+Game.fragmentCount()+'/7 份。'+self.link('/recovery.html','查看散页原页位置');root.querySelector('.ad-btns').after(hint);}
    }
    if(Game.ngplus){
      var fragments=[['#carousel',0,'查看照片右下角的纸角'],['#frag2Hot',1,'查看表格下方夹页'],['#frag3Hot',2,'查看留言旁的纸片'],['#roofHot',5,'查看实验楼围栏处的纸片'],['#saveForever',6,'查看永久保存处的残页']];
      fragments.forEach(function(f){var el=root.querySelector(f[0]);if(!el||f[1]===1&&rt.q.page!=='3')return;var b=document.createElement('button');b.className='text-action fragment-alternative';b.dataset.fragment=f[1];b.textContent=f[2];(f[1]===5?el.parentElement.parentElement:el).after(b);});
      var footer=root.querySelector('.site-footer');if(footer){var l=document.createElement('p');l.innerHTML=self.link('/recovery.html','二周目散页索引（'+Game.fragmentCount()+'/7）');footer.appendChild(l);}
    }
    this.bindFragments(root);this.refreshAccess();this.applyDisplay();
  }
};
