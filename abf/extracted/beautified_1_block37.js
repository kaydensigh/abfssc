if(typeof gLgE==='undefined'){
  function gLgE(kAXr,kAXo){
    var kAXm='*'+kAXr+' '+event.targetName+' d'+event.target.display+' ';
    kAXm+=((event.target.richText)?'+R':'-R');
    if(event.modifier)kAXm+=' <C>';
    if(event.shift)kAXm+=' <S>';
    if(event.type!=='\Field')kAXm+=' '+event.type;
    kAXm+=' '+event.name;
    if(event.commitKey!==0)kAXm+=' c:'+event.commitKey;
    if(event.willCommit)kAXm+=' wC';
    if(event.change)kAXm+=' Ch:'+event.change;
    if(event.fieldFull)kAXm+=' FULL';
    if(event.target.charLimit!==0)kAXm+='\ L:'+event.target.charLimit;
    if(event.value){
      if(event.value.length>30){
        kAXm+=' evL:'+event.value.length;
      }
      else{
        kAXm+=((event.value.length>0)?' ev>'+event.value+'<':' evE');
      }
      if(event.value!==event.target.valueAsString)kAXm+=' v>'+event.target.value\AsString+'<';
    }
    console.println(kAXm);
    return;
  }
}
if(typeof gMRFL==='undefined'){
  function gMRFL(jAXo){
    if(jAXo<1)console.println('Make RF Lists begins..'+gRFCt()+' NumF='+this.numFields);
    gOfNA=[];
    gOmNA=[];
    gOfPH={
    };
    gOmPH={
    };
    gRtFC=0;
    if(this.numFields\>0){
      var jAXrfLA=gRtFL.split(' ');
      for(var jAXi=0;
      jAXi<jAXrfLA.length;
      jAXi++){
        var jAXrz=jAXrfLA[jAXi];
        if(jAXrz.length==0)continue;
        var jAXL=jAXrz.indexOf('~');
        if(jAXL>0){
          var jAXrpx=jAXrz.substr(0,jAXL);
          jAXL++;
          var jAXjz=jAXrz.substr(jAXL);
          jAXL-\-;
          var jAXign='?';
          var jAXigb='?';
          var jAXigc='?';
          var jAXrpA=jAXrpx.split('!');
          var jAXrpAL=jAXrpA.length;
          if(jAXrpAL>1){
            jAXrpx=jAXrpA[0];
            jAXign=jAXrpA[1];
            if(jAXrpAL>2)jAXigb=jAXrpA[2];
            if(jAXrpAL>3)jAXigc=jAXrpA[3];
            jAXL=jAXrpx.length;
          }
          var jAXjA=jAXjz.s\plit('>');
          if(jAXjA.length==2){
            var jAXx=0;
            var jAXrcO=jAXjA[0];
            var jAXrcN=jAXjA[1];
            var jAXrcNL=jAXrcN.length;
            var jAXj=this.numFields;
            for(var jAXy=0;
            jAXy<jAXj;
            jAXy++){
              var jAXnm=this.getNthFieldName(jAXy);
              if(jAXnm.substr(0,jAXL)!==jAXrpx)continue;
              \if(jAXrpAL>1){
                if(jAXnm.indexOf(jAXign)>0)continue;
                if(jAXnm.indexOf(jAXigb)>0)continue;
                if(jAXnm.indexOf(jAXigc)>0)continue;
              }
              var jAXix=jAXnm.indexOf(jAXrcN);
              if(jAXix<0)continue;
              var jAXiz=jAXix+jAXrcNL;
              var jAXONM=jAXnm.substr(0,jAXix)+jAX\rcO+jAXnm.substr(jAXiz);
              if(jAXONM!==jAXnm){
                gARFE(jAXONM,jAXnm);
                jAXx++;
              }
            }
          }
        }
        else{
          var jAXrA=jAXrz.split('>');
          if(jAXrA.length==2){
            if(jAXrA[0]!==jAXrA[1]){
              gARFE(jAXrA[0],jAXrA[1]);
            }
          }
        }
      }
    }
    if(gVrbL>0)console.println('@'+util.printd('HH:MM:ss ',ne\w Date())+'Made RF lists. NumF='+this.numFields+gRFCt());
    return;
  }
}
if(typeof gFaRFs==='undefined'){
  function gFaRFs(){
    console.println(' ');
    if(gRtFC==0)gMRFL(0);
    var qAXn=0;
    var qAXm=0;
    for(var qAXk in gOfPH){
      var qAXff=gOfPH[qAXk];
      if(qAXff==n\ull)continue;
      var qAXbb=gOmPH[qAXk];
      if(qAXbb==null)continue;
      var qAXfv=qAXff.valueAsString;
      if(qAXfv.length>0){
        if(qAXfv==' ')qAXfv='';
        if(qAXfv=='^ ')qAXfv='';
        if(qAXfv=='!n ')qAXfv='';
        if(qAXfv=='!= ')qAXfv='';
        if(qAXfv=='!+')qAXfv='';
        if(qAXfv==\'!+ ')qAXfv='';
        if(qAXfv=='!-')qAXfv='';
        if(qAXfv=='!- ')qAXfv='';
        if(qAXfv.length>1){
          var qAXbv=qAXbb.valueAsString;
          if(qAXbv=='^ ')qAXbv='';
          if(qAXbv==' ')qAXbv='';
          if(qAXbv=='  ')qAXbv='';
          if(qAXbv.length>0){
            qAXbv+=' !t!1 '+qAXfv;
          }
          else{
            qAXbv=qAX\fv;
          }
          qAXff.value=' ';
          qAXbb.value=qAXbv;
          qAXn++;
        }
        else{
          qAXff.value=' ';
          qAXm++;
        }
      }
    }
    return;
  }
}
if(typeof gFsRFs==='undefined'){
  function gFsRFs(){
    console.println(' ');
    if(gRtFC==0)gMRFL(0);
    var pAXmw='';
    var pAXvA=[];
    var pAXza=0;
    var pAXj=0;
    for(var pAXk in g\OfPH){
      var pAXf=gOfPH[pAXk];
      if(pAXf==null)continue;
      pAXj++;
      var pAXfv=pAXf.valueAsString;
      if(pAXfv=='^ '){
        pAXf.value=' ';
        continue;
      }
      if(pAXfv=='!n '){
        pAXf.value=' ';
        continue;
      }
      if(pAXfv=='!= '){
        pAXf.value=' ';
        continue;
      }
      if(pAXfv.length==1)continue;
      pAXvA\.push(pAXf.name+':='+pAXfv+'.');
      pAXza++;
    }
    if(pAXza<5){
      pAXmw=pAXvA.join('\r');
    }
    else{
      pAXmw=pAXvA[0]+'\r'+pAXvA[1]+'\r'+pAXvA[2]+'\r'+pAXvA[3]+'\r'+pAXvA[4];
      var pAXi=pAXj-pAXza;
      var pAXu=pAXza-5;
      if(pAXi>0)pAXmw+='\r  and '+pAXu+' others,  with '+\pAXi+' empty.\r ';
    }
    var pAXat=2;
    if(pAXmw.length>0){
      console.println('Retired field values:\r'+pAXmw+' ');
      pAXmw+=' \r \r\tClick <YES> to continue,\r or  <NO>  to log all the fields.';
    }
    else if(pAXj==0){
      pAXmw='No retired fields found.';
      console.prin\tln(pAXmw);
      pAXat=0;
    }
    else{
      pAXmw='All '+pAXj+' retired fields are empty.';
      console.println(pAXmw);
      pAXat=0;
    }
    var pAXr=gFaA(pAXat,3,'Retired fields','\tRetired field values:\r \r'+pAXmw);
    if(pAXr==3)console.println('All retired field non-empty values\:\r'+pAXvA.join('\r')+'\r ');
    pAXmw='';
    pAXvA=[];
  }
}
if(typeof gRFCt==='undefined'){
  function gRFCt(){
    var tAXoN=gOfNA.length;
    var tAXnN=gOmNA.length;
    var tAXt=' RFC:'+gRtFAC;
    if(gRtFAC!==gRtFC)tAXt+='/'+gRtFC;
    if(gRtFC!==tAXoN)tAXt+='^'+tAXoN;
    if(tAX\oN!==tAXnN)tAXt+='_'+tAXnN;
    return(tAXt);
  }
}
if(typeof gFSD==='undefined'){
  function gFSD(){
    if(this.numFields>0){
      var uAXfd=this.getField('My_DateFormat');
      var uAXdat=new Date();
      if(app.viewerVersion<6.0){
        if(typeof(app.viewerVariation)!=='undef\ined'){
          var uAXnum=uAXdat.valueOf();
          uAXnum-=60000*uAXdat.getTimezoneOffset();
          uAXdat=new Date(uAXnum);
        }
      }
      var uAXdf=uAXfd.valueAsString;
      if(uAXdf!='NoDates'){
        uAXdf=util.printd(uAXdf,uAXdat);
        var uAXz=this.getField('Date_A');
        if(uAXz!=null)uAXz.val\ue=uAXdf;
      }
    }
  }
}
if(typeof gFCLN==='undefined'){
  function gFCLN(lAXRoL,lAXopt,lAXfone,lAXftwo){
    var lAXstr=lAXRoL;
    var lAXff=((typeof(lAXfone)=='undefined')?null:lAXfone);
    var lAXfr=((typeof(lAXftwo)=='undefined')?null:lAXftwo);
    var lAXrr=lAXstr.ma\tch(gCIp);
    if(lAXrr!=null){
      for(var lAXji=0;
      lAXji<lAXrr.length;
      lAXji++){
        var lAXqnz=lAXrr[lAXji];
        var lAXqn=lAXqnz.slice(2,-1);
        var lAXqf=this.getField(lAXqn);
        if((typeof(lAXqf)!=='undefined')&&(lAXqf!==null)){
          lAXstr=lAXstr.replace(lAXqnz,lAX\qf.valueAsString);
        }
        else{
          var lAXst='undefined';
          if(lAXqn.indexOf('.')<0){
            var lAXsx='lAXst=typeof('+lAXqn+')';
            eval(lAXsx);
          }
          switch(lAXst){
            case 'number':var lAXyt='var lAXsv='+lAXqn;
            eval(lAXyt);
            lAXstr=lAXstr.replace(lAXqnz,lAXsv);
            break;
            case 'obj\ect':var lAXyt='var lAXsv='+lAXqn+';var lAXsvl='+lAXqn+'.length;';
            eval(lAXyt);
            lAXstr=lAXstr.replace(lAXqnz,lAXsv);
            break;
            case 'string':var lAXyt='var lAXsv='+lAXqn+';var lAXsvl='+lAXqn+'.length;';
            eval(lAXyt);
            if(lAXopt==0)lAXsv=lAXsv.replace(/!/g,'\!!');
            lAXstr=lAXstr.replace(lAXqnz,lAXsv);
            break;
            case 'undefined':if(lAXff!==null){
              if(lAXqn=='tC'){
                var lAXsv=String(lAXff.textColor);
                lAXstr=lAXstr.replace(lAXqnz,lAXsv);
                break;
              }
              if(lAXqn=='tF'){
                var lAXsv=String(lAXff.textFont);
                lAXstr=lAXstr.rep\lace(lAXqnz,lAXsv);
                break;
              }
            }
            if(lAXfr!==null){
              if(lAXqn=='tCR'){
                var lAXsv=String(lAXfr.textColor);
                lAXstr=lAXstr.replace(lAXqnz,lAXsv);
                break;
              }
              if(lAXqn=='tFR'){
                var lAXsv=String(lAXfr.textFont);
                lAXstr=lAXstr.replace(lAXqnz,lAXsv);
                break;
              }
            }
            if(gVr\bL>4)console.println('--'+lAXqn+' is not defined');
            break;
            default:if(gVrbL>4)console.println('--'+lAXqn+' is a '+lAXst);
          }
        }
      }
    }
    return lAXstr;
  }
}
if(typeof gFDC==='undefined'){
  function gFDC(xAXo){
    console.println('Start Vu Codes, VC is '+gVCds+' >0, o\='+xAXo+' Vm='+gVmD+' > 0');
    gVCds=0;
    gVmD=0;
    if(gThRm){
      var xAXTm=app.thermometer;
      xAXTm.duration=this.numFields+5;
      xAXTm.begin();
      var xAXTz=1;
      var xAXTn=0;
    }
    var xAXj=0;
    var xAXiL=this.numFields;
    for(var xAXi=0;
    xAXi<xAXiL;
    xAXi++){
      var xAXn=this.getNthFieldNam\e(xAXi);
      if(gThRm){
        xAXTn++;
        if(xAXTz--<=0){
          xAXTm.text='Refresh progress '+xAXTn;
          xAXTm.value=xAXTn;
          xAXTz=25;
        }
      }
      var xAXf=this.getField(xAXn);
      if(xAXf==null)continue;
      if(!xAXf.required)continue;
      var xAXrf=this.getField('D_'+xAXn);
      if(xAXrf==null)con\tinue;
      if(xAXrf.display!=display.noView)xAXrf.display=display.noView;
      if(xAXf.display!=display.noPrint){
        xAXf.display=display.noPrint;
        xAXj++;
      }
    }
    console.println('Ended Vu Codes, VC is '+gVCds+' >1, '+xAXj+' fields exposed');
    gVCds=1;
    if(gThRm){
      if(xAXTm.\cancelled)console.println('Thermometer was cancelled.');
      xAXTm.end();
    }
  }
}
if(typeof gFbH==='undefined'){
  function gFbH(kBXRoL){
    if(this.numFields>0){
      console.println('Rebuild.HelpHash '+kBXRoL);
      gHlpH={
      };
      var kBXv='';
      for(var kBXfn in gHFldH){
        var kB\Xf=this.getField(kBXfn);
        if(kBXf==null){
          console.println(' --- '+kBXfn+' not found');
          continue;
        }
        kBXv=kBXf.valueAsString;
        if(kBXv.length<5)continue;
        var kBXp=0;
        var kBXk=0;
        var kBXi=kBXv.indexOf('<H>',kBXp);
        while(kBXi>=0){
          kBXp=kBXi+3;
          var kBXj=kBXv.ind\exOf('<H>',kBXp);
          if(kBXj>=0){
            kBXk=kBXv.indexOf(':',kBXp);
            if(kBXk<0){
              kBXp=kBXv.length;
            }
            else if(kBXk<kBXj){
              var kBXL=kBXv.substring(kBXp,kBXk);
              kBXk++;
              if(typeof gHlpH[kBXL]!=='undefined')console.println('..REPLACING HELP for '+kBXL);
              if(kBXL.i\ndexOf(' ')>=0)console.println('ODD HELP key?:'+kBXL+':');
              gHlpH[kBXL]=kBXv.substring(kBXk,kBXj);
              kBXp=kBXj+1;
            }
          }
          kBXi=kBXv.indexOf('<H>',kBXp);
        }
      }
      gHHnR=0;
      kBXv='';
    }
  }
}
if(typeof gSGCT==='undefined'){
  function gSGCT(){
    if(typeof(gFsTc)!=='function')\{
      console.println('..JB: gSGCT is missing gFsTc');
    }
    else{
      var jBXf=this.getField('H_Colours');
      if(jBXf!==null){
        var jBXv=jBXf.valueAsString;
        gFsTc(jBXv.substr(5));
        gHidC=jBXv.substr(0,16);
        gMltC=(!(gHidC.substr(0,2)===gHidC.substr(1,2)));
      }
    }
  }
}
i\f(typeof gFCX==='undefined'){
  function gFCX(qBXRoL){
    var qBXopt=qBXRoL;
    console.println('@'+util.printd('HH:MM:ss ',new Date())+'** do gFCX '+qBXopt+((this.dirty)?' +D':''));
    var qBXrfrsh=0;
    if(qBXopt>10){
      qBXrfrsh=1;
      qBXopt-=10;
    }
    var qBXrs=0;
    if(\qBXopt>0){
      if(typeof(gCXH)==='undefined')gCXH={
      };
      var qBXrM=/![SHDCshdc1-9[\]:;
      iubB\+\-^v]/;
      for(var qBXk in gCXH){
        delete gCXH[qBXk];
      }
      var qBXDf=0;
      var qBXDr=0;
      var qBXDv=0;
      var qBXDh=0;
      var qBXDnP=0;
      var qBXDnV=0;
      var qBXDo=0;
      var qBXNL=0;
      var qBXSf=0;
      var \qBXOL=0;
      var qBXOv=0;
      var qBXTf=0;
      var qBXTr=0;
      var qBXTv=0;
      var qBXTq=0;
      var qBXTh=0;
      var qBXTnP=0;
      var qBXTnV=0;
      var qBXTo=0;
      var qBXVv=0;
      var qBXVn=0;
      var qBXTX=0;
      var qBXzz=0;
      var qBXnumF=this.numFields;
      for(var qBXci=0;
      qBXci<qBXnumF;
      qBXci++){
        var qBXfn=this.getNth\FieldName(qBXci);
        var qBXf=this.getField(qBXfn);
        if(qBXf==null){
          qBXNL++;
          continue;
        }
        var qBXtu=gFHash[qBXfn];
        var qBXtk='T|>RoOSijVxBKQvwyz'.indexOf(qBXtu);
        if(qBXtk==3){
          qBXDf++;
          if(qBXf.richText)qBXDr++;
          if(qBXf.readonly)qBXDo++;
          if(qBXf.display==di\splay.visible)qBXDv++;
          if(qBXf.display==display.hidden)qBXDh++;
          if(qBXf.display==display.noPrint)qBXDnP++;
          if(qBXf.display==display.noView)qBXDnV++;
          continue;
        }
        if(qBXtk<0){
          var qBXz='_'+qBXtu;
          console.println('xqv '+qBXz+' '+qBXfn);
          if(typeof(gCXH[qB\Xz])==='undefined')gCXH[qBXz]=0;
          gCXH[qBXz]++;
          continue;
        }
        if(qBXtk<3){
          qBXTf++;
          if(qBXf.required)qBXTq++;
          if(qBXf.richText)qBXTr++;
          if(qBXf.readonly)qBXTo++;
          if(qBXf.display==display.visible)qBXTv++;
          if(qBXf.display==display.hidden)qBXTh++;
          if(qBXf.d\isplay==display.noPrint)qBXTnP++;
          if(qBXf.display==display.noView)qBXTnV++;
          var qBXfv=qBXf.valueAsString;
          if(qBXfv.indexOf('`')>=0){
            qBXTX++;
          }
          else{
            if(qBXfv.match(qBXrM)!=null)qBXTX++;
          }
          continue;
        }
        if(qBXtk<6){
          qBXOL++;
          var qBXfv=qBXf.valueAsString;
          if(\qBXfv.length>1)qBXOv++;
          continue;
        }
        if(qBXtk<9){
          qBXSf++;
          continue;
        }
        if(qBXtk<11){
          if(qBXf.display==display.visible){
            if(qBXtk<10)qBXVv++;
          }
          qBXVn++;
          continue;
        }
        qBXzz++;
      }
      gCXH['Df']=qBXDf;
      gCXH['Dv']=qBXDv;
      gCXH['Dr']=qBXDr;
      gCXH['Do']=qBXDo;
      gCXH['Dh']=qBXDh;
      gCX\H['DnP']=qBXDnP;
      gCXH['DnV']=qBXDnV;
      gCXH['OL']=qBXOL;
      gCXH['Ov']=qBXOv;
      gCXH['NL']=qBXNL;
      gCXH['Sf']=qBXSf;
      gCXH['Tf']=qBXTf;
      gCXH['To']=qBXTo;
      gCXH['Tq']=qBXTq;
      gCXH['Tr']=qBXTr;
      gCXH['Tv']=qBXTv;
      gCXH['Th']=qBXTh;
      gCXH['TnP']=qBXTnP;
      gCXH['TnV']=qBXTnV;
      gCXH['NX']=g\BoxN;
      gCXH['Vv']=qBXVv;
      gCXH['Vn']=qBXVn;
      gCXH['TX']=qBXTX;
      gCXH['*z']=qBXzz;
      if(qBXDf!==qBXDv)qBXrs=1;
      if(qBXTf!==qBXTq)qBXrs+=2;
      if(qBXDf!==qBXTf)qBXrs+=4;
      if(qBXTX<6)qBXrs+=16;
      if(qBXDf-qBXDr>10)qBXrs+=32;
      if(qBXopt<8){
        if(gVrbL>2){
          var qBXmq='';
          if(\qBXrs>0)qBXmq='REFRESH';
          if(qBXrs>15)qBXmq='RICHness=RICH';
          if(qBXmq.length>0)console.println('mC '+qBXRoL+': We need '+qBXmq+': Dv='+qBXDv+' Tf='+qBXTf);
        }
      }
      var qBXm='';
      if(qBXopt>7){
        qBXm+='_FR_'+qBXopt+' >'+qBXrs;
        for(var qBXk in gCXH){
          if(gCXH[qBX\k]>0)qBXm+=' '+qBXk+':'+gCXH[qBXk];
        }
        qBXm+=' .';
        console.println(qBXm);
      }
    }
    if(qBXrs==0)qBXrfrsh=0;
    if(qBXrfrsh>0){
      qBXopt+=10;
      var qBXxrm='We think you should FULLY refresh the display before proceeding.';
      if(gTfXR)qBXxrm+='\r   Due to suspected bug in \Foxit, you really should do so.';
      if(qBXrs>15)qBXxrm='We need Richness=RICH';
      if(gVrbL>2)console.println('..NEED..'+qBXxrm);
      qBXxrm+='\r \rNormally use <OK> here!';
      var qBXgh=gFaA(1,2,'Time to REFRESH',qBXxrm);
      var qBXansAr=new Array('00','OK','Canc\el','No','Yes','5','6');
      console.println('Do we refresh.'+qBXopt+'? : '+qBXansAr[qBXgh]);
      if(qBXgh==1){
        if(qBXrs>15){
          gFbR('Rich');
        }
        else{
          gFiF('+*FixUpALL');
          if(gVrbL>2)console.println('..after REFRESH..  Rv:'+gCXH['Rv']+' Tf:'+gCXH['Tf']+' =>'+qB\Xrs);
          qBXrs+=128;
        }
      }
    }
    console.println('@'+util.printd('HH:MM:ss ',new Date())+'** done gFCX '+qBXopt+' rs:'+qBXrs+((this.dirty)?' +D':''));
    return qBXrs;
  }
}
if(typeof gFOP==='undefined'){
  function gFOP(pBXRoL){
    var pBXvl=pBXRoL;
    var pBXof=this.getFi\eld('My_Options');
    if(pBXof!=null){
      var pBXov=' '+pBXof.valueAsString+' ';
      var pBXoA=pBXvl.split(':');
      for(var pBXoi=0;
      pBXoi<pBXoA.length;
      pBXoi++){
        var pBXoh=pBXoA[pBXoi];
        if(pBXoh.length<5)continue;
        var pBXos=pBXoh.substr(0,1);
        var pBXoj='-+'.indexOf\(pBXos);
        if(pBXoj<0)continue;
        pBXoh=pBXoh.substr(1);
        var pBXxE=pBXoh.indexOf('=');
        if(pBXxE<0)pBXxE=pBXoh.length;
        if(pBXoh.indexOf('-')>=0){
          if(pBXoh.indexOf('-')<pBXxE)continue;
        }
        if(pBXoh.indexOf('+')>=0){
          if(pBXoh.indexOf('+')<pBXxE)co\ntinue;
        }
        if(pBXoh=='PULnn'){
          pBXov=pBXov.replace(/ PUL\d+/g,' ');
          pBXov=pBXov.replace(/ PULnn/g,' ');
          pBXvl=pBXvl.replace(/PULnn/,' ');
          gPUpL=5;
          pBXoj=0;
        }
        else{
          do{
            var pBXoe=pBXov.indexOf(pBXoh);
            if(pBXoe>=0)pBXov=pBXov.substr(0,pBXoe)+pBXov.substr(\pBXoh.length+pBXoe);
          }
          while(pBXoe>=0);
        }
        if(pBXoj==1)pBXov+=' '+pBXoh+' ';
      }
      var pBXPi=pBXov.indexOf(' PUL');
      if(pBXPi>0){
        var pBXPuL=parseInt(pBXov.substr(pBXPi+4));
        if(isNaN(pBXPuL)){
          gPUpL=5;
        }
        else{
          gPUpL=pBXPuL;
        }
        if(gPUpL!=5)console.println('_\PopupL='+gPUpL);
      }
      pBXov=pBXov.replace(/\s+/g,' ');
      pBXof.value=pBXov;
    }
  }
}
if(typeof gFcT==='undefined'){
  function gFcT(tBXRoLA){
    var tBXq=tBXRoLA[0];
    var tBXi=1;
    while(tBXi<tBXRoLA.length){
      tBXq+=',';
      var tBXv=tBXRoLA[tBXi];
      tBXi++;
      if(tBXv==0){
        tBXq+='0';
        \continue;
      }
      if(tBXv==1){
        tBXq+='1';
        continue;
      }
      tBXq+=tBXv.toFixed(3);
    }
    return tBXq;
  }
}
if(typeof gFxC==='undefined'){
  function gFxC(){
    if(this.numFields>0){
      var uBXfxd=this.dirty;
      var uBXa=this.getField('Classification');
      var uBXv=uBXa.valueAsString;
      uBXa.v\alue=uBXv;
      uBXa=this.getField('IsBrownSticker');
      uBXv=uBXa.valueAsString;
      uBXa.value=uBXv;
      this.dirty=uBXfxd;
    }
  }
}
if(typeof gFcb==='undefined'){
  function gFcb(lBXRoLA){
    if(typeof(app.runtimeHighlight)==='boolean'){
      var lBXnfx=false;
      if(lBXRoLA==1){
        lBXnf\x=true;
      }
      else if(lBXRoLA!=0){
        if(!app.runtimeHighlight)lBXnfx=true;
      }
      if(app.runtimeHighlight!=lBXnfx){
        app.runtimeHighlight=lBXnfx;
        if(gVrbL>2)console.println('RT.H >> '+app.runtimeHighlight);
        if(lBXRoLA<4)app.alert({
          nIcon:0,nType:0,cMsg:'Runtime f\ield highlighting has been '+((app.runtimeHighlight)?'enabled':'disabled')+'.\r \rSee bookmark HELP / BLUE Fill for more details.'
        });
      }
    }
    else{
      if(gVrbL>2)console.println('RT.H? '+typeof(app.runtimeHighlight));
    }
  }
}
if(typeof gFsTc==='undefined'){
  \function gFsTc(xBXRoL){
    if(typeof(gScHash)=='undefined'){
      console.println('..JB: gFsTc is missing gScHash');
    }
    else{
      gScxA=new Array(0,1,1,0,0,1,1,0);
      for(var xBXi=0;
      xBXi<8;
      xBXi++){
        var xBXc=xBXRoL.substr(xBXi,1);
        var xBXq='S'+xBXc;
        if(typeof(gScHa\sh[xBXq])!=='undefined'){
          gScxA[xBXi]=gScHash[xBXq];
        }
        else{
          var xBXyz='0123456789'.indexOf(xBXc);
          if(xBXyz>=0)gScxA[xBXi]=xBXyz;
        }
      }
    }
  }
}
if(typeof gRpR==='undefined'){
  function gRpR(kCXc,kCXmin){
    if(gVrbL>0){
      var kCXwq=gFnK(gAdRH);
      if(kCXwq>kCXmin){
        co\nsole.println('T.Vv '+'Pending Rectangles.'+kCXc+': '+kCXwq);
      }
    }
    if(gVrbL>2){
      for(var kCXjk in gAdRH){
        console.println('v_'+kCXc+': '+kCXjk+'  >'+gAdRH[kCXjk]+'<');
      }
    }
    return kCXwq;
  }
}
if(typeof gRadR==='undefined'){
  function gRadR(jCXv){
    var jCXu=jCXv;
    \var jCXi=jCXu.indexOf('!#');
    if(jCXi>=0){
      var jCXrz='!#';
      var jCXc='0';
      var jCXj=2;
      if(jCXi>1){
        if(jCXu.charAt(jCXi-2)=='!'){
          var jCXk=jCXu.charAt(jCXi-1);
          var jCXy='0123456789;'.indexOf(jCXk);
          if(jCXy>=0){
            jCXc=jCXk;
            jCXj=4;
            jCXi-=2;
            jCXrz=jCXu.substr\(jCXi,jCXj);
          }
        }
      }
      var jCXw=(jCXc==';')?' remove xNyAME ':' '+gLRFN+'!'+jCXc+'1 ';
      jCXu=jCXu.substr(0,jCXi)+jCXu.substr(jCXi+jCXj);
      gAdRH[gLRFN]=jCXrz;
      if(gTfXR){
        console.println('RadR '+event.targetName+' > '+jCXu);
      }
      else{
        var jCXf=this.getField('My_R\ectangles');
        if(jCXf!==null){
          var jCXt=jCXf.valueAsString;
          var jCXs=' '+jCXt+' ';
          if(jCXc!==';'){
            if(jCXs.indexOf(jCXw)>=0)jCXw='';
          }
          if(jCXw.length>0){
            jCXs=jCXs.replace(' '+gLRFN+'!',' ');
            jCXs=jCXs.replace(/ [0123456789:][012345]? /g,' ');
          }
          if(jC\Xc==';')jCXw='';
          jCXs+=jCXw;
          jCXs=jCXs.replace(/ +/g,' ');
          jCXs=jCXs.replace(' x ',' ');
          if(jCXs.length<4)jCXs='x';
          if(jCXs!==jCXt)jCXf.value=jCXs;
        }
      }
    }
    return jCXu;
  }
}
if(typeof gRdNA==='undefined'){
  function gRdNA(qCXv){
    var qCXu=qCXv;
    var qCXN=(gShN)\?1:0;
    if(gShA)qCXN+=2;
    var qCXX=0;
    switch(qCXN){
      case 3:break;
      case 0:qCXu='';
      break;
      case 1:qCXu='!}'+qCXu+'!}';
      var qCXa=qCXu.split('!{');
      var qCXn=qCXa.length;
      qCXu='';
      for(var qCXi=0;
      qCXi<qCXn;
      qCXi++){
        qCXX=qCXa[qCXi].indexOf('!}');
        if(qCXX>=0){
          qCXu+=q\CXa[qCXi].substr(qCXX+2);
        }
        else{
          qCXu+=qCXa[qCXi];
        }
      }
      break;
      case 2:qCXu='!}'+qCXu+'!}';
      var qCXa=qCXu.split('!{');
      var qCXn=qCXa.length;
      qCXu='';
      for(var qCXi=0;
      qCXi<qCXn;
      qCXi++){
        qCXX=qCXa[qCXi].indexOf('!}');
        if(qCXX>0)qCXu+=qCXa[qCXi].substr(0,qCXX);
        \
      }
      break;
    }
    qCXu=qCXu.replace(/!{
      /g,'');
      return qCXu;
    }
  }
  if(typeof gFLnF==='undefined'){
    function gFLnF(pCXn,pCXd){
      var pCXv='0';
      switch(pCXn){
        case 0:pCXv='0';
        break;
        case 1:pCXv='1';
        break;
        default:pCXv=pCXn.toFixed(pCXd);
      }
      return pCXv;
    }
  }
  if(typeof gFLrN==='u\ndefined'){
    function gFLrN(tCXr,tCXd){
      var tCXe=2;
      if(typeof(tCXd)!=='undefined')tCXe=tCXd;
      var tCXm=tCXr[0].toFixed(tCXe)+','+tCXr[1].toFixed(tCXe)+','+tCXr[2].toFixed(tCXe)+','+tCXr[3].toFixed(tCXe);
      return tCXm;
    }
  }
  if(typeof gFLcN==='undefined\'){
    function gFLcN(uCXc,uCXd){
      var uCXe=3;
      if(typeof(uCXd)!=='undefined')uCXe=uCXd;
      var uCXm=uCXc[0];
      if(uCXc.length>1)uCXm+=','+gFLnF(uCXc[1],uCXe);
      if(uCXc.length>2)uCXm+=','+gFLnF(uCXc[2],uCXe);
      if(uCXc.length>3)uCXm+=','+gFLnF(uCXc[3],uCXe)\;
      if(uCXc.length>4)uCXm+=','+gFLnF(uCXc[4],uCXe);
      return uCXm;
    }
  }
  if(typeof gFHsR==='undefined'){
    function gFHsR(){
      for(var lCXyi=0;
      lCXyi<this.numFields;
      lCXyi++){
        var lCXwn=this.getNthFieldName(lCXyi);
        if((lCXwn.substr(0,2)!=='V_')&&(lCXwn.subst\r(0,2)!=='v_'))continue;
        var lCXwf=this.getField(lCXwn);
        if(lCXwf!=null){
          if(lCXwf.valueAsString!==''){
            console.println('CLEAR '+lCXwn+' >'+lCXwf.valueAsString+'<');
            lCXwf.value='';
          }
          lCXwf.display=display.hidden;
        }
      }
    }
  }
  if(typeof gFTsB==='undefined'){
    \function gFTsB(xCXopt){
      if(xCXopt>7){
        var xCXr=1;
        var xCXfn=event.targetName;
        var xCXtn=xCXfn.substr(2);
        var xCXt=this.getField(xCXtn);
        if(!event.shift){
          if(xCXt==null){
            console.println('t-s-b CANNOT find field '+xCXtn);
          }
          else{
            var xCXttl='Rich Text F\OCUS Warning..';
            xCXmsg='You have touched a special box field\r \rWe will hide all those rectangles.';
            xCXmsg+='\rYou need to click in the field again to make your changes.';
            xCXmsg+='\r \rTo bypass this message, press <Shift> when clicking in the recta\ngle.';
            xCXmsg+='\r \rLater you should REFRESH the display to expose the rectangles.\r \rClick <Cancel> to inhibit hiding these rectangles.';
            xCXr=gFaA(1,1,xCXttl,xCXmsg);
          }
        }
        if(xCXt!=null){
          if(xCXr==1){
            gFHsR();
            gRisN++;
            if(xCXopt>10)xCXt.setFocus(\);
          }
        }
      }
    }
  }
  if(typeof gFMjW==='undefined'){
    function gFMjW(){
      var kDXjf=this.getField('A_JN');
      if(kDXjf!=null){
        var kDXov=gOzX;
        var kDXh='About the JavaScript warning';
        var kDXm='We currently will '+((kDXov.indexOf(' HideJ')<0)?'expose':'hide')+' the \java warning message when we save the form.\r \rClick <YES> to '+((kDXov.indexOf(' HideJ')<0)?'hide':'expose')+' the message when we save the form,\r  or  <NO>  to proceed to the next question,\r  or <CANCEL> to do nothing more here.';
        kDXr=gFaA(\3,2,kDXh,kDXm);
        if(kDXr==4){
          var kDXz='-';
          if(kDXov.indexOf(' HideJ')<0)kDXz='+';
          gFOP(':'+kDXz+'HideJ:');
        }
        if(kDXr!=2){
          kDXm='Now, click <OK> to toggle current display of the message.';
          var kDXr=gFaA(1,2,kDXh,kDXm);
          if(kDXr==1){
            var kDXjd=kDXjf.dis\play;
            kDXjf.display=((kDXjd==display.hidden)?display.noPrint:display.hidden);
          }
        }
      }
    }
  }
  if(typeof gTRaO==='undefined'){
    function gTRaO(){
      var jDXmm=((gOzX.indexOf('RfrAtOp')>=0)?'en':'dis')+'abled';
      var jDXr=gFaA(3,2,'Adjust Refresh at Open','This is\ primarily used in Adobe PDF reader products.\r \rYou can change the automatic refresh via page swapping\rduring the openUp process\r \rCurrent setting = '+jDXmm+'\r \r Click <Yes> to ENABLE \r   <No>  to  DISABLE\r <Cancel> for no change.');
      if(\jDXr==4)gFOP(':+RfrAtOp:');
      if(jDXr==3)gFOP(':-RfrAtOp:');
    }
  }
  if(typeof gFsH==='undefined'){
    function gFsH(qDXRoL){
      if(this.numFields>0){
        var qDXxv=qDXRoL;
        var qDXm='';
        var qDXttl='HELP';
        if(qDXm.length<4){
          if(gHHnR==1)gFbH(qDXxv);
          qDXm=gHlpH[qDXx\v];
          if(typeof qDXm=='undefined')qDXm='';
          if(qDXm.length<4){
            qDXm=gHlpH['MISSING'];
            if(typeof qDXm=='undefined')qDXm='';
          }
          if(qDXm.length<4)qDXm='Sorry, text for <HELPTAG> is unavailable.<n>  <n>It may be loaded to a HELP field via an FDF file.<n> <n>For\ more details<n> please consult the usage guide for at least revision 19F04 of this form.';
          qDXm=qDXm.replace(/\r/g,' ');
          qDXm=qDXm.replace(/ ?<n>/g,'\r');
          qDXm=qDXm.replace(/<T>/g,'\t');
          qDXm=qDXm.replace(/<L>/g,'(');
          qDXm=qDXm.replace(/<R>/g,')\');
          qDXm=qDXm.replace(/<HELPTAG>/g,qDXxv);
        }
        qDXhv='';
        if(qDXm.length>0){
          var qDXmi=qDXm.indexOf('|||');
          if(qDXmi>4){
            qDXttl=qDXm.substr(0,qDXmi);
            qDXm=qDXm.substr(qDXmi+3);
            if(qDXm.length>30){
              if(qDXm.indexOf('\xAB')>0)qDXm=gFCLN(qDXm,1);
            }
          }
          if\(gVrbL>0)qDXttl+=' ('+qDXxv+')';
          gFaA(0,3,qDXttl,qDXm);
        }
        else{
          if(qDXxv.length>2){
            if(qDXxv.substr(0,1)!=='-'){
              gFaA(0,3,'Help is missing','Sorry - no HELP is available for '+qDXxv+'.');
              console.println('No hint available for '+qDXxv+'.');
            }
          }
        }
        qDX\m='';
      }
    }
  }
  if(typeof gFHS==='undefined'){
    function gFHS(pDXRoL){
      if(this.numFields>0){
        gFaA(0,3,'HELP',pDXRoL);
      }
    }
  }
  if(typeof gFSz==='undefined'){
    function gFSz(tDXRoL){
      if(this.numFields>0){
        var tDXif=this.getField('I_Format');
        var tDXf=this.getField\('My_FormatA');
        var tDXv=tDXf.valueAsString;
        tDXv=tDXv.replace(/T12|T10|T11|T8|T9/g,' ');
        tDXv=tDXv.replace(/\s+/g,' ');
        tDXv=tDXv.replace(/^x/,' ');
        var tDXp=' '+tDXRoL+' ';
        gFcZ(tDXp);
        tDXf.value=tDXv.concat(tDXp);
        tDXif.value=tDXv.concat(tDXp);
      }
      \
    }
  }
  if(typeof gFcP==='undefined'){
    function gFcP(uDXRoL){
      var uDXLA=uDXRoL.split('\r');
      for(var uDXL in uDXLA){
        console.println(uDXLA[uDXL]);
      }
      uDXLA=(' ');
    }
  }
  if(typeof gFUp==='undefined'){
    function gFUp(lDXRoL){
      if(lDXRoL==0)lDXRoL=255;
      for(var l\DXt=0;
      lDXt<this.numFields;
      lDXt++){
        var lDXtn=this.getNthFieldName(lDXt);
        var lDXwf=this.getField(lDXtn);
        if(lDXwf==null)continue;
        if(lDXwf.type!='text')continue;
        if(!lDXwf.required)continue;
        var lDXtu=gFHash[lDXtn];
        var lDXtk='T|>RLyzBQxKvwoiSjV'.inde\xOf(lDXtu);
        if(lDXtk>4)continue;
        var lDXg=0;
        var lDXsv=lDXwf.valueAsString;
        var lDXnv=lDXsv;
        for(var lDXii=0;
        lDXii<lDXsv.length;
        lDXii++){
          var lDXcc=lDXsv.charCodeAt(lDXii);
          if(lDXcc>lDXRoL){
            console.println('..at '+lDXii+' in '+lDXtn+' : '+lDXcc);
            var \lDXc=lDXsv.charAt(lDXii);
            var lDXh=lDXcc.toString(16);
            lDXnv=lDXnv.replace(lDXc,'!U+'+lDXh+';');
            lDXg++;
          }
        }
        if(lDXg==0)continue;
        lDXwf.value=lDXnv;
      }
    }
  }
  if(typeof gFbR==='undefined'){
    function gFbR(xDXRoL){
      if(this.numFields>0){
        var xDXMR=this.getField(\'My_Richness');
        var xDXFn='AskRb';
        if(xDXRoL==='Rich'){
          var xDXgh=gFaA(0,2,'Need NONE before Rich','This will be a bit slow.\r \rWe need to set mode NONE before RICH mode\r i.e. there will be 2 refresh cycles\r \rThe screen may not refresh until thi\s completes.');
          if(gSPNs==2)xDXgh+='\r \rA message will appear when this finishes.';
          var xDXsb=gBPA[0];
          gPfx='!0!=';
          gBPA[0]=gPfx;
          xDXMR.value='Nothing';
          xDXMR.value='None';
          gFiF('+*FixUpALLXX');
          gBPA[0]=xDXsb;
          xDXFn='*FixUpALL';
          gPTn=0;
        }
        if(xDXRoL!='Rich')\{
          if(gRMo<8)gFiF('F+R');
        }
        xDXMR.value='Nothing';
        xDXMR.value=xDXRoL;
        gFiF('+'+xDXFn);
      }
    }
  }
  if(typeof gFVbR==='undefined'){
    function gFVbR(kEXRoL){
      var kEXv=kEXRoL;
      var kEXf=kEXv.indexOf(' ');
      kEXv=kEXv.replace(/!\+/g,' +=LARGER ');
      kEXv=kEXv.replace(/\!-/g,' -=SMALLER ');
      kEXv=kEXv.replace('!0',' 0=BLACK ');
      kEXv=kEXv.replace('!1',' 1=RED ');
      kEXv=kEXv.replace('!2',' 2=BLUE ');
      kEXv=kEXv.replace('!3',' 3=FUCHSIA ');
      kEXv=kEXv.replace('!4',' 4=GREEN ');
      kEXv=kEXv.replace('!5',' 5=PURPLE ');
      kEXv=k\EXv.replace('!6',' 6=CERULEAN ');
      kEXv=kEXv.replace('!7',' 7=BROWN ');
      kEXv=kEXv.replace('!8',' 8=DARKBROWN ');
      kEXv=kEXv.replace('!9',' 9=ORANGE ');
      kEXv=kEXv.replace('![',' [=60%GRAY ');
      kEXv=kEXv.replace('!]',' ]=SILVER ');
      kEXv=kEXv.replace('!:\',' :=GAINSBORO ');
      kEXv=kEXv.replace('!;',' ;=WHITE ');
      kEXv=kEXv.replace('!i',' i=ITALIC ');
      kEXv=kEXv.replace('!b',' b=BOLD ');
      kEXv=kEXv.replace('!<',' <=LEFT-J ');
      kEXv=kEXv.replace('!|',' |=CENTERED ');
      kEXv=kEXv.replace('!>',' >=RIGHT-J ');
      i\f(gRMd==8){
        kEXv=kEXv.replace('!N',' N=ReSet ');
        kEXv=kEXv.replace('!=',' ==NormalSize ');
      }
      else{
        kEXv=kEXv.replace('!N',' N=Nothing ');
        kEXv=kEXv.replace('!=',' ==LOCK ');
      }
      if(kEXf<0)kEXv=kEXv.replace(/\s+/g,' ');
      return kEXv;
    }
  }
  if(typeof gFmkR==\='undefined'){
    function gFmkR(jEXRoL){
      var jEXof=jEXRoL;
      var jEXn='D_'+jEXof.name;
      var jEXf=this.getField(jEXn);
      if(jEXf==null){
        if(gVrbL>1)console.println('Making field '+jEXn);
        jEXf=this.addField(jEXn,'text',jEXof.page,jEXof.rect);
        if(typeof(jEXf\)!=='object'){
          console.println('A-F '+jEXn+'  '+typeof(jEXf));
          jEXf=null;
        }
        else{
          if(jEXf.name!==jEXn){
            console.println('A?F.failed. '+jEXn);
            gFHash[jEXn]='*';
            this.removeField(jEXn);
            console.println('A?F.2.');
            jEXf=null;
          }
        }
      }
      else{
        console.println('No n\eed to Make field '+jEXn);
      }
      if(jEXf!=null){
        jEXf.setAction('OnFocus','gRFF();');
        jEXf.setAction('MouseUp','gRMU();');
        if(gDFK)jEXf.delay=true;
        jEXf.lineWidth=0;
        jEXf.userName=jEXn+'';
        jEXf.textSize=10;
        jEXf.display=display.visible;
        jEXf.fillColor=colo\r.gray;
        jEXf.richText=false;
        jEXf.textSize=10;
        jEXf.alignment='left';
        jEXf.textFont=font.Helv;
        jEXf.textColor=color.black;
        jEXf.readonly=true;
        jEXf.doNotSpellCheck=true;
        if(gDFK)jEXf.delay=false;
      }
      return jEXf;
    }
  }
  if(typeof gFARd==='undefined'){
    function gFARd(qE\XRoL){
      console.println('**ReCreate D_* fields. '+qEXRoL);
      var qEXnA=new Array();
      var qEXsk=0;
      for(var qEXi=0;
      qEXi<this.numFields;
      qEXi++){
        var qEXfn=this.getNthFieldName(qEXi);
        var qEXf=this.getField(qEXfn);
        if(qEXf==null)continue;
        if(qEXf.type!='tex\t')continue;
        if(!qEXf.required){
          if(gVrbL>2)console.println('..skip.. '+qEXfn);
          qEXsk++;
          continue;
        }
        var qEXtu=gFHash[qEXfn];
        var qEXtk='T|>RLyzBQxKvwoiSj'.indexOf(qEXtu);
        if(qEXtk<0)continue;
        if(qEXtk>2)continue;
        var qEXrfn='D_'+qEXfn;
        if(this.getFiel\d(qEXrfn)!=null)continue;
        qEXnA.push(qEXfn);
      }
      var qEXx=0;
      while(qEXnA.length>0){
        var qEXn=qEXnA.pop();
        if(gVrbL>9)console.println('-A- '+qEXn);
        var qEXnf=this.getField(qEXn);
        if(qEXnf==null)continue;
        var qEXrf=gFmkR(qEXnf);
        if(qEXrf==null){
          con\sole.println('..Failed to create D_ field for '+qEXn);
          gFHash[qEXn]='W';
        }
        else{
          if(gVrbL>9)console.println('  >> '+qEXrf.name);
          gFHash[qEXrf.name]='R';
          qEXx++;
        }
      }
      console.println('Added '+qEXx+' D_* and skipped '+qEXsk+' fields.');
      gFiF('+AskRa');
    }
  }
  if(\typeof gFDRd==='undefined'){
    function gFDRd(pEXRoL){
      console.println('**Remove D_* fields. '+pEXRoL);
      var pEXnA=new Array();
      for(var pEXi=0;
      pEXi<this.numFields;
      pEXi++){
        var pEXfn=this.getNthFieldName(pEXi);
        if(pEXfn.substr(0,2)!=='D_')continue;
        va\r pEXf=this.getField(pEXfn);
        if(pEXf==null)continue;
        pEXnA.push(pEXfn);
      }
      var pEXx=0;
      while(pEXnA.length>0){
        var pEXn=pEXnA.pop();
        if(gVrbL>2)console.println('-D- '+pEXn);
        try{
          this.removeField(pEXn);
        }
        catch(e){
          console.println('E_DelR '+pEXn+' : \'+e.message);
        }
        if(this.getField(pEXn)==null){
          pEXx++;
          if(gVrbL>2)console.println('*removed '+pEXn);
        }
      }
      console.println('Removed '+pEXx+' D_ fields');
    }
  }
  if(typeof gRMU==='undefined'){
    function gRMU(){
      var tEXRf=event.target;
      var tEXRn=event.targetNam\e;
      var tEXan=tEXRn.substr(2);
      var tEXf=this.getField(tEXan);
      if(tEXf==null){
        console.println('R.mU..cannot find field '+tEXan);
      }
      else{
        var tEXn=0;
        var tEXtgt=null;
        if(gSPNs==2){
          if(gVrbL>0)console.println('D_Mu: '+tEXRn+' m:'+event.modifier+' s:'+even\t.shift);
          tEXtgt=tEXf;
          tEXn=8;
        }
        else if (gSPNs==1){
          tEXtgt=tEXf;
          tEXn=8;
        }
        else if (gSPNs==0){
          tEXtgt=tEXf;
          tEXn=8;
        }
        if(tEXtgt!==null){
          if(tEXtgt.display!==display.noPrint)tEXtgt.display=display.noPrint;
          if(tEXn==8){
            if(tEXRf.display!==display.noView)tEXR\f.display=display.noView;
          }
          tEXtgt.setFocus();
        }
      }
    }
  }
  if(typeof gFcV==='undefined'){
    function gFcV(){
      if(typeof(gVcN)=='undefined'){
        console.println('..JB: gFcV is missing gVcN');
      }
      else{
        if(gVcN++==0){
          if(app.platform=='MAC'||app.platform=='WIN'){
            if(\app.viewerType=='Reader'){
              if(app.formsVersion<11)app.alert({
                cTitle:'System Card PDF Form',nIcon:3,nType:0,cMsg:' \rThis form works best with Adobe Reader XI or later\rwith forms version at least 11\r \rPlease check the Usage Guide for more details\.'
              });
            }
          }
        }
      }
    }
  }
  if(typeof gFpC==='undefined'){
    function gFpC(){
      if(this.numPages<2)app.alert({
        cTitle:'System Card PDF Form',nIcon:3,nType:0,cMsg:' \rWho stole some page(s)?\r \rRemoving pages may cause problems with this form.\r \rPlease check the\ Usage Guide for more details.'
      });
    }
  }
  if(typeof gFFz==='undefined'){
    function gFFz(){
      if(gIzC==0){
        if(gOzX.indexOf('FSZnoLim')<0){
          var xEXzL=((gSPNs==2)?2100000:1700000);
          if(gOzX.indexOf('BigFSZlim')>0)xEXzL=5500000;
          if(this.filesize>xEXzL)ap\p.alert({
            cTitle:'System Card PDF Form',nIcon:3,nType:0,cMsg:' \rThis file looks very big.   '+this.filesize+' exceeds '+xEXzL+'\r \rPlease consider using the [REFRESH] bookmark to perform a FULL refresh.\r \rTHEN use SAVE_AS new file name when savin\g the file.\r \rYour program may need optimize functions enabled.\r \rAlso check the Usage Guide for more details.'
          });
        }
      }
    }
  }
  if(typeof gFcF==='undefined'){
    function gFcF(kFXRoL){
      if(typeof(gFontA)=='undefined'){
        console.println('..JB: gFcF is miss\ing gFontA');
      }
      else{
        var kFXoF=gFontA.join('|');
        var kFXdF='Arial';
        gFontA=new Array();
        var kFXaF='';
        if(gVrbL>2)console.println('CFs.a >'+kFXRoL+'<');
        var kFXffA=kFXRoL.split('|');
        for(var kFXi in kFXffA){
          var kFXqq=kFXffA[kFXi];
          if(kFXqq.length==0)\continue;
          if(kFXqq=='?'){
            if(gVrbL>0){
              console.println(' RFA '+gRFA.join('|'));
              console.println(' BFA '+gBFA.join('|'));
              console.println(' CFA '+gFontA.join('|'));
            }
            continue;
          }
          if(kFXqq.substr(0,2)=='L:'){
            kFXqq=kFXqq.substr(2);
            if(kFXqq.leng\th<3)kFXqq='Arial';
            gRFA[4]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,2)=='B:'){
            kFXqq=kFXqq.substr(2);
            if(kFXqq.length<2)kFXqq='Arial';
            if(kFXqq.length<3)kFXqq='';
            gRFA[1]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,2)=='I:'){
            kFXqq=kFXqq.substr(2);
            if(kFXqq.le\ngth<2)kFXqq='Arial';
            if(kFXqq.length<3)kFXqq='';
            gRFA[2]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,3)=='BI:'){
            kFXqq=kFXqq.substr(3);
            if(kFXqq.length<2)kFXqq='Arial';
            if(kFXqq.length<3)kFXqq='';
            gRFA[3]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,3)=='bF:'){
            kFX\qq=kFXqq.substr(3);
            if(kFXqq.length<3)kFXqq=font.Helv;
            gBFA[0]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,3)=='bB:'){
            kFXqq=kFXqq.substr(3);
            if(kFXqq.length<3)kFXqq=font.HelvB;
            gBFA[1]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,3)=='bI:'){
            kFXqq=kFXqq.substr(3)\;
            if(kFXqq.length<3)kFXqq=font.HelvI;
            gBFA[2]=kFXqq;
            continue;
          }
          if(kFXqq.substr(0,4)=='bBI:'){
            kFXqq=kFXqq.substr(4);
            if(kFXqq.length<3)kFXqq=font.HelvBI;
            gBFA[3]=kFXqq;
            continue;
          }
          if(kFXqq.length<2)kFXqq=kFXdF;
          gFontA.push(kFXqq);
          if(kFXaF.length>0)\kFXaF+='|';
          kFXaF+=kFXqq;
        }
        if(kFXaF.length==0){
          gFontA.push(kFXdF);
          kFXaF+=kFXdF;
        }
        if(kFXaF!=kFXoF)console.println('Use FONTs '+kFXaF+'.');
      }
    }
  }
  if(typeof gFsR==='undefined'){
    function gFsR(jFXRoL){
      gMode=jFXRoL;
      if(gMode=='Rich'){
        gRMd=gRMx;
        gPfx=gRPA[0\];
        gSfx=gRSA[0];
      }
      if(gMode=='Basic'){
        gRMd=2;
        if(gBMd==0){
          gPfx='';
          gSfx='';
        }
        else{
          gPfx=gBPA[0];
          gSfx=gBSA[0];
        }
      }
      if(gMode=='None'){
        gRMd=1;
        gPfx='';
        gSfx='';
      }
      if(gRMd>5){
        if(gNTrL>0)gRMd=5;
      }
    }
  }
  if(typeof gFPuM==='undefined'){
    function gFPuM(){
      var qFXc='SHORT\';
      if(gTMF<1)qFXc='TINY';
      if(gTMF>1)qFXc='LONG';
      var qFXqA=gFaA(3,2,'Popup Messages','We normally show long popup messages in multiple shorter messages.\rLong messages can cause the <OK> button to be off-screen and seem inaccessible.\rIf that happens \you should press <Enter> or the spacebar to close the message and avoid losing any changes you had made to the form.\r \rClick  <Yes>  for LONG messages,  <No>  for SHORT messages\r  or  <Cancel>  for TINY messages.    Current = '+qFXc+'\r \rA good b\ookmark to test this on is [Rich Codes]');
      if(qFXqA==4)gTMF=2;
      if(qFXqA==3)gTMF=1;
      if(qFXqA==2)gTMF=0;
      qFXf=this.getField('My_Options');
      if(qFXf!=null){
        qFXv=qFXf.valueAsString;
        qFXv=qFXv.replace(/Tall/g,' ');
        qFXv=qFXv.replace(/Tiny/g,' ');
        qFXv=qF\Xv.replace(/Short/g,' ');
        if(qFXqA==4)qFXv+=' Tall ';
        if(qFXqA==3)qFXv+=' Short ';
        if(qFXqA==2)qFXv+=' Tiny ';
        qFXv=qFXv.replace(/\s+/g,' ');
        qFXf.value=qFXv;
      }
      gSWH();
      if(gWHt>410){
        if(gTMF<2){
          console.println('BOOST popup height selection one le\vel!');
          gTMF++;
        }
      }
    }
  }
  if(typeof gFScE==='undefined'){
    function gFScE(){
      console.show();
      if(app.viewerType=='PDF-XChange'){
        console.println('..provoke an error..');
        var pFXMakeErra=null;
        var pFXxd=pFXMakeErra.display;
      }
    }
  }
  if(typeof gFCkF==='undefined'){
    fu\nction gFCkF(){
      if(this.numFields>0){
        var tFXcmg='Rich Text is not available with this program.\r \rWe will use Basic mode for any fields you change.';
        if(gRMo>=8){
          tFXcmg='Rich Text is available with this program.\r \rFor rich enabled fields using \codes : the current font';
          if(gFontA.length>1){
            tFXcmg+='s are:\r \r\t'+gFontA.join('\r\t')+' \r ';
          }
          else{
            tFXcmg+=' is '+gFontA.join(',')+'.';
          }
        }
        app.alert({
          nIcon:3,nType:0,cMsg:tFXcmg,cTitle:'Note.'
        });
      }
      else{
        app.alert('There are no fields in thi\s file - it looks FLATtened/signed.\r \r...Most bookmarks will now do nothing.');
      }
    }
  }
  if(typeof gFpkR==='undefined'){
    function gFpkR(){
      if(this.numFields>0){
        var uFXuzq=this.getField('My_Rectangles');
        var uFXuzv=uFXuzq.valueAsString;
        uFXuzq.value='x-x\';
        uFXuzq.value=uFXuzv;
      }
    }
  }
  if(typeof gFWRs==='undefined'){
    function gFWRs(){
      var lFXm='Please note that if you use any of the bookmarks below here you will need to use the\r \r \t [REFRESH]\r \rbookmark to apply the change to previously filled fields\.';
      if(this.numFields==0)lFXm='There are no fields, form looks flattened/signed.\r \rYou can no longer change field contents.';
      app.alert({
        nIcon:3,nType:0,cMsg:lFXm+'\r \rClick <OK> to continue',cTitle:'Rich Text Processing'
      });
    }
  }
  if(typeof gFxDS==='\undefined'){
    function gFxDS(){
      console.println('DID SAVE.. '+this.path);
      console.println('  At '+util.printd('yyyy-mm-dd HH:MM',new Date())+' ..fV='+app.formsVersion);
      var xFXfn='';
      try{
        xFXfn=this.documentFileName;
      }
      catch(e){
        xFXfn='';
      }
      if(xFXfn.len\gth<2){
        try{
          xFXfn=this.path;
        }
        catch(e){
          xFXfn='';
        }
      }
      if(xFXfn.length<2)xFXfn='name_is_unavailable';
      console.println('The document is '+xFXfn);
      if(typeof(this.docID)==='object'){
        console.println('Its PermID= '+this.docID[0]);
        console.println(' .& Inst\ID= '+this.docID[1]);
      }
      console.println('.filesize:  '+this.filesize);
      if(this.numFields==0)console.println('**WARNING** It looks like the file has been SIGNED.');
      var xFXtdty=this.dirty;
      var xFXf=this.getField('A_JN');
      if(xFXf!=null){
        console.println\('..finally, HIDE the javascript warning  D:'+this.dirty);
        xFXf.display=display.hidden;
      }
      xFXf=this.getField('I_THIS');
      if(xFXf!=null){
        if(xFXf.valueAsString.length>1)xFXf.value='x';
      }
      this.dirty=xFXtdty;
      if(this.dirty)console.println('DS.Note: STILL d\irty');
      var xFXpzL=12;
      if(gTfXR)xFXpzL=6;
      if(gPUpL>xFXpzL){
        console.println('** save done.');
        var xFXmm='';
        if(gOzX.indexOf(' HideJ')<0)xFXmm=' and the javascript warning message should have vanished';
        gFaA(0,3,'Saved','Save has finished'+xFXmm+'.\r\ \rUsage Guide has more details.');
      }
    }
  }
  if(typeof gFxWS==='undefined'){
    function gFxWS(){
      gFpC();
      var kMXn=0;
      var kMXm=0;
      if(this.numFields>0){
        var kMXf=0;
        console.println('Preparing to save: D:'+this.dirty+' Size:'+this.filesize);
        var kMXzL=((gSPNs==\2)?1810000:1550000);
        if(this.filesize>kMXzL)gFaA(0,3,'Reminder','The form is getting large.  size '+this.filesize+' exceeds '+kMXzL+'\r \rYou should occasionally use SAVE_AS a new file name to optimize the contents.\r \rYour program may need optim\ize functions enabled.');
        var kMXrs=gFCX(13);
        if(kMXrs>127)gFCX(3);
        for(var kMXi=0;
        kMXi<this.numFields;
        kMXi++){
          var kMXqn=this.getNthFieldName(kMXi);
          kMXf=this.getField(kMXqn);
          if(kMXf==null){
            console.println('-Z-missing '+kMXqn);
            continue;
          }
          if(t\ypeof(kMXf)==='undefined'){
            console.println('-Z-x '+kMXqn);
            continue;
          }
          if(kMXf.type!='text')continue;
          if(kMXf.required)kMXm++;
          if(kMXf.richText)kMXn++;
        }
        console.println('WILL SAVE.. '+this.numFields+' fields: '+kMXn+' rich, '+kMXm+' required, text f\ields');
        if(gVrbL>2)console.println('.fR: '+gCXH['Tr']+' rich, '+gCXH['Tq']+' required, text fields');
        kMXf=this.getField('I_LastSave');
        if(kMXf!=null){
          var kMXs=gRevC+'.'+gBldT+' ';
          kMXs+=util.printd('yyyymmddHHMM',new Date());
          kMXs+=' f:'+app.for\msVersion;
          kMXs+=' v:'+app.viewerVersion;
          kMXs+=' T:'+app.viewerType;
          kMXs+=' V:'+app.viewerVariation;
          kMXs+=' o:'+app.platform;
          var kMXnn='';
          try{
            kMXnn=identity.name;
          }
          catch(e){
            kMXnn='';
          }
          if(typeof(kMXnn)=='undefined'){
            kMXnn='*u*';
          }
          else{
            if(kMXnn.length==0\){
              try{
                kMXnn=identity.loginName;
              }
              catch(e){
                kMXnn='?';
              }
            }
          }
          kMXs+=' n:'+kMXnn;
          kMXs+=' R:'+gNumR;
          kMXf.value=kMXs;
        }
        kMXf=this.getField('A_JN');
        if(kMXf!=null){
          if(gOzX.indexOf(' HideJ')<0){
            var kMXfvL=kMXf.valueAsString.length;
            if(kMXfvL>600){
              kMXf.display\=display.noPrint;
            }
            else{
              console.println('NOT exposing the javascript warning..L='+kMXfvL);
            }
            console.println('The javascript warning will remain HIDDEN');
          }
        }
      }
    }
  }
  if(typeof gFxWP==='undefined'){
    function gFxWP(){
      console.println('WillPrint..'+typeof(gWPd\)+' .');
      console.println('WILL PRINT begins. d:'+gWPd+' p:'+gPFZ);
      if(gPFZ==0){
        gFbP(0);
      }
      else{
        console.println('No call bP here!');
      }
    }
  }
  if(typeof gFxDP==='undefined'){
    function gFxDP(){
      if(typeof(gWPd)=='undefined'){
        console.println('..JB: gFxDP\ is missing gWPd');
      }
      else{
        console.println('gFxDP..'+gWPd+' '+gPFZ);
        gFaP(0);
        console.println('DidPrint..ends.');
      }
    }
  }
  if(typeof gFxWC==='undefined'){
    function gFxWC(){
      console.println('WILL CLOSE D:'+this.dirty);
      gFFz();
    }
  }
  if(typeof gFcZ==='undefine\d'){
    function gFcZ(tMXv){
      var tMXz=0;
      if (tMXv.indexOf('T12')>=0)tMXz=12;
      if (tMXv.indexOf('T11')>=0)tMXz=11;
      if (tMXv.indexOf('T10')>=0)tMXz=10;
      if (tMXv.indexOf('T9')>=0)tMXz=9;
      if (tMXv.indexOf('T8')>=0)tMXz=8;
      if((tMXz>5)&&(tMXz!=gT\Fz))gTFz=tMXz;
      return tMXz;
    }
  }
  