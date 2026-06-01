if(typeof gFHash=='undefined') {
  console.println('_ JJ: missing gFHash '+event.targetName+' D='+event.target.display);
}
else {
  var dEXv=event.value;
  var gBoxN=0;
  if(dEXv.substr(0,6)==='Remove') {
    var dEXnA=new Array();
    for(var dEXyi=0;
    dEXyi<this.numFields;
    dEXyi++) {
      var dEXwn=this.getNthFieldName(dEXyi);
      if(dEXwn.substr(0,2)=='V_') {
        if(dEXv.substr(6,4)!=='*ALL')continue;
      }
      else {
        if(dEXwn.substr(0,2)!=='v_')continue;
      }
      var dEXwf=this.getField(dEXwn);
      if(dEXwf==null) {
        console.println('bM.cannot see field '+dEXwn);
      }
      dEXnA.push(dEXwn);
    }
    var dEXwn=dEXnA.shift();
    while(typeof(dEXwn)!=='undefined') {
      this.removeField(dEXwn);
      gFHash[dEXwn]='-';
      dEXwn=dEXnA.shift();
    }
    dEXv='x';
  }
  if(dEXv==='Hide') {
    gFHsR();
    dEXv='x';
  }
  dEXv+=' ';
  for(var dEXyi=0;
  dEXyi<this.numFields;
  dEXyi++) {
    var dEXwn=this.getNthFieldName(dEXyi);
    var dEXtu=gFHash[dEXwn];
    var dEXtk='T|>RLxV'.indexOf(dEXtu);
    if(dEXtk<0)continue;
    var dEXwf=this.getField(dEXwn);
    if(dEXwf==null)continue;
    if(dEXwf.type!=='text')continue;
    if(dEXtk>4) {
      if(dEXwf.display!==display.hidden)dEXwf.display=display.hidden;
      if(dEXwf.valueAsString.length>0)dEXwf.value='';
      if(String(dEXwf.strokeColor)!=='T')dEXwf.fillColor=color.transparent;
    }
    if(String(dEXwf.strokeColor)==='T')continue;
    dEXwf.strokeColor=color.transparent;
  }
  var dEXAA=new Array('','D_');
  while(dEXv.length>4) {
    dEXp=dEXv.indexOf(' ');
    if(dEXp==0) {
      dEXv=dEXv.substr(1);
      continue;
    }
    var dEXz=dEXv.substr(0,dEXp);
    dEXv=dEXv.substr(dEXp);
    var dEXn=dEXz;
    var dEXw=1;
    var dEXq=null;
    var dEXclr=color.red;
    dEXp=dEXz.indexOf('!');
    if(dEXp>0) {
      dEXn=dEXz.substr(0,dEXp);
      dEXz+='????';
      dEXc=dEXz.substr(dEXp+1,1);
      dEXw=dEXz.substr(dEXp+2,1);
      if('012345'.indexOf(dEXw)<0)dEXw='?';
      var dEXcn='0123456789NnTt'.indexOf(dEXc);
      if(dEXcn>=0) {
        if(dEXcn<10) {
          dEXclr=gClrA[dEXc];
        }
        else {
          dEXclr=color.transparent;
        }
      }
    }
    if(dEXw!=='?') {
      if(dEXw==0) {
        if(gTfXR)dEXw=1;
      }
      if((dEXn.substr(0,2)!=='V_')&&(dEXn.substr(0,2)!=='v_')) {
        if(dEXn.substr(0,3)!=='Box') {
          dEXf=this.getField(dEXn);
          if(dEXf!==null) {
            var dEXr=dEXf.rect;
            var dEXha=dEXw*1;
            if(dEXha==0)dEXha++;
            dEXr[0]-=dEXha;
            dEXr[1]+=1;
            dEXr[2]+=dEXha;
            dEXr[3]-=1;
            var dEXBn='V_'+dEXn;
            dEXq=this.getField(dEXBn);
            if(dEXq==null) {
              dEXBn='v_'+dEXn;
              dEXq=this.getField(dEXBn);
              if(dEXq==null) {
                if(gAfW) {
                  try {
                    dEXq=this.addField(dEXBn,'text',dEXf.page,dEXr);
                  }
                  catch(e) {
                    console.println('addField FAILED '+e.message);
                  }
                  if(typeof(dEXq)!=='object') {
                    gAfW=false;
                  }
                  else {
                    if(dEXq.name!==dEXBn) {
                      gAfW=false;
                      console.println('A?Fq.failed. '+dEXBn);
                      gFHash[dEXBn]='*';
                      this.removeField(dEXBn);
                      console.println('A?Fq.2.');
                    }
                    else {
                      gFHash[dEXBn]='V';
                      dEXq.alignment='left';
                      dEXq.setAction('OnFocus','gFTsB(1);');
                      dEXq.setAction('MouseDown','gFTsB(13);');
                      dEXq.setAction('MouseUp','gFTsB(2);');
                      dEXq.setAction('OnBlur','gFTsB(5);');
                    }
                  }
                }
                else {
                }
              }
            }
          }
        }
      }
      if(gAfW) {
        if(dEXq!==null) {
          dEXn=dEXBn;
          if(gDFK)dEXq.delay=true;
          dEXq.rect=dEXr;
          dEXq.borderStyle=border.s;
          if(dEXq.valueAsString.length>0)dEXq.value='';
          if(String(dEXq.fillColor)!=='T')dEXq.fillColor=color.transparent;
          if(dEXq.display!==display.visible)dEXq.display=display.visible;
          if(!dEXq.readonly)dEXq.readonly=true;
          if(gDFK)dEXq.delay=false;
        }
      }
      for(var dEXi=0;
      dEXi<2;
      dEXi++) {
        var dEXAn=dEXAA[dEXi]+dEXn;
        dEXg=this.getField(dEXAn);
        if(dEXg==null)continue;
        if(dEXw!='?') {
          try {
            dEXg.lineWidth=dEXw*1;
          }
          catch(e) {
            console.println('**>>?Lw? '+e.message);
          }
        }
        dEXg.strokeColor=dEXclr;
        if(dEXAn.substr(0,3)=='Box') {
          if(dEXg.valueAsString.length>0)dEXg.value='';
          if(dEXg.display!==display.visible)dEXg.display=display.visible;
        }
        gBoxN++;
      }
    }
  }
}