/* ============================================================
   槐隐学园 · 自愿支持（1 元）
   照搬《许愿柳》的付款流程并按本作品调整。
   支持状态与游戏进度完全独立，从不拦截任何剧情或结局；
   自动弹窗只在进入站点后、安静浏览时出现一次，随时可关。
   ============================================================ */

var Support = {
  KEY:  "huaiyin_support",        // 已支持（localStorage）
  SES:  "_huaiyin_support_s",     // 本次会话已支持
  COOKIE:"_huaiyin_support_flag", // 兜底 cookie
  AUTO: "huaiyin_support_auto",   // 自动弹窗是否已出现过
  qr:   "assets/images/paycode.png",

  armed:false,
  enterAt:0,
  pages:null,
  _timer:null,

  /* ---------- 存储（file:// 下尽量多用几路兜底） ---------- */
  _getCookie:function(name){
    try{
      var key = name + "=";
      var parts = document.cookie.split(";");
      for(var i=0;i<parts.length;i++){
        var v = parts[i].trim();
        if(v.indexOf(key)===0) return v.slice(key.length);
      }
    }catch(e){}
    return "";
  },
  _setCookie:function(name,value,days){
    try{
      var d = new Date();
      d.setTime(d.getTime() + days*86400000);
      document.cookie = name+"="+value+";expires="+d.toUTCString()+";path=/;SameSite=Lax";
    }catch(e){}
  },
  hasPaid:function(){
    try{
      return !!(localStorage.getItem(this.KEY) || sessionStorage.getItem(this.SES) || this._getCookie(this.COOKIE));
    }catch(e){
      return !!this._getCookie(this.COOKIE);
    }
  },
  hasAutoSeen:function(){
    try{ return localStorage.getItem(this.AUTO)==="1"; }catch(e){ return false; }
  },
  markAutoSeen:function(){
    try{ localStorage.setItem(this.AUTO,"1"); }catch(e){}
  },
  markPaid:function(){
    var raw = Date.now()+"_"+Math.random().toString(36).slice(2,10)+"_archive_199709";
    var token = raw;
    try{ token = btoa(unescape(encodeURIComponent(raw))); }catch(e){}
    try{
      localStorage.setItem(this.KEY, token);
      sessionStorage.setItem(this.SES, token);
    }catch(e){}
    this._setCookie(this.COOKIE, token, 365);
    document.body.classList.add("support-complete");
  },

  /* ---------- 常驻入口（挂在 IE 窗口内，跟着窗口缩放） ---------- */
  ensureChip:function(){
    var win = document.getElementById("window");
    if(!win || document.getElementById("hySupportChip")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "hySupportChip";
    btn.className = "hy-support-chip";
    btn.setAttribute("aria-label","支持作者 1 元");
    btn.innerHTML = '<span class="hy-yen">￥</span><b>支持作者</b>';
    btn.addEventListener("click", function(){ Audio.click && Audio.click(); Support.show({manual:true}); });
    win.appendChild(btn);
    if(this.hasPaid()) document.body.classList.add("support-complete");
  },

  /* ---------- 进入站点后开始计时（仅一次自动弹窗） ---------- */
  arm:function(){
    this.ensureChip();
    this.pages = {};
    this.armed = true;
    this.enterAt = Date.now();
    if(this._timer) clearInterval(this._timer);
    this._timer = setInterval(function(){ Support._tick(); }, 2000);
  },
  notePage:function(path){
    if(!this.armed || !this.pages) return;
    if(path && path!=="archive") this.pages[path] = true;
  },
  _busy:function(){
    if(document.hidden) return true;
    if(Endings && Endings.active) return true;
    var ml = document.getElementById("modal-layer");
    if(ml && ml.classList.contains("show")) return true;
    var fl = document.getElementById("fragment-layer");
    if(fl && fl.classList.contains("show")) return true;
    if(document.querySelector(".notepad") || document.querySelector(".ie-pop")) return true;
    return false;
  },
  /* 仅在“安静浏览页”（只读内容页）才自动弹，绝不打断查询/解谜 */
  _quiet:function(path){
    if(!path || path==="archive") return false;
    var blocked = ["admin","board","diary","star","student","teach",
                   "seat","essay","login","fragment","query"];
    for(var i=0;i<blocked.length;i++){
      if(path.indexOf(blocked[i])>=0) return false;
    }
    return true;
  },
  _tick:function(){
    if(!this.armed || this.hasPaid() || this.hasAutoSeen()){
      if(this._timer){ clearInterval(this._timer); this._timer = null; }
      return;
    }
    var addr = (document.getElementById("addr-url")||{}).textContent || "";
    if(addr.indexOf("archive")>=0) return;            // 归档序章不弹
    if(this._busy()) return;                          // 弹窗/结局/记事本中不弹
    var path = (window.Shell && Shell.currentPath) ? Shell.currentPath() : "";
    if(!this._quiet(path)) return;                    // 解谜交互页不弹
    var elapsed = Date.now() - this.enterAt;
    var pageCount = this.pages ? Object.keys(this.pages).length : 0;
    if((pageCount>=2 && elapsed>=34000) || elapsed>=90000){
      this.markAutoSeen();
      this.show({auto:true});
    }
  },

  /* ---------- 弹窗 ---------- */
  show:function(options){
    options = options || {};
    this.ensureChip();
    if(this.hasPaid()){
      if(options.manual) this.toast("已经收到你的支持啦，别再给了。继续往下走就好。");
      return;
    }
    var overlay = document.getElementById("hySupportOverlay");
    if(!overlay){
      overlay = document.createElement("div");
      overlay.className = "hy-paywall-overlay";
      overlay.id = "hySupportOverlay";
      overlay.innerHTML =
        '<section class="hy-paywall-card" role="dialog" aria-modal="true" aria-labelledby="hyPayTitle">'+
          '<button type="button" class="hy-paywall-close" aria-label="关闭">×</button>'+
          '<div class="hy-paywall-inner">'+
            '<header class="hy-paywall-head">'+
              '<div class="hy-paywall-eyebrow">公共网络历史归档 · 一封读者来信</div>'+
              '<h2 id="hyPayTitle">如果你愿意，支持《槐隐学园》一块钱</h2>'+
              '<p>完全自愿，不影响任何剧情和结局。</p>'+
            '</header>'+
            '<div class="hy-paywall-body">'+
              '<figure class="hy-paywall-qr">'+
                '<img src="'+this.qr+'" alt="1 元支持收款码">'+
                '<figcaption>扫码支持 1 元</figcaption>'+
              '</figure>'+
              '<div class="hy-paywall-copy">'+
                '<p>你好，我是 abc。谢谢你愿意在这个 2007 年的旧网站里，耐着性子去点那些没什么人会点的东西。</p>'+
                '<p>做这个镜像的时候，我没怎么想把网页做得有多像，我想的是——你在一个灰掉的名字、一条被删掉的留言前，会不会愿意停下来，再多查一页。</p>'+
                '<p>如果这一趟让你觉得值，愿意留下一块钱，我会很开心。不方便也完全没关系，关掉这里继续走，后面的结局一个都不会少。</p>'+
                '<p class="hy-paywall-line">这一块钱不会让她重新活过来，也不会让那所学校消失。它只是让我知道：在某个地方，有人记住了林晚。</p>'+
              '</div>'+
            '</div>'+
            '<footer class="hy-paywall-foot">'+
              '<button type="button" class="hy-paywall-done">我支持了一下</button>'+
              '<button type="button" class="hy-paywall-later">先继续查</button>'+
            '</footer>'+
          '</div>'+
        '</section>';
      document.body.appendChild(overlay);
      overlay.querySelector(".hy-paywall-close").addEventListener("click", function(){ Support.hide(); });
      overlay.querySelector(".hy-paywall-later").addEventListener("click", function(){ Support.hide(); });
      overlay.querySelector(".hy-paywall-done").addEventListener("click", function(){
        Support.markPaid();
        Support.hide();
        Support.toast("收到啦，谢谢你。替她，也替我。");
      });
      overlay.addEventListener("click", function(e){ if(e.target===overlay) Support.hide(); });
    }
    overlay.hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ overlay.classList.add("is-open"); });
    });
    var c = overlay.querySelector(".hy-paywall-close");
    if(c) c.focus({preventScroll:true});
  },
  hide:function(){
    var overlay = document.getElementById("hySupportOverlay");
    if(!overlay) return;
    overlay.classList.remove("is-open");
    setTimeout(function(){ overlay.hidden = true; }, 360);
  },
  toast:function(text){
    var old = document.querySelector(".hy-support-toast");
    if(old) old.remove();
    var el = document.createElement("div");
    el.className = "hy-support-toast";
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add("show"); });
    setTimeout(function(){ el.classList.remove("show"); setTimeout(function(){ el.remove(); }, 350); }, 3400);
  },

  init:function(){
    this.ensureChip();
    document.addEventListener("keydown", function(e){
      if(e.key==="Escape") Support.hide();
    });
  }
};
