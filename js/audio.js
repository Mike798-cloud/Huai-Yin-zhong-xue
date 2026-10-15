/* ============================================================
   槐隐学园 · 音效引擎（WebAudio 合成，无背景音乐）
   ============================================================ */

var Audio = {
  ctx:null,
  master:null,
  bedGain:null,
  noiseBuf:null,
  ready:false,
  tier:1,
  ambientTimer:null,
  progTimer:null,
  whisperEl:null,
  programPlaying:false,

  init:function(){
    if(this.ready) return;
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);

      /* 底噪循环 */
      var len = this.ctx.sampleRate * 2;
      var buf = this.ctx.createBuffer(1,len,this.ctx.sampleRate);
      var d = buf.getChannelData(0);
      var last = 0;
      for(var i=0;i<len;i++){
        var white = Math.random()*2-1;
        last = (last + 0.02*white)/1.02;
        d[i] = last*3.2 + white*0.08;
      }
      this.noiseBuf = buf;
      var src = this.ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      var lp = this.ctx.createBiquadFilter();
      lp.type="lowpass"; lp.frequency.value=500;
      this.bedGain = this.ctx.createGain();
      this.bedGain.gain.value = 0.012;
      src.connect(lp); lp.connect(this.bedGain); this.bedGain.connect(this.master);
      src.start();

      /* 低语音频 */
      this.whisperEl = document.createElement("audio");
      this.whisperEl.src = "assets/audio/whisper.mp3";
      this.whisperEl.preload = "auto";
      this.whisperEl.volume = 0;

      this.ready = true;
      this.scheduleAmbient();
    }catch(e){ this.ready=false; }
  },

  resume:function(){
    if(this.ctx && this.ctx.state==="suspended"){ this.ctx.resume(); }
  },

  /* ---------- 基础音效 ---------- */
  /* IE6 点击：极短塑料声 */
  click:function(){
    if(!this.ready) return;
    this.resume();
    var t = this.ctx.currentTime;
    var o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type="square"; o.frequency.setValueAtTime(1400,t);
    o.frequency.exponentialRampToValueAtTime(600,t+0.03);
    g.gain.setValueAtTime(0.05,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t+0.06);
  },

  /* 页面加载：轻微机械声+完成滴 */
  load:function(){
    if(!this.ready) return;
    this.resume();
    var t = this.ctx.currentTime;
    var src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    var bp = this.ctx.createBiquadFilter();
    bp.type="bandpass"; bp.frequency.value=2400; bp.Q.value=0.8;
    var g = this.ctx.createGain();
    g.gain.setValueAtTime(0.018,t);
    g.gain.linearRampToValueAtTime(0.03,t+0.15);
    g.gain.linearRampToValueAtTime(0.001,t+0.55);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t); src.stop(t+0.6);
  },
  loadDone:function(){
    if(!this.ready) return;
    var t = this.ctx.currentTime;
    var o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type="sine"; o.frequency.value=720;
    g.gain.setValueAtTime(0.06,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t+0.1);
  },

  /* XP 弹窗提示音 */
  ding:function(){
    if(!this.ready) return;
    this.resume();
    var t = this.ctx.currentTime;
    [523.25,659.25].forEach(function(f,i){
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type="sine"; o.frequency.value=f;
      var st = t+i*0.09;
      g.gain.setValueAtTime(0,st);
      g.gain.linearRampToValueAtTime(0.09,st+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.35);
      o.connect(g); g.connect(this.master);
      o.start(st); o.stop(st+0.4);
    },this);
  },

  /* 系统错误音（低沉） */
  error:function(){
    if(!this.ready) return;
    var t = this.ctx.currentTime;
    [220,196].forEach(function(f,i){
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type="triangle"; o.frequency.value=f;
      var st = t+i*0.12;
      g.gain.setValueAtTime(0.08,st);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.3);
      o.connect(g); g.connect(this.master);
      o.start(st); o.stop(st+0.32);
    },this);
  },

  /* 电流杂音 */
  staticHit:function(level){
    if(!this.ready) return;
    var t = this.ctx.currentTime;
    var src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    var hp = this.ctx.createBiquadFilter();
    hp.type="highpass"; hp.frequency.value=1800;
    var g = this.ctx.createGain();
    var vol = level||0.04;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol,t+0.05);
    g.gain.linearRampToValueAtTime(0.001,t+0.4);
    src.connect(hp); hp.connect(g); g.connect(this.master);
    src.start(t); src.stop(t+0.45);
  },

  /* 极淡风声（解锁低语后） */
  wind:function(){
    if(!this.ready) return;
    var t = this.ctx.currentTime;
    var src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    var bp = this.ctx.createBiquadFilter();
    bp.type="bandpass"; bp.frequency.value=380; bp.Q.value=0.6;
    var g = this.ctx.createGain();
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.05,t+1.2);
    g.gain.linearRampToValueAtTime(0.001,t+3.2);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t); src.stop(t+3.4);
  },

  /* 隐藏低语：播放mp3并叠一层电流 */
  secretWhisper:function(clear){
    if(!this.ready) return;
    this.resume();
    this.staticHit(0.05);
    try{
      this.whisperEl.pause();
      this.whisperEl.currentTime = 0;
      this.whisperEl.volume = clear?0.95:0.8;
      var p = this.whisperEl.play();
      if(p&&p.catch){ p.catch(function(){}); }
    }catch(e){}
    if(clear){ this.wind(); }
    setTimeout(function(){ this.staticHit(0.035); }.bind(this),2600);
  },

  /* 环境随机异响（随异化提升） */
  scheduleAmbient:function(){
    var self = this;
    clearTimeout(this.ambientTimer);
    var delay = this.tier>=3 ? 14000+Math.random()*12000 :
                this.tier>=2 ? 26000+Math.random()*18000 : 48000;
    this.ambientTimer = setTimeout(function(){
      if(Math.random()<0.55){
        self.staticHit(self.tier>=3?0.035:0.02);
      } else {
        self.wind();
      }
      self.scheduleAmbient();
    }, delay);
  },

  setCorruption:function(t){
    var old = this.tier;
    this.tier = t;
    if(this.ready && this.bedGain){
      var v = t===1?0.012 : t===2?0.022 : t===3?0.038 : 0.06;
      this.bedGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime+2.5);
    }
    if(old>=2 && t<old && this.ready){ /* 重置后降低 */ }
    this.scheduleAmbient();
  },

  /* ---------- 节目音频（合成小品） ---------- */
  stopProgram:function(){
    clearTimeout(this.progTimer);
    if(this.progNodes){
      this.progNodes.forEach(function(n){ try{ n.stop&&n.stop(); n.disconnect&&n.disconnect(); }catch(e){} });
    }
    if(this.whisperEl){this.whisperEl.pause();this.whisperEl.currentTime=0;}
    this.programPlaying = false;
  },
  playProgram:function(type){
    if(!this.ready){ this.click(); return; }
    this.stopProgram();
    this.programPlaying = true;
    var t = this.ctx.currentTime;
    var nodes = [];
    this.progNodes = nodes;

    var mkTone = function(freq,start,dur,type,vol){
      var o = self.ctx.createOscillator(), g = self.ctx.createGain();
      o.type = type||"sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0,t+start);
      g.gain.linearRampToValueAtTime(vol,t+start+0.05);
      g.gain.linearRampToValueAtTime(0.001,t+start+dur);
      o.connect(g); g.connect(self.master);
      o.start(t+start); o.stop(t+start+dur+0.05);
      nodes.push(o);
    };
    var self = this;

    if(type==="news"){
      /* 新闻片头：两小节提示音 */
      mkTone(659,0,0.18,"square",0.04);
      mkTone(659,0.2,0.18,"square",0.04);
      mkTone(880,0.4,0.35,"square",0.045);
      /* 之后是底噪（人声不可辨） */
      var src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      var bp = this.ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=900; bp.Q.value=1.2;
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0.012,t+0.8);
      g.gain.linearRampToValueAtTime(0.001,t+7);
      src.connect(bp); bp.connect(g); g.connect(this.master);
      src.start(t+0.6); src.stop(t+7);nodes.push(src);
    } else if(type==="music"){
      /* 简单八音盒旋律 */
      var seq = [523,587,659,784,880,784,659,587];
      seq.forEach(function(f,i){ mkTone(f,i*0.32,0.3,"sine",0.05); });
    } else if(type==="read"){
      /* 美文：轻柔长音 */
      mkTone(392,0,2.2,"sine",0.035);
      mkTone(523,0.8,2.2,"sine",0.03);
    } else if(type==="secret"){
      /* 心灵驿站：温和的音乐垫，等待玩家拖到2:10 */
      var s2 = [440,523,587,523,440,392];
      s2.forEach(function(f,i){ mkTone(f,i*0.9,0.9,"sine",0.028); });
    }
    this.progTimer = setTimeout(function(){ self.programPlaying=false; }, 8500);
  },

  /* 点歌台点歌：一小段清脆音乐盒声后被电流切断 */
  songBox:function(){
    if(!this.ready){ this.click(); return; }
    this.resume();
    var t = this.ctx.currentTime;
    var self = this;
    [784,880,1047].forEach(function(f,i){
      var o = self.ctx.createOscillator(), g = self.ctx.createGain();
      o.type="sine"; o.frequency.value=f;
      var st = t+i*0.22;
      g.gain.setValueAtTime(0.0001,st);
      g.gain.linearRampToValueAtTime(0.055,st+0.03);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.4);
      o.connect(g); g.connect(self.master);
      o.start(st); o.stop(st+0.45);
    });
    setTimeout(function(){ self.staticHit(0.08); },720);
  }
};
