if(typeof gRMd!=='undefined') {
  if(gVrbL==3)gLgE('a.T:','');
  var cBXmd=gRMd;
  var cBXf=event.target;
  gLRFN=event.targetName;
  var cBXvm=event.value;
  var cBXv='*';
  var cBXisR=0;
  var cBXfts=0;
  if(!gVCds) {
    cBXfts=1;
    cBXmd=1;
  }
  var cBXbg='!';
  var cBXtu=gFHash[gLRFN];
  var cBXalx=((cBXtu==='|')?'center':'left');
  var cBXRf=null;
  var cBXRf=gDFH[gLRFN];
  var cBXNoR=(cBXRf==null);
  if(cBXNoR)console.println('G52: '+event.targetName+'  '+cBXNoR+' rT:'+event.target.richText+' v>'+cBXvm+'<');
  var cBXFxf=cBXf.fillColor;
  var cBXFrf=((cBXNoR)?cBXFxf:cBXRf.fillColor);
  if(gDFK) {
    cBXf.delay=true;
    if(cBXRf!==null)cBXRf.delay=true;
  }
  var cBXdf=((cBXNoR)?cBXf:cBXRf);
  if(gRTSp>0) {
    if(cBXvm.length>2) {
      cBXvm=cBXvm.replace(gRTRe,'');
      if(cBXvm.length==0)cBXvm=' ';
    }
  }
  if(cBXmd>2) {
    if(cBXvm.length>1) {
      if(cBXvm.charAt(0)=='^') {
        var cBXav=1;
        if(cBXvm.charAt(1)==' ')cBXav++;
        if(cBXvm.length==2) {
          if(cBXav==2)cBXvm='!0 ';
        }
        else {
          cBXvm='!}'+cBXvm.substr(cBXav);
          if(cBXvm.length==2)cBXvm+=' ';
        }
      }
    }
  }
  var cBXFLC=gCfX;
  var cBXxti=-1;
  var cBXstr='';
  if(cBXvm.length>0) {
    if(gCdN>0) {
      if(cBXvm.indexOf(gCdS)>=0) {
        var cBXii=0;
        var cBXjj=cBXvm.indexOf(gCdS);
        while(cBXjj>=0) {
          if(cBXjj+1<cBXvm.length) {
            var cBXvy=cBXvm.substr(0,cBXjj);
            var cBXvC=cBXvm.substr(cBXjj+1,1);
            if(typeof gCdH[cBXvC]!=='undefined') {
              cBXvy+=gCdH[cBXvC]+cBXvm.substr(cBXjj+2);
              cBXii=gCdH[cBXvC].length+cBXjj;
            }
            else {
              if(cBXvC==gCdS) {
                cBXvy+=cBXvm.substr(cBXjj+1);
              }
              else {
                cBXvy+=gCdS+cBXvm.substr(cBXjj+1);
              }
              cBXii=cBXjj+1;
            }
            cBXvm=cBXvy;
            cBXjj=cBXvm.indexOf(gCdS,cBXii);
          }
          else {
            break;
          }
        }
      }
    }
    if(cBXvm.length>30) {
      if(cBXvm.indexOf('\xAB')>0)cBXvm=gFCLN(cBXvm,0,cBXf,cBXRf);
    }
    if(cBXmd>=2) {
      if(cBXvm.substr(0,2)==='!#') {
        cBXmd=2;
        var cBXzy=2;
        if(cBXvm.length>4) {
          if(cBXvm.charAt(2)=='#') {
            cBXmd=1;
            cBXzy=3;
          }
        }
        cBXvm=cBXvm.substr(cBXzy);
      }
    }
    if(cBXmd>1) {
      if((!gShN)||(cBXvm.indexOf('!{')>=0))cBXvm=gRdNA(cBXvm);
      cBXvm=cBXvm.replace(/!
    }
    /g,'');
    if(cBXvm.length==0)cBXvm='!0 ';
    if(cBXvm.length>4) {
      if(cBXvm.substr(-3,2)==='!#') {
        var cBXqc=cBXvm.charAt(cBXvm.length-1);
        var cBXcx='0123456789BPWTXxbygupo'.indexOf(cBXqc);
        if(cBXcx>=0) {
          if(cBXFLC<=21)cBXFLC=cBXcx;
          var cBXzrl=cBXvm.length-3;
          cBXvm=cBXvm.substr(0,cBXzrl);
        }
      }
      else {
        if(cBXvm.substr(-4,2)==='!#') {
          if(cBXvm.substr(-1)==='-') {
            var cBXzrl=cBXvm.length-4;
            cBXvm=cBXvm.substr(0,cBXzrl);
          }
        }
      }
      if(cBXvm.indexOf('!#')>=0)cBXvm=gRadR(cBXvm);
    }
  }
}
if(cBXvm.length<3)cBXvm+=' ';
if(cBXmd>1) {
  if(cBXFLC<=21) {
    var cBXnfc=gFilA[cBXFLC].slice(0);
    var cBXqfc=cBXFxf.length;
    var cBXqfw=0;
    if(cBXqfc==cBXnfc.length) {
      if(cBXqfc==1) {
        if(cBXFxf[0]==cBXnfc[0])cBXqfw=1;
      }
      else {
        if(cBXFxf[0]==cBXnfc[0]) {
          cBXqfw=1;
          for(var cBXffi=1;
          cBXffi<cBXqfc;
          cBXffi++) {
            var cBXzfj=cBXFxf[cBXffi];
            if(cBXzfj!=cBXnfc[cBXffi]) {
              cBXzfj=cBXzfj.toFixed(2);
              if(cBXzfj!=cBXnfc[cBXffi])cBXqfw=0;
            }
          }
        }
      }
    }
    if(cBXqfw==0)cBXFxf=cBXnfc;
  }
}
cBXtclr=cBXFxf;
if(cBXtclr.length<2)cBXtclr=gClrA[10].slice(0);
if(cBXmd>1) {
  if(cBXmd==gRMd) {
    cBXvm=gPfx+cBXvm;
  }
  else {
    if(cBXmd==8) {
      cBXvm=gRPA[1]+cBXvm;
    }
    else {
      if(gBMd>0)cBXvm=gBPA[0]+cBXvm;
    }
  }
}
if(cBXvm.length>0) {
  if(cBXmd==8) {
    cBXv=cBXvm;
    var cBXnq=cBXv.length;
    var cBXfntcx=gHidC.charAt(2);
    var cBXfntca=gHidC.charAt(3);
    var cBXpale=0;
    var cBXxaclr=0;
    var cBXxxclr=0;
    var cBXaclr=color.green;
    var cBXxclr=color.red;
    var cBXcxa='0123456789'.indexOf(cBXfntca);
    if(cBXcxa>=0) {
      cBXaclr=gClrA[cBXcxa].slice(0);
      cBXxaclr++;
    }
    var cBXcxx='0123456789'.indexOf(cBXfntcx);
    if(cBXcxx>=0) {
      cBXxclr=gClrA[cBXcxx].slice(0);
      cBXxxclr++;
    }
    if(gTfXR) {
      if(cBXvm.indexOf('!')<0)cBXvm='!0'+cBXvm;
    }
    var cBXpz=-1;
    if(cBXnq>0) {
      cBXpz=cBXv.indexOf(cBXbg);
      if(cBXpz<0) {
        if(cBXxxclr>0)cBXpz=-2;
      }
    }
    if(cBXpz!=-1) {
      var cBXrsz=gTFz;
      var cBXnclr=gClrA[0].slice(0);
      var cBXfntcn=gHidC.charAt(0);
      var cBXcx='0123456789'.indexOf(cBXfntcn);
      if(cBXcx>=0)cBXnclr=gClrA[cBXcx].slice(0);
      var cBXaline=((cBXf.alignment!=cBXalx)?cBXalx:'');
      var cBXwx=0;
      var cBXix=0;
      var cBXuln=false;
      var cBXxF=0;
      var cBXrclr=cBXnclr;
      var cBXqclr=cBXrclr;
      if(cBXpz==-2)cBXrclr=cBXxclr;
      var cBXsbsp=0;
      var cBXfat='normal';
      var cBXys=cBXsbsp;
      var cBXyf=cBXfat;
      var cBXyi=cBXix;
      var cBXyu=cBXuln;
      var cBXyw=cBXwx;
      var cBXsi=-1;
      var cBXSP=new Array();
      var cBXFXXX=0;
      cBXv=cBXv.replace(/\r/g,'');
      while(cBXv.length>0) {
        var cBXp=cBXv.indexOf(cBXbg);
        if(cBXp<0) {
          cBXstr+=cBXv;
          cBXv='';
        }
        else {
          if(cBXv.length-1==cBXp) {
            cBXstr+=cBXv;
            cBXv='';
          }
          else {
            if(cBXp>0) {
              cBXstr+=cBXv.substring(0,cBXp);
              cBXv=cBXv.substring(cBXp);
            }
            var cBXpc=cBXv.charAt(1);
            cBXv=cBXv.substring(2);
            var cBXpj='<|>0123456789;[]:bBuitTrSHDCshdc+=-^vnN/?#$*@&~! Ff%'.indexOf(cBXpc);
            if(cBXpj<0) {
              var cBXucd=-1;
              var cBXzsvals='';
              var cBXzbxv=this.getField('My_Symbols').valueAsString;
              var cBXzcodes=' a=220 A=217 m=109:B Q=110:B+ R=114:B+ X=120:B+ Z=84:B ' + cBXzbxv + ' ';
              var cBXthisc=' '+cBXpc+'=';
              var cBXthisi=cBXzcodes.lastIndexOf(cBXthisc);
              if(cBXthisi>=0) {
                cBXthisi+=3;
                cBXthisj=cBXzcodes.indexOf(' ',cBXthisi);
                if(cBXthisj>0) {
                  cBXzsvals=cBXzcodes.substring(cBXthisi,cBXthisj);
                }
              }
              if(cBXzsvals.length>0) {
                if(cBXstr.length>0)gFfS();
                var cBXzscodes=' fZ=ZapfDingbats fS=Symbol fC=Cards fB=Bridge'+cBXzcodes;
                var cBXzsclr=cBXrclr;
                var cBXzsfont='ZapfDingbats';
                cBXthisi=cBXzsvals.indexOf(':');
                if(cBXthisi<0) {
                  cBXucd=cBXzsvals;
                }
                else {
                  var cBXzsfz=9;
                  var cBXzswt=400;
                  var cBXzswd=0;
                  cBXucd=cBXzsvals.substring(0,cBXthisi);
                  if(cBXucd>10000) {
                    cBXucd=-1;
                  }
                  else {
                    cBXthisi+=1;
                    cBXzsvals=cBXzsvals.substring(cBXthisi);
                    while(cBXzsvals.length>0) {
                      var cBXzsxc=cBXzsvals.substring(0,1);
                      cBXzsvals=cBXzsvals.substring(1);
                      var cBXzsxy='0123456789'.indexOf(cBXzsxc);
                      if(cBXzsxy>=0) {
                        if(gMltC)cBXzsclr=gClrA[cBXzsxy].slice(0);
                      }
                      else {
                        cBXzsxy='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(cBXzsxc);
                        if(cBXzsxy>=0) {
                          var cBXzsvf=' f'+cBXzsxc+'=';
                          var cBXzskf=cBXzscodes.lastIndexOf(cBXzsvf);
                          if(cBXzskf>=0) {
                            cBXzskf+=4;
                            if(cBXzskf<(cBXzscodes.length-3)) {
                              var cBXzszt=' ';
                              var cBXzsqc=cBXzscodes.substring(cBXzskf,cBXzskf+1);
                              cBXzsbi='[({'.indexOf(cBXzsqc);
                              if(cBXzsbi>=0) {
                                cBXzszt='])}'.charAt(cBXzsbi);
                                cBXzskf++;
                              }
                              var cBXzsiw=cBXzscodes.indexOf(cBXzszt,cBXzskf);
                              if(cBXzsiw>cBXzskf) {
                                cBXzsfont=cBXzscodes.substring(cBXzskf,cBXzsiw);
                              }
                            }
                          }
                        }
                        else {
                          var cBXzsci='b+_-w'.indexOf(cBXzsxc);
                          switch(cBXzsci) {
                            case 0:cBXzswt=700;
                            break;
                            case 1:cBXzsfz++;
                            break;
                            case 2:cBXzsfz=11;
                            break;
                            case 3:cBXzsfz--;
                            break;
                            case 4:cBXzswd=1;
                            break;
                          }
                        }
                      }
                    }
                  }
                }
                gFnS();
                cBXSP[cBXsi].fontFamily=[cBXzsfont];
                cBXSP[cBXsi].fontWeight=cBXzswt;
                if(cBXzswd==1)cBXSP[cBXsi].fontStretch='expanded';
                cBXSP[cBXsi].textColor=cBXzsclr;
                cBXSP[cBXsi].text=String.fromCharCode(cBXucd);
                cBXSP[cBXsi].textSize=cBXzsfz;
              }
              else {
                if(cBXv.length>3) {
                  if(cBXpc==='U') {
                    if(cBXv.charAt(0)==='+') {
                      var cBXhxw=cBXv.match(gHXa);
                      if(cBXhxw) {
                        cBXstr+=String.fromCharCode(parseInt(cBXhxw[1],16));
                        cBXucd=0;
                        cBXv=cBXv.substr(cBXhxw[1].length+2);
                      }
                      else {
                        var cBXhxc=0;
                        for(var cBXhxi=1;
                        cBXhxi<cBXv.length;
                        cBXhxi+=4) {
                          var cBXhxv=cBXv.substr(cBXhxi,4);
                          if(cBXhxv.match(gHXf)) {
                            cBXstr+=String.fromCharCode(parseInt(cBXhxv,16));
                            cBXhxc+=4;
                            cBXucd=0;
                          }
                          else {
                            cBXhxi=cBXv.length+3;
                          }
                        }
                        if(cBXhxc>0)cBXv=cBXv.substr(cBXhxc+1);
                      }
                    }
                  }
                }
              }
              if(cBXucd<0) {
                cBXstr+='!'+cBXpc;
              }
              else {
                if(cBXv.length>0) {
                  if(cBXv.charAt(0)===';')cBXv=cBXv.substr(1);
                }
              }
            }
            else {
              if(cBXpj<3) {
                if(cBXpj==1) {
                  cBXaline='center';
                }
                else if(cBXpj==2) {
                  cBXaline='right';
                }
                else {
                  cBXaline='left';
                }
                cBXxti=0;
              }
              else {
                if(cBXstr.length>0)gFfS();
                if(cBXpj<17) {
                  cBXpale=cBXpj-3;
                  if(cBXxaclr>0) {
                    cBXrclr=cBXaclr;
                  }
                  else {
                    cBXrclr=gClrA[cBXpale].slice(0);
                    if(cBXrclr.length<2) {
                      if(cBXFLC<=21) {
                        cBXrclr=gFilA[cBXFLC].slice(0);
                        if(cBXrclr.length<2)cBXrclr=gClrA[10].slice(0);
                      }
                      else {
                        cBXrclr=cBXtclr;
                      }
                    }
                  }
                }
                else if(cBXpj<21) {
                  cBXpj-=17;
                  if(cBXpj<2) {
                    cBXwx=((cBXwx)?0:1);
                    cBXxF=cBXix+cBXwx;
                  }
                  else if(cBXpj<3) {
                    cBXuln=((cBXuln)?false:true);
                  }
                  else {
                    if(gEit) {
                      cBXix=((cBXix)?0:2);
                      cBXxF=cBXix+cBXwx;
                    }
                    else {
                      cBXuln=((cBXuln)?false:true);
                    }
                  }
                }
                else if(cBXpj<23) {
                  cBXpj-=21;
                  if(cBXpj==0) {
                    if(gRMo<8) {
                      cBXstr+='   ';
                    }
                    else {
                      cBXstr+=gXTb;
                    }
                  }
                  else {
                    cBXstr+=gXTq;
                  }
                }
                else if(cBXpj<24) {
                  if(cBXf.multiline)cBXstr+='\r';
                  if(cBXaline.length==0)cBXstr+=' ';
                }
                else if(cBXpj<32) {
                  cBXpj-=24;
                  gFnS();
                  cBXSP[cBXsi].fontFamily=['Cards'];
                  if(cBXrsz>11) {
                    cBXSP[cBXsi].textSize=11;
                  }
                  else {
                    cBXSP[cBXsi].textSize=cBXrsz;
                  }
                  var cBXsu=gSHDC[cBXpj];
                  var cBXsuxy=cBXpale;
                  if(cBXsuxy<11)cBXsuxy=gScxA[cBXpj];
                  var cBXsuc=gClrA[cBXsuxy];
                  cBXSP[cBXsi].textColor=cBXsuc;
                  cBXSP[cBXsi].fontWeight=600;
                  cBXSP[cBXsi].fontStretch=cBXfat;
                  cBXSP[cBXsi].underline=cBXuln;
                  cBXSP[cBXsi].text=cBXsu;
                }
                else if(cBXpj<37) {
                  cBXpj-=32;
                  if(cBXrsz<1)cBXrsz=gTFz;
                  if(cBXpj<1) {
                    cBXrsz++;
                    cBXsbsp=0;
                  }
                  else if(cBXpj<2) {
                    cBXrsz=gTFz;
                    cBXsbsp=0;
                  }
                  else if(cBXpj<3) {
                    if(cBXrsz>6)cBXrsz--;
                    cBXsbsp=0;
                  }
                  else if(cBXpj<4) {
                    cBXsbsp=((cBXsbsp==1)?0:1);
                  }
                  else {
                    cBXsbsp=((cBXsbsp==-1)?0:-1);
                  }
                }
                else if(cBXpj<42) {
                  cBXpj-=37;
                  if(cBXpj<2) {
                    cBXsbsp=0;
                    cBXfat='normal';
                    cBXix=0;
                    cBXuln=false;
                    cBXwx=0;
                    cBXxF=0;
                  }
                  if(cBXpj==1)cBXrclr=cBXqclr;
                  if(cBXpj==3) {
                    cBXrclr=cBXqclr;
                    cBXsbsp=cBXys;
                    cBXfat=cBXyf;
                    cBXix=cBXyi;
                    cBXuln=cBXyu;
                    cBXwx=cBXyw;
                    cBXxF=cBXix+cBXwx;
                  }
                  if(cBXpj==2) {
                    cBXqclr=cBXrclr;
                    cBXys=cBXsbsp;
                    cBXyf=cBXfat;
                    cBXyi=cBXix;
                    cBXyu=cBXuln;
                    cBXyw=cBXwx;
                  }
                }
                else if(cBXpj<47) {
                  cBXpj-=42;
                  if(cBXpj==0) {
                    cBXstr+=gLRFN;
                  }
                  else if(cBXpj==1) {
                    cBXstr+=util.printd('yyyy-mm-dd HH:MM',new Date());
                  }
                  else if(cBXpj==2) {
                    cBXstr+=cBXrsz.toString();
                  }
                  else if(cBXpj==3) {
                    var cBXht=cBXf.rect[1]-cBXf.rect[3];
                    cBXstr+=cBXht.toFixed(1);
                  }
                  else {
                    cBXstr+=' ext:'+this.external+' fV:'+app.formsVersion+' vV:'+app.viewerVersion+' Vt:'+app.viewerType+' Vv:'+app.viewerVariation+' o:'+app.platform+' gRMo='+gRMo+' R:'+gRevC+' bT:'+gBldT+' ';
                  }
                }
                else if(cBXpj<49) {
                  cBXstr+=cBXbg;
                  if(cBXpc!=cBXbg)cBXstr+=cBXpc;
                }
                else if(cBXpj<52) {
                  cBXpj-=49;
                  if(cBXpj==0) {
                    cBXFXXX=0;
                  }
                  else if(cBXpj>1) {
                    cBXstr+=cBXFXXX+'~'+cBXxF+'_'+gAFS[cBXxF];
                    var cBXsff=((cBXxF)?gRFA[cBXxF]:'');
                    if(cBXsff.length==0)cBXsff=gFontA[cBXFXXX];
                    cBXstr+=cBXsff;
                  }
                  else {
                    if(cBXFXXX<(gFontA.length-1))cBXFXXX++;
                  }
                }
                else {
                  cBXstr+='*'+cBXpc+'*';
                }
              }
            }
          }
        }
      }
      if(cBXsi<0)cBXstr+=' ';
      if(cBXstr.length>0)gFfS();
      if(cBXaline.length==0)cBXaline=cBXf.alignment;
      for(var cBXjq=0;
      cBXjq<=cBXsi;
      cBXjq++) {
        cBXSP[cBXjq].alignment=cBXaline;
      }
      if(cBXxti<0) {
        if(cBXaline==='left') {
          var cBXtmp=cBXSP[0].text;
          if(cBXtmp.length>0) {
            if(cBXtmp.substr(0,1)!==' ') {
              cBXSP[0].text=' '+cBXtmp;
            }
          }
        }
      }
      if(cBXaline==='right') {
        if(cBXSP[cBXsi].text.substr(-1)!==' ') {
          gFnS();
          if(cBXFxf.length<2) {
            cBXSP[cBXsi].textColor=color.white;
          }
          else {
            cBXSP[cBXsi].textColor=cBXFxf;
          }
          cBXSP[cBXsi].text='.';
          cBXSP[cBXsi].alignment=cBXaline;
        }
      }
      cBXmd=7;
      cBXisR=1;
    }
    else {
      cBXmd=6;
      if(cBXnq>0) {
        if(cBXxti<0) {
          if(cBXf.alignment==='left') {
            if(cBXv.charAt(0)!==' ')cBXv=' '+cBXv;
          }
        }
      }
      cBXv+=' ';
    }
  }
  if(cBXmd<=5) {
    cBXv=cBXvm;
    if(cBXmd>=2) {
      var cBXbfn=cBXv.length;
      var cBXpzn='';
      if(cBXv.charAt(0)=='^')cBXv=cBXv.substr(1);
      var cBXbfg=true;
      if(cBXxti<0) {
        if(cBXv.length>0) {
          if(cBXf.alignment=='left') {
            if(cBXv.charAt(0)!==' ')cBXpzn=' ';
          }
        }
      }
      var cBXbftx=77;
      var cBXbftz=gTFz;
      var cBXbfbd=0;
      var cBXbfit=0;
      var cBXbfjz=cBXalx;
      var cBXbfp=-1;
      if(cBXbfn>0)cBXbfp=cBXv.indexOf(cBXbg);
      cBXstr=cBXv;
      if(cBXbfp>=0) {
        cBXstr='';
        while(cBXv.length>0) {
          cBXbfp=cBXv.indexOf(cBXbg);
          if(cBXbfp<0) {
            cBXstr+=cBXv;
            cBXv='';
          }
          else {
            if(cBXv.length-1==cBXbfp) {
              cBXstr+=cBXv;
              cBXv='';
            }
            else {
              if(cBXbfp>0) {
                cBXstr+=cBXv.substring(0,cBXbfp);
                cBXbfg=false;
                cBXv=cBXv.substring(cBXbfp);
              }
              var cBXbfpc=cBXv.charAt(1);
              cBXv=cBXv.substring(2);
              var cBXbfpj='shdcSHDC! 0123456789;[]:+=-<|>bi%^vBunN/?Ff#'.indexOf(cBXbfpc);
              if(cBXbfpj>=0) {
                if(cBXbfpj<4) {
                  cBXstr+=cBXbfpc.toUpperCase();
                  cBXbfg=false;
                }
                else if(cBXbfpj<9) {
                  cBXstr+=cBXbfpc;
                  cBXbfg=false;
                }
                else if(cBXbfpj<10) {
                  cBXstr+='!'+cBXbfpc;
                  cBXbfg=false;
                }
                else if(cBXbfpj<24) {
                  cBXbfpj-=10;
                  if(cBXbfg)cBXbftx=cBXbfpj;
                }
                else if(cBXbfpj<27) {
                  if(cBXbfg) {
                    if(cBXbfpc==='+')cBXbftz++;
                    if(cBXbfpc==='=')cBXbfg=false;
                    if(cBXbfpc==='-')cBXbftz--;
                  }
                }
                else if(cBXbfpj<30) {
                  if(cBXbfg) {
                    if(cBXbfpc==='<')cBXbfjz='left';
                    if(cBXbfpc==='|')cBXbfjz='center';
                    if(cBXbfpc==='>')cBXbfjz='right';
                  }
                }
                else if(cBXbfpj<33) {
                  if(cBXbfg) {
                    if(cBXbfpc==='b')cBXbfbd=1;
                    if(cBXbfpc==='i')cBXbfit=2;
                  }
                  if(cBXbfpc==='%')cBXstr+=gBFA[0+cBXbfbd+cBXbfit];
                }
              }
              else {
                cBXbfg=false;
                if(cBXbfpc==='T') {
                  cBXstr+=gXTq;
                }
                else if(cBXbfpc==='t') {
                  if(gRMo<8) {
                    cBXstr+='   ';
                  }
                  else {
                    cBXstr+=gXTb;
                  }
                }
                else if(cBXbfpc==='r') {
                  cBXstr+='   ';
                }
                else if(cBXbfpc==='a') {
                  cBXstr+='->';
                }
                else if(cBXbfpc==='A') {
                  cBXstr+='>>';
                }
                else if(cBXbfpc==='X') {
                  cBXstr+='X';
                }
                else if(cBXbfpc==='Z') {
                  cBXstr+='10';
                }
                else if(cBXbfpc==='R') {
                  cBXstr+='XX';
                }
                else if(cBXbfpc==='U') {
                  var cBXbfu=-1;
                  if(cBXv.length>3) {
                    if(cBXv.charAt(0)==='+') {
                      var cBXbfxw=cBXv.match(gHXa);
                      if(cBXbfxw) {
                        cBXstr+=String.fromCharCode(parseInt(cBXbfxw[1],16));
                        cBXbfu=0;
                        cBXv=cBXv.substr(cBXbfxw[1].length+2);
                      }
                      else {
                        var cBXbfc=0;
                        for(var cBXbfi=1;
                        cBXbfi<cBXv.length;
                        cBXbfi+=4) {
                          var cBXbfxv=cBXv.substr(cBXbfi,4);
                          if(cBXbfxv.match(gHXf)) {
                            cBXstr+=String.fromCharCode(parseInt(cBXbfxv,16));
                            cBXbfc+=4;
                            cBXbfu=0;
                          }
                          else {
                            cBXbfi=cBXv.length+3;
                          }
                        }
                        if(cBXbfc>0)cBXv=cBXv.substr(cBXbfc+1);
                      }
                    }
                  }
                  if(cBXbfu<0) {
                    cBXstr+='!'+cBXbfpc;
                  }
                  else {
                    if(cBXv.length>0) {
                      if(cBXv.charAt(0)===';')cBXv=cBXv.substr(1);
                    }
                  }
                }
                else if(cBXbfpc==='$') {
                  cBXstr+=gLRFN;
                }
                else if(cBXbfpc==='*') {
                  cBXstr+=util.printd('yyyy-mm-dd HH:MM',new Date());
                }
                else if(cBXbfpc==='@') {
                  cBXstr+=cBXbftz.toString(10);
                }
                else if(cBXbfpc==='~') {
                  cBXstr+=' ext:'+this.external+' fV:'+app.formsVersion+' vV:'+app.viewerVersion+' Vt:'+app.viewerType+' Vv:'+app.viewerVariation+' o:'+app.platform+' gRMo='+gRMo+' R:'+gRevC+' bT:'+gBldT;
                }
              }
            }
          }
        }
      }
      if(cBXstr.charAt(0)=='^')cBXstr=cBXstr.substr(1);
      cBXstr=cBXpzn+cBXstr;
      var cBXBf=cBXdf;
      if(cBXBf.textSize!==cBXbftz)cBXBf.textSize=cBXbftz;
      if(cBXBf.alignment!==cBXbfjz) {
        if(gCFaW)cBXBf.alignment=cBXbfjz;
      }
      if(cBXbftx>30) {
        if(cBXBf.textColor=='RGB,0,0,0') {
          cBXbftx=80;
        }
        else if(cBXBf.textColor=='G,0') {
          cBXbftx=81;
        }
        else {
          cBXbftx=0;
        }
      }
      if(cBXbftx<30) {
        cBXBf.textColor=gClrA[cBXbftx].slice(0);
      }
      var cBXbfnt=gBFA[0+cBXbfbd+cBXbfit];
      if(cBXBf.textFont!==cBXbfnt)cBXBf.textFont=cBXbfnt;
      cBXv=cBXstr;
    }
    else {
      if(gTfXR) {
        if(cBXf.richText)cBXf.richText=false;
      }
      else if(gRMo<8) {
        if(cBXf.richText)cBXf.richText=false;
      }
      if(cBXf.textColor!==color.black) {
        if(String(cBXf.textColor)!=='RGB,0,0,0')cBXf.textColor=['RGB',0,0,0];
      }
      if(cBXf.alignment!==cBXalx) {
        if(gCFaW)cBXf.alignment=cBXalx;
      }
      if(cBXf.textFont!==font.Helv)cBXf.textFont=font.Helv;
      if(cBXRf==null) {
        event.value=cBXvm;
      }
      else {
        cBXRf.value=cBXvm;
      }
    }
  }
}
if(cBXmd<2) {
  if(cBXRf==null) {
    cBXf.textSize=gTFz;
    if(cBXf.alignment!==cBXalx) {
      if(gCFaW)cBXf.alignment=cBXalx;
    }
    cBXf.textColor=color.black;
    cBXf.textFont=font.Helv;
  }
  else if(gTfXR) {
    cBXRf.textSize=gTFz;
    if(cBXRf.alignment!==cBXalx) {
      if(gCFaW)cBXRf.alignment=cBXalx;
    }
    cBXRf.textColor=color.black;
    cBXRf.textFont=font.Helv;
  }
  else {
    cBXf.textSize=gTFz;
    if(cBXf.alignment!==cBXalx) {
      if(gCFaW)cBXf.alignment=cBXalx;
    }
    cBXf.textColor=color.black;
    cBXf.textFont=font.Helv;
  }
}
if(cBXf.fillColor!==cBXFxf)cBXf.fillColor=cBXFxf;
var cBXvf=cBXdf;
if(cBXmd<2) {
  if(cBXNoR) {
    if(cBXf.richText)cBXf.richText=false;
    event.value=cBXv;
    cBXvf=cBXf;
  }
  else if(cBXfts) {
    if(cBXf.richText)cBXf.richText=false;
    event.value=cBXv;
    cBXvf=cBXf;
  }
  else {
    if(cBXvf.richText)cBXvf.richText=false;
    cBXvf.value=cBXv;
  }
}
else if(cBXisR) {
  if(cBXNoR) {
    if(!cBXf.richText)cBXf.richText=true;
    event.richValue=cBXSP;
    cBXvf=cBXf;
  }
  else {
    if(!cBXdf.richText)cBXdf.richText=true;
    if(cBXdf.fillColor!==cBXFxf)cBXdf.fillColor=cBXFxf;
    cBXdf.richValue=cBXSP;
    cBXvf=cBXdf;
  }
}
else {
  if(!cBXfts) {
    if(cBXdf.richText)cBXdf.richText=false;
    if(cBXNoR) {
      event.value=cBXv;
    }
    else {
      if(cBXdf.fillColor!==cBXFxf)cBXdf.fillColor=cBXFxf;
      cBXdf.value=cBXv;
    }
    cBXvf=cBXdf;
  }
  else {
    if(cBXf.richText)cBXf.richText=false;
    event.value=cBXv;
    cBXvf=cBXf;
  }
}
if(cBXNoR) {
  if(cBXf.display!==display.visible)cBXf.display=display.visible;
}
else {
  if(cBXvf==cBXRf) {
    if(cBXRf.display!==display.visible)cBXRf.display=display.visible;
    if(cBXf.display!==display.hidden)cBXf.display=display.hidden;
  }
  else {
    if(cBXRf.display!==display.noView)cBXRf.display=display.noView;
    if(cBXf.display!==display.noPrint)cBXf.display=display.noPrint;
  }
}
if(gDFK) {
  cBXf.delay=false;
  if(cBXRf!==null)cBXRf.delay=false;
}
if(event.commitKey==3) {
  if(gSPNs==2) {
    var cBXfcf=null;
    if(gOzX.indexOf(' NoTabOut')<0)cBXfcf=this.getField('T_TWO');
    console.println('TabOut '+event.targetName+' cK:'+event.commitKey+((event.willCommit)?' wC':'')+((cBXfcf==null)?'':' >>T_TWO'));
    gFaA(0,1,'TAB TAB TAB','You have TABbed out of field '+event.targetName+'\r \rPlease see bookmark [Help / General / Tab Sequence]');
    if(cBXfcf!==null)cBXfcf.setFocus();
  }
}
}