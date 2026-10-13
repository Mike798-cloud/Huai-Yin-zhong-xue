/* ============================================================
   槐隐学园 · 结局演出
   ============================================================ */

var Endings = {
  layer:null,
  active:false,

  el:function(){ return document.getElementById("ending-layer"); },

  /* 清除结局层（与「揭露结局 reset」同名冲突已修复，此函数专用于清层） */
  clearLayer:function(){
    this.layer && (this.layer.innerHTML="");
    this.layer && this.layer.classList.remove("show");
    document.body.classList.remove("on-ending","on-credits");
    this.active = false;
  },

  /* ---------- 结局一：关闭窗口（遗忘） ---------- */
  forget:function(){
    this.active = true;
    document.body.classList.add("on-ending");
    Game.finish("forget");
    Audio.stopProgram();
    var layer = this.el();
    layer.innerHTML =
      '<div class="ending-veil" style="background:#e8e8e4;"></div>'+
      '<div class="ending-center" style="color:#555;opacity:0;transition:opacity 2s;">'+
        '<div style="font-size:18px;letter-spacing:4px;">连接已断开</div>'+
        '<div style="font-size:13px;color:#999;margin-top:12px;">该标签页已关闭。</div>'+
      '</div>';
    layer.classList.add("show");
    var veil = layer.querySelector(".ending-veil");
    var center = layer.querySelector(".ending-center");
    setTimeout(function(){
      veil.classList.add("fade");
      Audio.wind();
    }, 200);
    setTimeout(function(){
      veil.style.opacity = "0";
      veil.style.transition = "opacity 1.5s";
      center.style.opacity = "1";
    }, 2600);
    setTimeout(function(){
      this.credits("遗忘");
    }.bind(this), 5200);
  },

  /* ---------- 结局二：重置数据（揭露） ---------- */
  reset:function(){
    this.active = true;
    document.body.classList.add("on-ending");
    Game.finish("reset");
    Audio.stopProgram();
    Game.setFlag("inAdmin");
    Game.applyCorruption();
    var layer = this.el();
    var stream = [];
    BLOCKED_MSGS.forEach(function(m){ stream.push("["+m[1]+"] "+m[2]); });
    stream.push("[09-07 23:41] 删除学生档案：林晚（学号 063143）");
    stream.push("[09-08 00:55] 关联数据清理：留言、照片、座位表");
    stream.push("[09-08 01:14] 班级幸福指数重算，由 92 修正为 97");
    stream.push("[恢复] 林晚 · 高二(3)班 · 学号 063143");
    stream.push("[恢复] 留言 3 条 · 广播记录 1 条 · 座位表 1 份");
    stream.push("[恢复] 9月7日 实验楼 处理 —— 原始记录");

    var lines = stream.map(function(s,i){
      return '<div style="opacity:0;transform:translateX(-8px);" data-i="'+i+'">'+s.replace(/</g,"&lt;")+'</div>';
    }).join("");

    layer.innerHTML =
      '<div class="ending-stream" id="resetStream">'+lines+'</div>'+
      '<div class="ending-center" style="opacity:0;pointer-events:none;" id="resetCenter">'+
        '<div class="plaque-line" id="plaqueLine"><span id="plaqueText">省级幸福校园示范校</span><span class="plaque-strike" id="plaqueStrike"></span></div>'+
        '<div class="ending-line" id="thanksLine"></div>'+
      '</div>'+
      '<div class="ending-veil" id="resetVeil" style="background:#0c0c10;"></div>';
    layer.classList.add("show");
    var streamEl = layer.querySelector("#resetStream");
    Audio.staticHit(0.06);
    var i = 0;
    var timer = setInterval(function(){
      var nodes = streamEl.querySelectorAll("div[data-i]");
      if(i<nodes.length){
        nodes[i].style.transition = "opacity .2s";
        nodes[i].style.opacity = "1";
        if(i%3===0) Audio.staticHit(0.03);
        streamEl.scrollTop = streamEl.scrollHeight;
        i++;
      } else {
        clearInterval(timer);
        var veil = layer.querySelector("#resetVeil");
        veil.style.opacity = "0";
        setTimeout(function(){
          veil.classList.add("fade");
          var c = layer.querySelector("#resetCenter");
          c.style.pointerEvents = "auto";
          c.style.opacity = "1";
          /* 牌匾崩裂（真相的代价） */
          var plaque = layer.querySelector("#plaqueLine");
          var strike = layer.querySelector("#plaqueStrike");
          setTimeout(function(){
            plaque.classList.add("crack");
            strike.classList.add("draw");
            Audio.staticHit(0.05);
          }, 900);
          /* “谢谢。”逐字浮现 */
          var tl = layer.querySelector("#thanksLine");
          var word = "谢谢。";
          setTimeout(function(){
            tl.classList.add("show");
            Audio.wind();
            var k = 0;
            var wt = setInterval(function(){
              tl.textContent = word.slice(0, k+1);
              k++;
              if(k>=word.length){ clearInterval(wt); }
            }, 760);
          }, 3000);
        }, 800);
      }
    }, 520);
    setTimeout(function(){
      this.credits("揭露");
    }.bind(this), 17000);
  },

  /* ---------- 结局三：新增观测者（铭记） ---------- */
  observer:function(){
    this.active = true;
    document.body.classList.add("on-ending");
    Game.finish("observer");
    Audio.stopProgram();
    var full = Game.allFragments();
    var msg = full ? "林晚，我记得你。" : "我记得你。";
    Game.flags.__observerPost = msg;
    /* 跳回留言板，自动发布新留言 */
    setTimeout(function(){
      Shell.go("/board.html?post=remember");
    }, 100);
    var layer = this.el();
    setTimeout(function(){
      layer.innerHTML =
        '<div class="ending-veil" id="obVeil" style="background:linear-gradient(to bottom,#efe8d2,#e4d8b8);"></div>'+
        '<div class="ending-center" id="obCenter" style="opacity:0;transition:opacity 2.5s;">'+
          (full ? '<img class="ending-tree" id="obTree" src="assets/images/tree-silhouette.png" alt=""><div class="ending-name" id="obName">林晚</div>' : '')+
        '</div>';
      layer.classList.add("show");
      Audio.wind();
      setTimeout(function(){
        layer.querySelector("#obVeil").classList.add("fade");
        layer.querySelector("#obCenter").style.opacity = "1";
        layer.querySelector("#obVeil").style.opacity = "0.35";
        if(full){
          setTimeout(function(){
            var t = layer.querySelector("#obTree");
            if(t) t.classList.add("show");
          }, 1500);
          setTimeout(function(){
            var n = layer.querySelector("#obName");
            if(n) n.classList.add("show");
          }, 4200);
        }
      }, 900);
      setTimeout(function(){
        this.credits(full ? "铭记于心" : "铭记");
      }.bind(this), full ? 10500 : 5500);
    }.bind(this), 1800);
  },

  /* ---------- 序章：返回列表（断开） ---------- */
  blackScreen:function(text, target){
    this.active = true;
    document.body.classList.add("on-ending");
    var layer = this.el();
    layer.innerHTML =
      '<div class="ending-veil" id="bkVeil" style="background:#1c1c1c;"></div>'+
      '<div class="ending-center" id="bkCenter" style="opacity:0;transition:opacity 2s;">'+
        '<div class="ending-line" style="color:#888;">'+text+'</div>'+
      '</div>';
    layer.classList.add("show");
    var veil = layer.querySelector("#bkVeil");
    setTimeout(function(){ veil.classList.add("fade"); }, 150);
    setTimeout(function(){ layer.querySelector("#bkCenter").style.opacity="1"; }, 2600);
    setTimeout(function(){
      this.restartBox("断开", "你回到了归档列表，那座站点再也没有被打开。");
    }.bind(this), 4800);
  },

  /* ---------- 感谢游玩 / 制作名单（结局最后一页） ---------- */
  creditsCopy:function(name){
    var full = Game.allFragments();
    var map = {
      "遗忘":{
        lead:"你合上了页面。",
        body:"这也是大多数人的选择，不怪你。被抹去的人会越来越淡，连想提她的人都不敢出声——这不是谁一个人的错。<br>只是如果以后还会路过这里，请记得：2007 年的高二(3)班，最后一排靠窗的位置，少了一个人。"
      },
      "揭露":{
        lead:"你把她从数据里翻了回来。",
        body:"示范校的牌匾、班级的荣誉、集体的幸福，跟着一起塌了。真相从来不难，难的是没人愿意把它翻出来。<br>你翻了。所以她，重新存在过。"
      },
      "铭记":{
        lead:"一条没有署名的留言，停在了所有人都会路过的地方。",
        body:"你没集齐全部碎片，可在那一瞬间，你还是记住了一个人。<br>这也够了。"
      },
      "铭记于心":{
        lead:"你没有改变任何事，可你记得了她。",
        body:"她没有被拯救，也没有什么结局被改写。她能得到的，只是一个人在留言板上写下她的名字。<br>槐树底下，她终于有了名字。"
      }
    };
    return map[name] || map["遗忘"];
  },

  credits:function(endingName){
    var layer = this.el();
    var self = this;
    var c = this.creditsCopy(endingName);
    document.body.classList.remove("on-ending");
    document.body.classList.add("on-credits");

    /* 先盖一层暗色，再淡入信笺，避免与上一帧画面硬切 */
    layer.innerHTML =
      '<div class="cr-veil" id="crVeil"></div>'+
      '<div class="cr-scroll" id="crScroll">'+
        '<div class="cr-paper" id="crPaper">'+
          '<div class="cr-eyebrow">公共网络历史归档 · 离线镜像 #199709</div>'+
          '<div class="cr-tree"><img src="assets/images/tree-icon.png" alt=""></div>'+
          '<h1 class="cr-title">谢谢你，走到这里。</h1>'+
          '<div class="cr-endtag">—— 结局：'+endingName+' ——</div>'+
          '<div class="cr-lead">'+c.lead+'</div>'+
          '<div class="cr-body">'+c.body+'</div>'+
          '<div class="cr-body">这个游戏里没有英雄，也没有什么反转能让她活过来。它只想让你在关掉页面之后，还会多想起一个名字一会儿。<br>谢谢你，愿意花时间陪一个「不存在」的人，走到最后。</div>'+
          '<div class="cr-rule"></div>'+
          '<div class="cr-credits">'+
            '<div class="cr-cr-title">制作名单</div>'+
            '<div class="cr-cr-row"><span>策划 · 文字 · 网页</span><b>abc</b></div>'+
            '<div class="cr-cr-row"><span>美术 · 音效</span><b>abc（部分素材取自公共网络历史档案）</b></div>'+
            '<div class="cr-cr-row"><span>特别感谢</span><b>所有在没有任何提示的情况下，还愿意继续点下去的人</b></div>'+
          '</div>'+
          '<div class="cr-memorial">林晚，学号 063143，2007 年 9 月止。<br>—— 她在这里，有过名字。</div>'+
          '<div class="cr-support">如果你想请作者喝杯水，<a href="javascript:void(0)" id="crSupport">可以在这里支持一块钱</a>；不想也没关系，你已经把最重要的东西给了她。</div>'+
          '<div class="cr-btns">'+
            '<button class="ie-btn" id="crRestart">重新打开归档（二周目）</button>'+
            '<button class="ie-btn" id="crClose">关闭窗口</button>'+
          '</div>'+
          '<div class="cr-tail">公共网络历史归档计划 · 愿每一个被抹掉的人，都还能被找到。</div>'+
        '</div>'+
      '</div>';
    layer.classList.add("show");
    var veil = layer.querySelector("#crVeil");
    var paper = layer.querySelector("#crPaper");
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        veil.classList.add("fade");
        paper.classList.add("show");
        Audio.wind();
      });
    });

    layer.querySelector("#crRestart").onclick = function(){
      Audio.click();
      self.clearLayer();
      Archive.boot(true);
    };
    layer.querySelector("#crClose").onclick = function(){
      Audio.click();
      self.closed();
    };
    var cs = layer.querySelector("#crSupport");
    if(cs){ cs.onclick = function(){ Audio.click && Audio.click(); if(window.Support) Support.show({manual:true}); }; }
  },

  /* ---------- 关闭窗口后的终幕（不再有任何可点） ---------- */
  closed:function(){
    var layer = this.el();
    document.body.classList.remove("on-credits");
    document.body.classList.add("on-ending");
    layer.innerHTML =
      '<div class="ending-veil" style="background:#101010;"></div>'+
      '<div class="ending-center" style="color:#888;opacity:0;transition:opacity 2.2s;">'+
        '<div style="font-size:17px;letter-spacing:5px;">连接已断开</div>'+
        '<div style="font-size:12px;color:#666;margin-top:14px;">该标签页已关闭。</div>'+
        '<div style="margin-top:30px;"><button class="ie-btn" id="closedReopen">重新打开归档</button></div>'+
      '</div>';
    layer.classList.add("show");
    var veil = layer.querySelector(".ending-veil");
    var center = layer.querySelector(".ending-center");
    setTimeout(function(){ veil.classList.add("fade"); },120);
    setTimeout(function(){ center.style.opacity="1"; },2600);
    var rb = layer.querySelector("#closedReopen");
    if(rb){ rb.onclick = function(){ Audio.click(); Endings.clearLayer(); Archive.boot(true); }; }
  },

  /* ---------- 重新开始（进入二周目，供序章断开使用） ---------- */
  restartBox:function(endingName, desc){
    var layer = this.el();
    var ng = Game.profile.completed;
    var box = document.createElement("div");
    box.className = "ending-restart show";
    box.style.zIndex = "1600";
    box.innerHTML =
      '<div style="font-size:12px;color:#888;text-align:center;max-width:560px;line-height:1.9;white-space:pre-line;">'+desc+'</div>'+
      '<div style="font-size:12px;color:#666;">—— 结局：'+endingName+' ——</div>'+
      '<button class="ie-btn" id="restartBtn">'+(ng?"重新打开归档（二周目）":"重新打开归档")+'</button>'+
      '<div class="sub" style="display:none;" id="ngHint"></div>';
    layer.appendChild(box);
    if(ng){
      var hint = box.querySelector("#ngHint");
      hint.style.display = "block";
      hint.textContent = "镜像已更新，包含未归档碎片。";
    }
    box.querySelector("#restartBtn").onclick = function(){
      Audio.click();
      Endings.clearLayer();
      Archive.boot(true);
    };
  }
};
