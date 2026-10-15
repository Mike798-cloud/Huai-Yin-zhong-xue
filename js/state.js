/* ============================================================
   槐隐学园 · 状态管理（localStorage 持久化 + 内存）
   ============================================================ */

var SAVE_KEY = "huaiyin_archive_v1";

var defaultProfile = function(){
  return {
    version:1,
    completed:false,       // 是否通关过任意结局
    runs:0,
    unlocked:false,        // 双钥匙是否已永久解锁后台
    fragments:[false,false,false,false,false,false,false]
  };
};

var Game = {
  profile:null,
  flags:{},
  visits:{},
  startTime:Date.now(),
  ngplus:false,
  currentRoute:"",

  load:function(){
    try{
      var raw = localStorage.getItem(SAVE_KEY);
      if(raw){ this.profile = JSON.parse(raw); }
    }catch(e){}
    if(!this.profile){ this.profile = defaultProfile(); }
    if(!this.profile.fragments || this.profile.fragments.length!==7){
      this.profile.fragments = [false,false,false,false,false,false,false];
    }
  },
  save:function(){
    try{ localStorage.setItem(SAVE_KEY, JSON.stringify(this.profile)); }catch(e){}
  },

  /* 新一周目 */
  newRun:function(ngplus){
    this.flags = {};
    this.visits = {};
    this.startTime = Date.now();
    this.ngplus = !!ngplus;
  },

  setFlag:function(f){
    if(!this.flags[f]){
      this.flags[f] = true;
      /* 双钥匙在某周目集齐后，后台永久解锁（跨周目记忆） */
      if(this.flags.noteOverlay && this.flags.audioSecret){
        if(!this.profile.unlocked){ this.profile.unlocked = true; this.save(); }
      }
      this.applyCorruption();
      if(window.ArchiveTools){ArchiveTools.checkpoint();ArchiveTools.refreshAccess();}
    }
  },
  has:function(f){ return !!this.flags[f]; },

  visit:function(page){
    if(!this.visits[page]){
      this.visits[page] = 1;
      this.applyCorruption();
    } else {
      this.visits[page]++;
    }
  },

  /* 收集碎片 */
  collectFragment:function(i){
    if(i<0||i>6) return false;
    if(this.profile.fragments[i]) return false;
    this.profile.fragments[i] = true;
    this.save();
    if(window.ArchiveTools)ArchiveTools.refreshAccess();
    return true;
  },
  fragmentCount:function(){
    return this.profile.fragments.filter(function(f){return f;}).length;
  },
  allFragments:function(){
    return this.profile.fragments.every(function(f){return f;});
  },

  /* 二周目判定 */
  isNGPlus:function(){
    return this.ngplus;
  },

  /* 后台是否可进入 */
  specialVisible:function(){
    return this.specialEnabled() || this.has("footerTree") || this.has("songClick") || this.has("recordFound") || this.has("classClue") || this.has("specialAttempt");
  },
  specialEnabled:function(){
    return !!this.profile.unlocked || (this.has("noteOverlay") && this.has("audioSecret"));
  },

  /* ---- 动态异化等级：1..4 ---- */
  tier:function(){
    if(this.has("inAdmin")) return 4;
    var keyFlags = ["starClick","deletedMsg","hiddenPage4","searchLinWan",
      "recordFound","noteOverlay","audioSecret","songClick","classClue","logExpanded"];
    var fc = keyFlags.filter(function(f){return this.flags[f];}, this).length;
    var vc = Object.keys(this.visits).length;
    var mins = (Date.now() - this.startTime)/60000;
    var t = 1;
    if(this.ngplus) t = 2;
    if(fc>=3 || vc>=8 || mins>=15) t = Math.max(t,2);
    if(fc>=6 || mins>=35) t = Math.max(t,3);
    if(this.specialEnabled()) t = Math.max(t,3);
    return t;
  },
  applyCorruption:function(){
    var t = this.tier();
    var body = document.body;
    body.classList.remove("corr1","corr2","corr3","corr4");
    body.classList.add("corr"+t);
    if(window.Audio) Audio.setCorruption(t);
  },

  /* 结局 */
  finish:function(ending){
    if(!this.profile.completed){
      this.profile.completed = true;
      this.profile.runs++;
      this.save();
    }
  }
};

Game.load();
