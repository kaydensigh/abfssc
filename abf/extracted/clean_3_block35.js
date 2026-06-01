if(typeof gFsV==='undefined') {
  function gFsV(mJXf,mJXv) {
    if(this.numFields>0) {
      var mJXn=mJXf;
      switch(mJXn) {
        case '*C':mJXn='My_Colours';
        break;
        case '*D':mJXn='My_DateFormat';
        break;
        case '*F':mJXn='My_FillColours';
        break;
        case '*I':mJXn='I_Format';
        break;
        case '*O':mJXn='My_Font';
        break;
        case '*X':mJXn='My_CheckBoxValues';
        break;
        case '*Z':mJXn='My_Codes';
        break;
      }
      var mJXf=this.getField(mJXn);
      if(mJXf!==null) {
        mJXf.value=mJXv;
      }
    }
  }
}
if(typeof gFnK==='undefined') {
  function gFnK(sJXRoL) {
    var sJXi=0;
    for(var sJXj in sJXRoL) {
      sJXi++;
    }
    return sJXi;
  }
}
if(typeof gFrC==='undefined') {
  function gFrC() {
    gCdH['(']='!^(';
    gCdH[')']=')!^';
    gCdH['+']='!^+!^';
    gCdH['-']='!^!U+2013; !^';
    gCdH['.']='!U+2026;   ';
    gCdH['1']='1!^st!^';
    gCdH['2']='2!^nd!^';
    gCdH['3']='3!^rd!^';
    gCdH['4']='4!^th!^';
    gCdH['5']='5!^th!^';
    gCdH['@']='Â½';
    gCdH['[']='!^[';
    gCdH[']']=']!^';
    gCdH['_']='!U+2013; ';
    gCdH['a']='!U+03B1;';
    gCdH['b']='!U+03B2;';
    gCdH['c']='!U+03B3;';
    gCdH['d']='!U+03B4;';
    gCdH['e']='!U+03B5;';
  }
}
if(typeof gMFiL==='undefined') {
  function gMFiL(wJXopt) {
    console.println(' ');
    var wJXdt='';
    if(wJXopt.indexOf('--')<0)wJXdt=' ('+wJXopt+')';
    console.println('MakeFDFinLOG:'+wJXdt);
    console.println(' ');
    var wJXnU=wJXopt.indexOf('_-U_');
    if(wJXnU<0) {
      console.println('Encode any unicode characters.');
      gFUp(0);
    }
    else {
      console.println('Encoding unicode was skipped.');
    }
    if(wJXopt.indexOf('*_XFS_')>0) {
      var wJXa='**exportAsFDFStr is not available**';
      if(typeof(this.exportAsFDFStr)=='function') {
        var wJXz=0;
        for(var wJXii=0;
        wJXii<this.numFields;
        wJXii++) {
          var wJXtfn=this.getNthFieldName(wJXii);
          var wJXtf=this.getField(wJXtfn);
          if(wJXtf==null)continue;
          if(wJXtf.type!=='text')continue;
          var wJXtv=wJXtf.valueAsString;
          if(wJXtv.length>2000) {
            wJXz++;
            console.println('XFS_skip '+wJXtfn);
            break;
          }
        }
        var wJXcFDF='?';
        if(wJXz==0) {
          try {
            wJXcFDF=this.exportAsFDFStr( {
              bAllFields:1,bFlags:1
            });
          }
          catch(e) {
            console.println('**>>?xfs? '+e.message);
            wJXcFDF='   exportAsFDFStr1  FAILED';
          }
        }
        else {
          console.println('..XFS..do a sample set:');
          var wJXwf='A_HELP,A_JN,BasicSystem,Classification,Compete1NT_1,DefenceStrongC_2,I_LastSave,IsBlackwood,My_CheckBoxValues,My_Rectangles,Open1C,Resp1C_1H,Resp1C._1D,Resp1C._1S,SeqLead_S';
          console.println(wJXwf);
          console.println(' ');
          try {
            wJXcFDF=this.exportAsFDFStr( {
              aFields:['A_HELP','A_JN','BasicSystem','Classification','Compete1NT_1','DefenceStrongC_2','I_LastSave','IsBlackwood','My_CheckBoxValues','My_Rectangles','Open1C','Resp1C_1H','Resp1C._1D','Resp1C._1S','SeqLead_S'],bFlags:1
            });
          }
          catch(e) {
            console.println('**>>?XFS? '+e.message);
            wJXcFDF='   exportAsFDFStr2  FAILED';
          }
        }
        wJXa=wJXcFDF.replace('Fields[<<','Fields[\r<<');
        wJXa=wJXa.replace('>>]','>>\r]');
        wJXa=wJXa.replace(/>><</g,'>>\r<<');
        wJXa=wJXa.replace(/Kids\[<</g,'Kids[\r<<');
        wJXcFDF=' ';
      }
      console.println(' ');
      console.println(wJXa);
      console.println(' ');
      wJXa=' ';
    }
    else if(wJXopt.indexOf('*_FiL')>0) {
      var wJXqq=wJXopt.indexOf('_incAll_');
      var wJXqo=wJXopt.indexOf('_AllOld_');
      var wJXqg=wJXopt.indexOf('_incPlg_');
      var wJXns=wJXopt.indexOf('_NoSort_');
      var wJXsD=wJXopt.indexOf('_ShowDV_');
      var wJXmD=wJXopt.indexOf('_MatchDV_');
      var wJXxD=wJXopt.indexOf('_SkipDV_');
      var wJXL='';
      var wJXpx='';
      var wJXuu='';
      var wJXv='';
      var wJXd='';
      wJXdt='';
      var wJXnSk=0;
      var wJXnOS=0;
      var wJXAA=[];
      var wJXnF=this.numFields;
      for(var wJXi=0;
      wJXi<wJXnF;
      wJXi++) {
        var wJXfn=this.getNthFieldName(wJXi);
        var wJXtu=gFHash[wJXfn];
        var wJXtk='T|>vwKoS'.indexOf(wJXtu);
        var wJXf=this.getField(wJXfn);
        if(wJXf==null)continue;
        wJXL='';
        wJXpx='';
        wJXuu='';
        try {
          wJXd=wJXf.defaultValue;
        }
        catch(e) {
          console.println('**>>?fDv? '+e.message);
          wJXd='';
        }
        wJXv=wJXf.valueAsString;
        if(wJXxD>0) {
          if(wJXv==wJXd) {
            wJXnSk++;
            continue;
          }
        }
        else if(wJXmD>0) {
          if(wJXv==wJXd)wJXv+='*dV:';
        }
        else if(wJXsD>0) {
          wJXv=wJXd;
        }
        wJXuu+=wJXtu+' '+wJXtk+' '+wJXf.type+' '+wJXi+' '+wJXv.length+' ';
        wJXdt='  ';
        if(wJXtk<0) {
          wJXpx='_z_';
          wJXdt='';
        }
        else if(wJXtk===6) {
          wJXdt=' ';
          if(wJXqo<0) {
            if(wJXv.length<2) {
              wJXnOS++;
              wJXpx='_o_';
            }
          }
        }
        else if(wJXtk===7) {
          wJXdt='';
          if(wJXv.length>1000) {
            wJXpx='_w_';
          }
          else if(wJXfn.substr(0,2)=='My') {
            wJXdt='    ';
          }
          else if(wJXfn.substr(0,2)=='T_') {
            wJXpx='_t_';
          }
          else if(wJXfn.substr(0,2)=='H_') {
            wJXpx='_h_';
          }
          else if(wJXfn.substr(0,2)=='A_') {
            wJXpx='_a_';
          }
          else if(wJXfn.substr(0,4)=='I_La') {
            wJXdt='   ';
          }
          else if(wJXfn.substr(0,2)=='I_') {
            wJXpx='_i_';
          }
          else {
            wJXpx='_S_';
          }
        }
        else {
          if(wJXfn.substr(0,6)=='Player')wJXdt='   ';
        }
        if(wJXqq<0) {
          if(wJXpx.length>0)continue;
        }
        if(wJXv.length>1000) {
          wJXuu+='very long field value omitted ';
        }
        else {
          wJXv=wJXv.replace(/\\/g,'\\\\');
          wJXv=wJXv.replace(/\(/g,'\\(');
          wJXv=wJXv.replace(/\)/g,'\\)');
          wJXv=wJXv.replace(/\r\n/g,'<<R>>');
          wJXv=wJXv.replace(/\r/g,'<R>');
          wJXv=wJXv.replace(/\n/g,'<N>');
          wJXv=wJXv.replace(/\t/g,'<T>');
          wJXL+='/V('+wJXv+')';
        }
        if(wJXqg>0) {
          if(wJXuu.length>0)wJXL='/TU('+wJXuu+')	'+wJXL;
        }
        wJXAA.push(wJXdt+'/T ('+wJXpx+wJXfn+')	'+wJXL);
      }
      console.println('===============================');
      console.println('%FDF-1.2');
      console.println('1 0 obj');
      console.println('<</FDF<</Fields[');
      console.println('<< /T (aaNote_00)	/V(Parameter: '+wJXopt+')	>>');
      if(wJXnU>=0)console.println('<< /T (aaNote_nU)	/V( unicode encodng was inhibited )	>>');
      var wJXdvM='';
      if(wJXxD>0) {
        wJXdvM='SKIP if match';
      }
      else if(wJXsD>0) {
        wJXdvM='show only';
      }
      else if(wJXmD>0) {
        wJXdvM='flag if match';
      }
      if(wJXdvM.length>0)console.println('<< /T (aaNote_dV)	/V(   '+wJXdvM+' default value)	>>');
      if(wJXnSk>0)console.println('<< /T (aaNote_nS)	/V(   '+wJXnSk+' fields with default value were omitted )	>>');
      if(wJXnOS>0)console.println('<< /T (aaNote_nO)	/V(   '+wJXnOS+' empty old fields were omitted )	>>');
      if(wJXns<0) {
        wJXAA.sort();
      }
      else {
        console.println('<< /T (aaNote_Zs)	/V(   Fields were not sorted )	>>');
      }
      while(wJXAA.length > 0) {
        console.println('<<'+wJXAA.shift()+'	>>');
      }
      console.println(']>>/Type/Catalog>>');
      console.println('endobj');
      console.println('trailer');
      console.println('<</Root 1 0 R>>');
      console.println('%%EOF');
      console.println('===============================');
    }
    console.println(' ');
  }
}
if(typeof gFFF==='undefined') {
  function gFFF() {
    console.println(' ');
    console.println('FFF: start');
    var mKXn=0;
    var mKXfH= {
    };
    for(var mKXi=0;
    mKXi<this.numFields;
    mKXi++) {
      var mKXfn=this.getNthFieldName(mKXi);
      var mKXtu=gFHash[mKXfn];
      var mKXtk='T|>RL'.indexOf(mKXtu);
      if(mKXtk<0)continue;
      if(mKXtk>2)continue;
      var mKXf=this.getField(mKXfn);
      if(mKXf==null)continue;
      if(mKXf.type!=='text')continue;
      var mKXv=mKXf.valueAsString;
      if(mKXv.length==0)continue;
      if(mKXv==='^ ')continue;
      mKXfH[mKXfn]=mKXv;
      mKXf.value='!2 TemP';
      mKXn++;
    }
    console.println('FFF: found '+mKXn);
    gFaA(0,2,'...pause...','We have '+mKXn+' field values to restore.');
    if(mKXn>0) {
      for(var mKXxn in mKXfH) {
        var mKXxf=this.getField(mKXxn);
        mKXxf.value=mKXfH[mKXxn];
      }
      mKXfH= {
      };
      gFaA(0,2,'...done...','Fields have been refreshed.');
    }
    console.println('FFF: end');
    console.println(' ');
  }
}
if(typeof gFFc==='undefined') {
  function gFFc(sKXv) {
    var sKXa=sKXv.indexOf('*DF:')+4;
    if(sKXa>4) {
      if(sKXa+2<sKXv.length) {
        var sKXjkc=sKXv.substr(sKXa,1);
        var sKXjki='0123456789BPWTXxbygupo'.indexOf(sKXjkc);
        if(sKXjki>=0) {
          var sKXfm='Change default fill index '+gCfX+' >> '+sKXjki+' for '+sKXjkc;
          if(gVrbL>2)sKXfm+=' in :0123456789BPWTXxbygupo:';
          console.println(sKXfm);
          gCfX=sKXjki;
        }
      }
    }
    var sKXjjx=0;
    var sKXjjc='0123456789';
    for(sKXjzj=0;
    sKXjzj<sKXjjc.length;
    sKXjzj++) {
      var sKXaab='F'+sKXjjc[sKXjzj]+':';
      var sKXaax=sKXjzj+sKXjjx;
      var sKXxcit=sKXv.indexOf(sKXaab)+3;
      if(sKXxcit>3) {
        var sKXxcip=sKXv.substr(sKXxcit);
        var sKXxciz=sKXxcip.indexOf(' ');
        var sKXxctaa=sKXxcip.substr(0,sKXxciz);
        var sKXtctA=sKXxctaa.split(',');
        if(sKXtctA.length==3) {
          var sKXk=0;
          do {
            if(isNaN(sKXtctA[sKXk])) {
              sKXk=9;
              break;
            }
            if(sKXtctA[sKXk]>1.0) {
              sKXk=12;
              break;
            }
            if(sKXtctA[sKXk]<0) {
              sKXk=15;
              break;
            }
            sKXk++;
          }
          while(sKXk<3);
          if(sKXk<5) {
            gFilA[sKXaax][0]='RGB';
            gFilA[sKXaax][1]=parseFloat(sKXtctA[0]);
            gFilA[sKXaax][2]=parseFloat(sKXtctA[1]);
            gFilA[sKXaax][3]=parseFloat(sKXtctA[2]);
          }
        }
        else {
          if(sKXxctaa.length==1) {
            sKXxfc='BPWTXxbygupo'.indexOf(sKXxctaa);
            if(sKXxfc>=0) {
              sKXxfc+=10;
              gFilA[sKXaax]=gFilA[sKXxfc].slice(0);
              if(gVrbL>0)console.println('USE...['+sKXxfc+'] for '+sKXxctaa+' = ['+gFilA[sKXaax]+']');
            }
          }
        }
      }
    }
  }
}