/* ============================================================
   槐隐学园 · 浏览器外壳：路由、框架、模态框
   ============================================================ */

var Shell = {
  history:[],
  future:[],
  mount:null,
  modalLayer:null,
  fragLayer:null,
  endingLayer:null,
  loading:false,
  scrollMem:{},

  init:function(){
    this.mount = document.getElementById("page-mount");
    this.modalLayer = document.getElementById("modal-layer");
    this.fragLayer = document.getElementById("fragment-layer");
    this.endingLayer = document.getElementById("ending-layer");

    document.getElementById("nav-back").addEventListener("click", function(){ Audio.click(); Shell.back(); });
    document.getElementById("nav-forward").addEventListener("click", function(){ Audio.click(); Shell.forward(); });
    document.getElementById("nav-refresh").addEventListener("click", function(){ Audio.click(); Shell.reload(); });
    document.getElementById("nav-home").addEventListener("click", function(){ Audio.click(); Shell.go("/"); });
    document.querySelector(".go-btn").addEventListener("click", function(){ Audio.click(); Shell.go("/"); });
    document.querySelector(".tb-min").addEventListener("click", function(){
      Shell.alert("Internet Explorer", "当前为离线归档页面，无法最小化窗口。", {icon:""});
    });
    document.querySelector(".tb-max").addEventListener("click", function(){
      Audio.click(); Shell.toggleSize();
    });
    document.querySelector(".tb-close").addEventListener("click", function(){
      Shell.onClose();
    });

    /* 菜单栏与右键菜单 */
    this.bindMenus();

    /* 窗口自适应缩放 */
    this.fit();
    window.addEventListener("resize", function(){ Shell.fit(); });
  },

  /* ---------- 顶部菜单 / 右键菜单 ---------- */
  _menuItems:{
    file:[{t:"新建窗口(N)",fn:function(){ Shell.alert("Internet Explorer","当前为离线归档页面，无法新建窗口。"); }},
          {t:"脱机工作(W)",fn:function(){ Shell.alert("Internet Explorer","该镜像已是离线归档状态。"); }}],
    edit:[{t:"全选(A)",fn:function(){ Shell.alert("Internet Explorer","该功能在离线归档中不可用。"); }}],
    view:[{t:"刷新(R)",fn:function(){ Shell.reload(); }},
          {t:"-",fn:null},
          {t:"源文件(C)",fn:function(){ Shell.viewSource(); }}],
    fav:[{t:"添加到收藏夹(A)…",fn:function(){ Shell.alert("Internet Explorer","收藏夹在离线归档中不可用。"); }}],
    tool:[{t:"Internet 选项(O)…",fn:function(){ ArchiveTools.displaySettings(); }}],
    help:[{t:"关于 Internet Explorer(A)",fn:function(){ Shell.alert("Internet Explorer","Internet Explorer 6.0.2900\n\n槐隐学园离线镜像 #199709\n公共网络历史归档计划", {icon:""}); }}]
  },
  bindMenus:function(){
    var self = this;
    /* 顶部菜单 */
    document.querySelectorAll("#menubar .mb-item").forEach(function(it){
      it.addEventListener("click", function(e){
        e.stopPropagation();
        var m = it.getAttribute("data-m");
        var rect = it.getBoundingClientRect();
        self._showPop(self._menuItems[m]||[], rect.left, rect.bottom+1);
      });
    });
    /* 右键上下文菜单（仅在页面视口内；碎片右键会 stopPropagation） */
    var vp = document.getElementById("viewport");
    vp.addEventListener("contextmenu", function(e){
      if(e.target && e.target.closest && e.target.closest("#blankIdCell")) return;
      if(e.target && e.target.closest && e.target.closest(".sys-modal")) return;
      e.preventDefault();
      var x = e.clientX, y = e.clientY;
      self._showPop([
        {t:"后退(B)",fn:function(){ Shell.back(); }},
        {t:"前进(F)",fn:function(){ Shell.forward(); }},
        {t:"刷新(R)",fn:function(){ Shell.reload(); }},
        {t:"-",fn:null},
        {t:"查看源文件(V)",fn:function(){ Shell.viewSource(); }},
        {t:"属性(R)",fn:function(){
          var p = Shell.currentPath();
          Shell.alert("属性",
            "协议：HTTP 1.0（离线归档）\n地址："+Shell.urlFor(p)+"\n类型：text/html；charset=gb2312\n快照：2007-09-08 01:14\n该站点已注销，内容未经审核。", {icon:""});
        }}
      ], x, y);
    });
    /* 点击其他位置 / ESC 关闭 */
    document.addEventListener("click", function(){ self._hidePop(); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") self._hidePop(); });
  },
  _popEl:null,
  _showPop:function(items, x, y){
    this._hidePop();
    var el = document.createElement("div");
    el.className = "ie-pop";
    el.style.left = Math.min(x, window.innerWidth-180)+"px";
    el.style.top = Math.min(y, window.innerHeight-items.length*24-8)+"px";
    items.forEach(function(it){
      if(it.t==="-"){
        var sep = document.createElement("div");
        sep.className = "ie-pop-sep";
        el.appendChild(sep);
        return;
      }
      var d = document.createElement("div");
      d.className = "ie-pop-item";
      d.textContent = it.t;
      d.onclick = function(ev){
        ev.stopPropagation();
        Shell._hidePop();
        if(it.fn) it.fn();
      };
      el.appendChild(d);
    });
    document.body.appendChild(el);
    this._popEl = el;
  },
  _hidePop:function(){
    if(this._popEl){ this._popEl.remove(); this._popEl = null; }
  },

  fit:function(){
    var w = window.innerWidth, h = window.innerHeight;
    if(w<1000){var compact=document.getElementById("window");compact.style.width=(w-8)+"px";compact.style.height=(h-8)+"px";compact.style.transform="translate(-50%,-50%)";return;}
    var target=document.getElementById("window");
    var full=target.dataset.maximized==="1";
    target.style.width=(full?w-8:1280)+"px";target.style.height=(full?h-8:960)+"px";
    var scale=full?1:Math.min(w/1296,h/972);
    var win = document.getElementById("window");
    win.style.transform = "translate(-50%,-50%) scale("+scale+")";
  },
  toggleSize:function(){
    var win=document.getElementById("window");win.dataset.maximized=win.dataset.maximized==="1"?"0":"1";this.fit();
  },

  /* ---------- 路由 ---------- */
  urlFor:function(route){
    if(route==="archive") return "http://archive.public-history.cn/mirror?id=199709";
    if(route==="/") return "http://"+SITE.domain+"/";
    return "http://"+SITE.domain+route;
  },
  parseRoute:function(hash){
    /* hash 形如 /board.html?page=4 */
    var path = hash.split("?")[0], qs = hash.split("?")[1]||"";
    var q = {};
    qs.split("&").forEach(function(kv){
      if(!kv) return;
      var p = kv.split("=");
      q[decodeURIComponent(p[0])] = decodeURIComponent(p[1]||"");
    });
    return {path:path, q:q};
  },

  go:function(route, opts){
    opts = opts||{};
    if(window.Endings&&Endings.active&&!opts.ending)return;
    if(!opts.silent) Audio.load();
    if(this.loading){ return; }
    var rt = this.parseRoute(route);
    /* 记住滚动 */
    if(this.history.length){
      var cur = this.history[this.history.length-1];
      this.scrollMem[cur.route] = document.getElementById("viewport").scrollTop;
    }
    this.loading = true;
    this.showLoadbar(opts);
    var self = this;
    var delay = 550 + Math.random()*500;
    if(Game.tier()>=3) delay += 700 + Math.random()*900;
    if(opts.fast) delay = 200;
    setTimeout(function(){
      self.history.push({route:route, title:opts.title||""});
      self.future = [];
      self.mountRoute(rt, opts);
      self.loading = false;
    }, delay);
  },

  back:function(){
    if(this.loading||(window.Endings&&Endings.active))return;
    if(this.history.length<=1) return;
    var cur = this.history.pop();
    this.future.push(cur);
    var prev = this.history[this.history.length-1];
    var rt = this.parseRoute(prev.route);
    this.loading = true;
    this.showLoadbar({fast:true});
    var self = this;
    setTimeout(function(){
      self.mountRoute(rt, {back:true});
      self.loading = false;
    }, 350);
  },
  forward:function(){
    if(this.loading||(window.Endings&&Endings.active))return;
    if(!this.future.length) return;
    var n = this.future.pop();
    this.history.push(n);
    var rt = this.parseRoute(n.route);
    var self = this;
    this.loading = true;
    this.showLoadbar({fast:true});
    setTimeout(function(){
      self.mountRoute(rt, {});
      self.loading = false;
    }, 350);
  },
  reload:function(){
    if(this.loading||(window.Endings&&Endings.active))return;
    var cur = this.history[this.history.length-1];
    if(!cur) return;
    var rt = this.parseRoute(cur.route);
    var self = this;
    this.loading = true;
    this.showLoadbar({});
    setTimeout(function(){
      self.mountRoute(rt, {reload:true});
      self.loading = false;
    }, 700);
  },

  showLoadbar:function(opts){
    var bar = document.getElementById("loadbar");
    var fill = document.getElementById("loadbar-fill");
    bar.classList.add("show");
    fill.classList.remove("run");
    void fill.offsetWidth;
    fill.classList.add("run");
    fill.classList.toggle("slow", Game.tier()>=3 && !opts.fast);
    document.getElementById("loadbar-text").textContent = "正在加载...";
  },
  hideLoadbar:function(){
    document.getElementById("loadbar").classList.remove("show");
  },

  mountRoute:function(rt, opts){
    opts=opts||{};
    if(window.ArchiveTools)ArchiveTools.beginPage();
    document.onselectionchange=null;
    Audio.stopProgram();
    var path = rt.path;
    Game.currentRoute=path+(Object.keys(rt.q).length?"?"+this.serialize(rt.q):"");
    /* 导航到新页面时，关闭残留的弹窗/系统窗口（档案详情等），避免遮罩遮挡 */
    var ml = document.getElementById("modal-layer");
    if(ml && ml.classList.contains("show")){
      ml.classList.remove("show");
      ml.innerHTML = "";
    }
    /* 导航时关闭可能残留的记事本 / 右键菜单 */
    var np = document.querySelector(".notepad");
    if(np) np.remove();
    this._hidePop();
    document.getElementById("addr-url").textContent = this.urlFor(path) + (Object.keys(rt.q).length ? "?"+this.serialize(rt.q) : "");
    document.getElementById("status-msg").textContent = "正在连接到 "+SITE.domain+" ...";
    var html = "";
    var page = Pages.dispatch(rt);
    if(!page){ html = Pages.notFound(); }
    else { html = page; }
    this.mount.innerHTML = html;
    this.mount.classList.remove("remember-sepia");
    document.body.classList.remove("on-archive","on-credits");
    if(window.Support) Support.notePage(path);
    document.getElementById("viewport").scrollTop = 0;
    if(opts.back && this.scrollMem[Game.currentRoute]!=null)document.getElementById("viewport").scrollTop=this.scrollMem[Game.currentRoute];
    /* 页面挂载后执行交互绑定 */
    if(Pages.after){
      Pages.after(rt, this.mount);
    }
    Game.applyCorruption();
    this.updateChrome(path);
    if(window.ArchiveTools){ArchiveTools.enhance(rt,this.mount);ArchiveTools.checkpoint();}
    Audio.loadDone();
    this.hideLoadbar();
    setTimeout(function(){
      document.getElementById("status-msg").textContent = "完毕";
    }, 400);
  },
  serialize:function(q){
    return Object.keys(q).map(function(k){ return encodeURIComponent(k)+"="+encodeURIComponent(q[k]); }).join("&");
  },

  updateChrome:function(path){
    var title = "槐隐学园";
    if(path==="archive") title = "槐隐学园 - 公共网络历史归档";
    else if(path==="/student.html") title = "槐隐学园 - 学籍管理系统";
    else if(path==="/admin.html") title = "槐隐学园 - 幸福指数管理后台";
    else if(path==="/diary.html") title = "槐隐学园 - 隐藏日记";
    else if(path==="/board.html") title = "槐隐学园 - 家长留言";
    else if(path==="/star.html") title = "槐隐学园 - 教务公示";
    else if(path==="/radio.html") title = "槐隐学园 - 校园广播";
    else if(path==="/about.html") title = "槐隐学园 - 学校概况";
    else if(path==="/news.html") title = "槐隐学园 - 新闻中心";
    else if(path==="/teach.html") title = "槐隐学园 - 教学教研";
    document.getElementById("tb-title").textContent = title;
    document.getElementById("nav-back").classList.toggle("tb-tool-disabled", this.history.length<=1);
    document.getElementById("nav-forward").classList.toggle("tb-tool-disabled", !this.future.length);
  },

  /* ---------- 网站公共框架 ---------- */
  frame:function(inner, active){
    var special = "";
    if(Game.specialVisible()){
      var cls = "dd-item dd-special";
      if(Game.specialEnabled()) cls += " unlocked";
      if(Game.has("songClick") && !Game.specialEnabled()) cls += " highlight";
      if(Game.specialEnabled()) cls += " highlight";
      special = '<div class="dd-item'+specialCls()+'">特殊档案</div>';
      function specialCls(){
        var c = "";
        if(Game.specialEnabled()) c=" unlocked highlight";
        else if(Game.has("songClick")) c=" highlight";
        return c;
      }
      special = '<div class="dd-item dd-special'+specialCls()+'" data-special="1">特殊档案</div>';
    }
    var navItems = [
      ["/","首页",""],
      ["/about.html","学校概况",""],
      ["/news.html","新闻中心",""],
      ["/star.html","德育工作","<div class='nav-dropdown'><div class='dd-item' data-go='/star.html'>幸福之星公示</div>"+special+"</div>"],
      ["/teach.html","教学教研",""],
      ["/board.html","家长互动",""],
      ["/radio.html","校园之声",""]
    ];
    var navHtml = navItems.map(function(it){
      var isActive = (active && (it[0]==="/"+active+".html" || (it[0]==="/" && active==="index")));
      return '<div class="nav-item'+(isActive?" active":"")+'" data-go="'+it[0]+'">'+it[1]+it[2]+'</div>';
    }).join("");

    var treeCls = "footer-tree";
    if(Game.has("footerTree")) treeCls += " hot";
    if(Game.has("deletedMsg")||Game.has("audioSecret")) treeCls += " redstroke";

    return ''+
    '<div class="site-wrap">'+
      '<div class="site-top">'+
        '<img class="site-crest" src="assets/images/crest.png" alt="校徽">'+
        '<div><span class="site-name">槐隐学园</span><span class="site-sub">省级幸福校园示范校</span></div>'+
      '</div>'+
      '<div class="site-nav" id="siteNav">'+navHtml+'</div>'+
      '<div id="siteInner">'+inner+'</div>'+
      '<div class="site-footer">'+
        '校址：'+SITE.addr+'　|　联系电话：'+SITE.phone+'<br>'+
        '<img class="'+treeCls+'" id="footerTree" src="assets/images/tree-icon.png" alt="" title="">'+
        ' 槐隐学园 版权所有 © 2004-2007　'+
        '<a href="/about-site.html" data-go="/about-site.html">关于本站</a>　|　'+
        '<a href="/sitemap.html" data-go="/sitemap.html">站点地图</a>　|　'+
        '<a href="/about.html" data-go="/about.html">学校概况</a>'+
        '<br><span style="font-size:11px;color:#999;">建议使用 Internet Explorer 6.0 以上版本浏览　1024×768 分辨率</span>'+
      '</div>'+
    '</div>';
  },

  /* 点击代理：站点内所有 data-go */
  bindNav:function(root){
    var self = this;
    root.querySelectorAll("[data-go]").forEach(function(el){
      el.onclick = function(e){
        e.preventDefault();e.stopPropagation();
        var href = el.getAttribute("data-go");
        Audio.click();
        if(href==="__SPECIAL__"){
          if(Game.specialEnabled()){ Shell.go("/admin.html"); }
          else {
            Shell.go("/verify.html");
          }
          return;
        }
        Shell.go(href);
      };
    });
    /* 页脚槐树三击（原有入口保留，同时提供可见替代入口） */
    var ft = root.querySelector("#footerTree");
    if(ft){
      var hits = 0, timer = null;
      ft.style.cursor = "default";
      ft.onclick = function(){
        hits++;
        Audio.click();
        clearTimeout(timer);
        if(hits>=3){
          Game.setFlag("footerTree");
          Shell.status("特殊档案入口已出现");
          Shell.flash(ft);
          if(window.ArchiveTools)ArchiveTools.refreshAccess();
          hits=0;
        } else {
          timer = setTimeout(function(){ hits=0; }, 1200);
        }
      };
    }
    /* 特殊档案下拉 */
    var sp = root.querySelector("[data-special]");
    if(sp){
      sp.onclick = function(e){
        e.preventDefault();e.stopPropagation();
        Audio.click();
        if(Game.specialEnabled()){
          Shell.go("/admin.html");
        } else {
          Game.setFlag("specialAttempt");
          Shell.go("/verify.html");
        }
      };
    }
  },

  currentPath:function(){
    var cur = this.history[this.history.length-1];
    return cur ? this.parseRoute(cur.route).path : "";
  },

  /* ---------- 模态框 ---------- */
  alert:function(title, text, opts){
    opts = opts||{};
    Audio.ding();
    var icon = opts.icon==="warn" ? "warn" : opts.icon==="err" ? "err" : "";
    var iconText = opts.icon==="warn" ? "!" : opts.icon==="err" ? "×" : "i";
    var id = "m"+Date.now();
    var html = '<div class="modal-mask"></div>'+
      '<div class="xp-modal" id="'+id+'">'+
        '<div class="xp-modal-title"><span>'+title+'</span><span class="m-close" data-close="1">×</span></div>'+
        '<div class="xp-modal-body"><div class="xp-modal-icon '+icon+'">'+iconText+'</div>'+
        '<div class="xp-modal-text">'+text.replace(/</g,"&lt;").replace(/\n/g,"<br>")+'</div></div>'+
        '<div class="xp-modal-footer"><button class="xp-btn" data-close="1">确定</button></div>'+
      '</div>';
    this.modalLayer.innerHTML = html;
    this.modalLayer.classList.add("show");
    var self = this;
    this.modalLayer.querySelectorAll("[data-close]").forEach(function(b){
      b.onclick = function(){
        Audio.click();
        self.modalLayer.classList.remove("show");
        self.modalLayer.innerHTML = "";
        if(opts.onClose) opts.onClose();
      };
    });
    this.modalLayer.querySelector(".modal-mask").onclick = function(){
      Audio.click();
      self.modalLayer.classList.remove("show");
      self.modalLayer.innerHTML = "";
      if(opts.onClose) opts.onClose();
    };
  },

  /* 系统窗口（档案详情等） */
  openWindow:function(title, innerHTML, width){
    var id = "sysw"+Date.now();
    var html = '<div class="modal-mask"></div>'+
      '<div class="sys-modal" id="'+id+'" style="width:'+(width||680)+'px;">'+
        '<div class="sys-modal-title"><span>'+title+'</span><span class="m-close" data-close="1">×</span></div>'+
        '<div class="sys-modal-body">'+innerHTML+'</div>'+
      '</div>';
    this.modalLayer.innerHTML = html;
    this.modalLayer.classList.add("show");
    var self = this;
    this.modalLayer.querySelectorAll("[data-close]").forEach(function(b){
      b.onclick = function(){
        Audio.click();
        self.modalLayer.classList.remove("show");
        self.modalLayer.innerHTML = "";
      };
    });
    this.modalLayer.querySelector(".modal-mask").onclick = function(){
      Audio.click();
      self.modalLayer.classList.remove("show");
      self.modalLayer.innerHTML = "";
    };
    return this.modalLayer;
  },

  /* ---------- 记事本（查看源文件） ---------- */
  openNotepad:function(title, text){
    var html = '<div class="modal-mask"></div>'+
      '<div class="notepad">'+
        '<div class="notepad-title"><span>'+title+'</span><span class="m-close" data-close="1">×</span></div>'+
        '<div class="notepad-menu"><span>文件(F)</span><span>编辑(E)</span><span>格式(O)</span><span>查看(V)</span><span>帮助(H)</span></div>'+
        '<pre class="notepad-body">'+text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</pre>'+
      '</div>';
    this.modalLayer.innerHTML = html;
    this.modalLayer.classList.add("show");
    Audio.click();
    var self = this;
    this.modalLayer.querySelectorAll("[data-close]").forEach(function(b){
      b.onclick = function(){
        Audio.click();
        self.modalLayer.classList.remove("show");
        self.modalLayer.innerHTML = "";
      };
    });
    this.modalLayer.querySelector(".modal-mask").onclick = function(){
      Audio.click();
      self.modalLayer.classList.remove("show");
      self.modalLayer.innerHTML = "";
    };
  },

  /* 生成当前页的伪源文件（随线索解锁的 HTML 注释彩蛋） */
  viewSource:function(){
    var path = this.currentPath();
    var bank = SOURCE_BANK[path] || {
      title: document.getElementById("tb-title").textContent || "槐隐学园",
      body:['<html>','  <body>该页面为离线归档镜像，原始源文件已部分损坏。</body>','</html>'],
      notes:[]
    };
    var lines = [];
    lines.push('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">');
    lines.push('<html>');
    lines.push('<head>');
    lines.push('<meta http-equiv="Content-Type" content="text/html; charset=gb2312">');
    lines.push('<title>'+bank.title+'</title>');
    SOURCE_COMMON.forEach(function(c){ lines.push(c); });
    lines.push('</head>');
    lines.push('<body');
    if(path==="/admin.html" || path==="/student.html"){
      lines.push(' bgcolor="#'+(path==="/admin.html"?"22242a":"eef1f4")+'"');
    }
    lines.push('>');
    /* 逐条输出 body，条件注释插在对应位置 */
    var body = bank.body.slice();
    var notes = bank.notes.filter(function(n){ return n[0]===null || Game.has(n[0]); });
    body.forEach(function(l){ lines.push(l); });
    /* 已解锁的隐藏注释集中放在 body 末尾，像程序员随手留下的 */
    if(notes.length){ lines.push(""); notes.forEach(function(n){ lines.push(n[1]); }); }
    if(Game.ngplus || Game.tier()>=3){
      lines.push("");
      lines.push(SOURCE_FINAL);
    }
    lines.push('</body>');
    lines.push('</html>');
    var url = this.urlFor(path);
    this.openNotepad(url.replace(/^https?:\/\//,"")+" - 记事本", lines.join("\r\n"));
  },

  /* ---------- 碎片纸条 ---------- */
  fragment:function(i){
    var d = DIARY[i];
    if(!d) return;
    var isNew = Game.collectFragment(i);
    if(!isNew){
      /* 已收集过，也显示内容 */
    }
    var n = Game.ngplus ? 14 + Game.fragmentCount() : 14;
    var html = '<div class="modal-mask"></div>'+
      '<div class="fragment-note">'+
        '<span class="frag-count">镜像累计访问：'+n+'</span>'+
        '<div class="frag-date">'+d.date+'</div>'+
        '<div>'+d.text+'</div>'+
        '<div class="frag-close"><button class="xp-btn" data-close="1">合上</button></div>'+
      '</div>';
    this.fragLayer.innerHTML = html;
    this.fragLayer.classList.add("show");
    Audio.ding();
    var self = this;
    this.fragLayer.querySelectorAll("[data-close]").forEach(function(b){
      b.onclick = function(){
        Audio.click();
        self.fragLayer.classList.remove("show");
        self.fragLayer.innerHTML = "";
      };
    });
    this.fragLayer.querySelector(".modal-mask").onclick = function(){
      Audio.click();
      self.fragLayer.classList.remove("show");
      self.fragLayer.innerHTML = "";
    };
  },

  /* ---------- 工具 ---------- */
  status:function(msg){
    document.getElementById("status-msg").textContent = msg;
  },
  flash:function(el){
    if(window.ArchiveTools&&ArchiveTools.settings.reducedFlash){el.classList.add("steady-cue");setTimeout(function(){el.classList.remove("steady-cue");},2200);return;}
    var n = 0;
    var t = setInterval(function(){
      el.style.opacity = (n%2) ? "1" : "0.2";
      n++;
      if(n>6){ clearInterval(t); el.style.opacity="1"; }
    },120);
  },
  pageFlash:function(){
    if(window.ArchiveTools&&ArchiveTools.settings.reducedFlash){Shell.status("归档内容发生变化。");return;}
    var vp = document.getElementById("viewport");
    vp.style.transition = "none";
    vp.style.background = "#f4f4f4";
    vp.style.opacity = "0.6";
    setTimeout(function(){
      vp.style.transition = "opacity .4s, background .4s";
      vp.style.background = "#fff";
      vp.style.opacity = "1";
    }, 90);
  },

  /* 关闭窗口：直接进入「遗忘」结局（若已进入网站） */
  closed:false,
  onClose:function(){
    Audio.click();
    if(this.closed){
      this.closed=false;
      document.getElementById("window").classList.remove("closed");
      return;
    }
    var cur = this.history[this.history.length-1];
    if(cur && this.parseRoute(cur.route).path !== "archive"){
      if(window.Endings){ Endings.forget(); }
    } else {
      /* 序章关闭：断开 */
      this.closed = true;
      document.getElementById("window").classList.add("closed");
      document.getElementById("desktop").style.cursor = "default";
      Endings.blackScreen("连接已断开", "archive");
    }
  }
};
