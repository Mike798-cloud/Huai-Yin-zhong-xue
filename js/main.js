/* ============================================================
   槐隐学园 · 序章：归档提示页 / 启动
   ============================================================ */

var Archive = {
  lines:[
    "公共网络历史归档服务",
    "你正在访问一份已注销站点的离线镜像",
    "站点名称：槐隐学园官方网站",
    "原域名：www.huaiyin-middle.edu.cn",
    "站点存续时间：2004.10 - 2007.09",
    "最后快照时间：2007-09-08 01:14",
    "",   /* 累计访问次数，动态填充 */
    "警告：镜像内容未经过滤",
    "可能包含未审核的原始数据",
    "",
    "是否继续查看？"
  ],

  boot:function(ngplus){
    if(window.ArchiveTools){ArchiveTools.clearCheckpoint();ArchiveTools.beginPage();}
    Shell.closed=false;Shell.loading=false;document.getElementById("window").classList.remove("closed");
    if(ngplus){
      Game.newRun(true);
    } else {
      Game.newRun(Game.profile.completed);
    }
    Shell.history = [];
    Shell.future = [];
    /* 防御：进入归档页时确保结局/碎片/模态层全部清空，不残留遮罩 */
    var el = document.getElementById("ending-layer");
    if(el){ el.classList.remove("show"); el.innerHTML=""; }
    var fl = document.getElementById("fragment-layer");
    if(fl){ fl.classList.remove("show"); fl.innerHTML=""; }
    var ml = document.getElementById("modal-layer");
    if(ml){ ml.classList.remove("show"); ml.innerHTML=""; }
    if(window.Endings){ Endings.active = false; }
    this.render();
  },

  render:function(){
    var ng = Game.isNGPlus();
    var visits = ng ? 14 + Game.fragmentCount() : 13;
    this.lines[6] = "累计访问次数："+visits;
    var tinyLine = ng ? '<div class="archive-tiny" style="opacity:0;">镜像已更新，包含未归档碎片</div>' : "";

    var html =
      '<div class="p-archive">'+
        '<div class="archive-box">'+
          '<div class="archive-head"><span>公共网络历史归档服务 — 离线镜像 #199709</span></div>'+
          '<div class="archive-body" id="archiveBody">'+
            this.lines.map(function(l,i){
              return '<div class="archive-line" data-i="'+i+'" style="opacity:0;">'+(l||"&nbsp;")+'</div>';
            }).join("")+
            '<div id="archiveExtra" style="opacity:0;">'+tinyLine+'</div>'+
          '</div>'+
          '<div class="archive-foot" id="archiveFoot" style="opacity:0;">'+
            '<button class="ie-btn" id="btnContinue">继续查看</button>'+
            '<button class="ie-btn" id="btnAbout">关于归档</button>'+
            '<button class="ie-btn" id="btnBack">返回列表</button>'+
          '</div>'+
        '</div>'+
      '</div>';
    Shell.mount.innerHTML = html;
    document.body.classList.add("on-archive");
    document.body.classList.remove("on-ending","on-credits");
    /* 归档框在视口内垂直居中：min-height 精确等于视口内容高度（兼容最大化/缩放） */
    var pa = Shell.mount.querySelector(".p-archive");
    if(pa){ pa.style.minHeight = document.getElementById("viewport").clientHeight + "px"; }
    document.getElementById("addr-url").textContent = Shell.urlFor("archive");
    document.getElementById("tb-title").textContent = "槐隐学园 - 公共网络历史归档";
    Game.applyCorruption();
    ArchiveTools.addResumeButton();
    this.typeLines(ng);
  },

  typeLines:function(ng){
    var body = document.getElementById("archiveBody");
    var els = body.querySelectorAll(".archive-line");
    var i = 0;
    var self = this;
    function step(){
      if(i>=els.length){
        if(ng){
          var ex = document.getElementById("archiveExtra");
          if(ex){
            ex.firstChild.style.opacity = "1";
            ex.firstChild.style.transition = "opacity 2s";
          }
        }
        var foot = document.getElementById("archiveFoot");
        foot.style.transition = "opacity 1.2s";
        foot.style.opacity = "1";
        self.bindButtons();
        return;
      }
      var el = els[i];
      el.style.opacity = "1";
      el.style.transition = "opacity .3s";
      if(i===els.length-1){
        var cur = document.createElement("span");
        cur.className = "cur";
        el.appendChild(cur);
      }
      i++;
      ArchiveTools.later(step, 1100);
    }
    ArchiveTools.later(step, 500);
  },

  bindButtons:function(){
    var cont = document.getElementById("btnContinue");
    var about = document.getElementById("btnAbout");
    var back = document.getElementById("btnBack");

    cont.onclick = function(){
      Audio.init();
      Audio.resume();
      Audio.click();
      var body = document.getElementById("archiveBody");
      var foot = document.getElementById("archiveFoot");
      foot.innerHTML = '<div style="font-size:13px;color:#444;">正在加载镜像，请稍候……</div>';
      var bar = document.createElement("div");
      bar.style.cssText = "width:420px;height:16px;border:1px solid #888;background:#fff;margin:10px 0 26px 42px;overflow:hidden;";
      bar.innerHTML = '<div style="height:100%;width:0;background:repeating-linear-gradient(45deg,#1c5fb8 0 8px,#3e8ae0 8px 16px);transition:width 1.9s linear;" id="mirrorFill"></div>';
      var box = document.querySelector(".archive-box");
      box.appendChild(bar);
      Audio.load();
      ArchiveTools.later(function(){ document.getElementById("mirrorFill").style.width = "100%"; }, 60);
      ArchiveTools.later(function(){
        Shell.history.push({route:"/"});
        Shell.mountRoute(Shell.parseRoute("/"), {});
        if(window.Support) Support.arm();
      }, 2050);
    };

    about.onclick = function(){
      Audio.click();
      var ng = Game.isNGPlus();
      var visitor = ng ? (15 + Game.fragmentCount()) : 14;
      Shell.alert("关于归档",
        "本镜像由公共网络历史归档计划自动抓取。\n"+
        "仅用于历史研究与站点保护。\n"+
        "内容均为原始站点快照，不代表归档方观点。\n"+
        "技术支持：网络记忆项目。\n"+
        "镜像生成时间：2007-09-08 02:00。\n\n"+
        "第 "+visitor+" 位访问者。",
        {icon:""});
    };

    back.onclick = function(){
      Audio.click();
      Endings.blackScreen("连接已断开", "archive");
    };
  }
};

/* ---------- 启动 ---------- */
window.addEventListener("DOMContentLoaded", function(){
  Shell.init();
  Pages.init();
  if(window.Support) Support.init();
  ArchiveTools.init();
  Game.newRun(Game.profile.completed);
  Archive.render();
});
