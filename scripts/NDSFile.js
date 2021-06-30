class NDSFile{
    constructor(file,updatesCallback){
        var context=this;
        this.file=file;
        this.finalFileName=file.name;
        console.log("FILE!",file);
        this.name=file.name;
        this.updatesCallback=updatesCallback;
        this.iconData=null;
        this.colores=null;
        this.loadGamePath(file);

        this.getCardMode().then(function(cardMode){
            context.cardMode=cardMode;
            console.log("CARD MODE",cardMode);
        });
        
        if(LocalStoreQuery.get("autoRandomTid")=="true"){
            
            this.overrideTid=MiscUtils.getRandomTid();
           
            console.log("RANDOM!",this.overrideTid);
            // this.tid=this.overrideTid;

         //   console.log("TID!",this.tid,this.overrideTid);
        }

        
        
            this.getTIDString().then(function(tidString){
                context.tid=tidString;
                if(!context.overrideTid){
                    context.overrideTid=context.tid;
                }
                context.notifyChanges();
            });


     
        
        

        this.getBytesFromFile(0x00,0x0B).then(function(result){
            console.log("HEADER",HexUtils.getWordFromHexOneByte(result));
        });
//        0x00,0x0B
        this.getEnglishNameLocation().then(function(res){
           // console.log("english name location",res);
            context.getBytesFromFile(res,res+0x100).then(function(gameTitleBytes){

           //     console.log("Bytes:",gameTitleBytes);  
           //     console.log("Name:",);
                var string=HexUtils.getWordFromHexTwoBytes(gameTitleBytes);
                var gameTitleArray=string.split("\n");

                var publisher=gameTitleArray[gameTitleArray.length-1];
                gameTitleArray.splice(gameTitleArray.length-1,1);
                var gameTitle=gameTitleArray.join(" ");

            //    console.log("Final name",publisher,gameTitle);
                context.name=gameTitle.trim().replace(/\u0000/g, '');
                context.publisher=publisher.trim().replace(/\u0000/g, '');

            //    console.log("sssss",context);
                context.notifyChanges();
            });
        });

      
        this.getFullGameTitleString().then(function(gameTitle){

            context.gameTitle=gameTitle;
            context.notifyChanges();
        });


        LocalStoreQuery.addFieldCallback("folderForGames",function(folder){
            context.loadGamePath(file);
            context.notifyChanges();
        });


        
        this.createCanvas();

    }
    loadGamePath(file){
        var gameFolder=LocalStoreQuery.get("folderForGames");
        if(!gameFolder){
            gameFolder="Games/NDS";
        }
        if(gameFolder.endsWith("/")){
            gameFolder=gameFolder.substring(0,gameFolder.length-1);
        }
        this.gamePath=gameFolder+"/"+file.name;
        
    }
    reloadTid(){
        
        this.overrideTid=MiscUtils.getRandomTid();
        this.notifyChanges();
    }
    getTID(){
        return this.getBytesFromFile(0x0C,0x10).then(function(tid){
            return tid;
        });
    }
    getTIDString(){
        return this.getTID().then(function(tid){
            return HexUtils.getWordFromHexOneByte(tid);
        });
    }
    getFullGameTitleString(){
        return this.getFullGameTitleBytes().then(function(tid){
            return HexUtils.getWordFromHexOneByte(tid).trim().replace(/\u0000/g, '');
        });
    }
    getFullGameTitleBytes(){
        var context=this;
        
            // console.log("english name location",res);
             return context.getBytesFromFile(0x0,0x0C).then(function(gameTitleBytes){
           //     console.log("smmas",gameTitleBytes.length);
                 return gameTitleBytes;
             });
             
    }
    getEnglishNameData(){
        var context=this;
        return this.getEnglishNameLocation().then(function(res){
            // console.log("english name location",res);
             return context.getBytesFromFile(res,res+0x100).then(function(gameTitleBytes){
 
                 return {bytes:gameTitleBytes,location:res};
             });
         });
    }
    kill(){
        this.killed=true;
        this.file=null;
        
    }
    notifyChanges(){
        if(this.killed){
            return;
        }
        if(this.updatesCallback)
        this.updatesCallback({name:this.name,publisher:this.publisher,canvasObject:this.canvasObject,tid:this.tid,gamePath:this.gamePath,gameTitle:this.gameTitle,overrideTid:this.overrideTid});
        
    }
    createCanvas(){
        var context=this;
        context.getIconData().then(function(iconData){

            context.getPaletteColors().then(function(paletteColors){
              //  console.log("DATA canvas",iconData,paletteColors);

                var canvas = document.createElement('canvas');
                canvas.style.width="66px";
                canvas.style.height="66px";
                
                canvas.width=32;
                canvas.height=32;
                var ctx = canvas.getContext('2d');
                ctx.createImageData(32,32);

                
                   
                            for(var i=0;i<32;i++){
                               for(var j=0;j<32;j++){
                                   
                                   //image.getPixelWriter().setArgb(i, j, base.getPixelReader().getArgb(i, j));
                                   //if(hair.getPixelReader().getArgb(i, j)){
                                   
                                         
                                   //int hairARGB=hair.getPixelReader().getArgb(i,j);
                                        var pixel = ctx.getImageData(i, j, 1, 1);
                                  //      console.log("PIXEL",pixel);
                                        var dataPixel = pixel.data;
                                     if(iconData[i][j]==0 || iconData[i][j]==null){
                                         
                                        dataPixel[0]=255;
                                        dataPixel[1]=255;
                                        dataPixel[2]=255;
                                        dataPixel[3]=0;
                                       ctx.putImageData(pixel,i,j);



                                    //     image.getPixelWriter().setColor(i, j,Color.TRANSPARENT);
                                         
                                    //    ctx.putImageData( id, x, y );     
                                     }
                                     else{
                                        var rgbaData=HexUtils.hexToRgbA(paletteColors[iconData[i][j]]);
                                        dataPixel[0]=rgbaData[0];
                                        dataPixel[1]=rgbaData[1];
                                        dataPixel[2]=rgbaData[2];
                                        dataPixel[3]=255;
                                        ctx.putImageData(pixel,i,j);
                                   //     console.log("data pixel",dataPixel);
                                      //   image.getPixelWriter().setColor(i, j,Color.web(palette.get(values[i][j])));
                                     }
                                      //System.out.println(Integer.toBinaryString(i));
                                      
                                     
                                     }  
                                      
                                          //image.getPixelWriter().setArgb(i,j,hairARGBimage.getPixelReader().getArgb(i, j));
                                      
                                   //}
                               }
                            
                               context.canvasObject=canvas;
                               context.notifyChanges();
                           // this.setImage(image);
                            
                           // this.setFitHeight(64);
                           // this.setFitWidth(64);
                            
                





            });
        });
    }
    getPaletteColors(){
        var context=this;
        return this.getPalleteBytes().then(function(bites){

            if(context.colores==null){
                context.colores=[];//Lista de Strings
                
                for(var i=0;i<32;i+=2){
                    var reversed=HexUtils.reverseArray(bites.slice(i,i+2));
                    
                    //var /*String*/  normalColor=Hex.getHexString(Arrays.copyOfRange(bites,i,i+2));
                    var normalColor=HexUtils.getHexString(reversed);
                    var bits=HexUtils.hex2bin(normalColor);
                    while(bits.length<16){
                        bits='0'+bits;
                    }
                    var r=parseInt(bits.substring(11,16),2);
                    var g=parseInt(bits.substring(6,11),2);
                    var b=parseInt(bits.substring(1,6),2);
        
                    var R = (r * 255) / 31;
        
                    var G = (g * 255) / 31;
                    var B = (b * 255) / 31;
                    var color=HexUtils.getHexString([R])+HexUtils.getHexString([G])+HexUtils.getHexString([B]);
                    context.colores.push("#"+color);
                }
            }
            return context.colores;

        });
        
    }
    getIconData(){//returns var /*int*/ [][]
        var context=this;
        return this.getIconBytes().then(function(bytes){
            if(context.iconData==null){
                context.iconData=[];//new var /*int*/ [32][32];
                for(var z=0;z<32;z++){
                    var arrMe=[];
//                    context.iconData.push([]);
                    for(var k=0;k<32;k++){
                        arrMe.push(0x0);
                    }
                    context.iconData.push(arrMe);
                }
                    var /*int*/  counter=0;
                    var /*int*/  vCounter=0;
                    var /*int[] */ v=[];//new var /*int*/ [1024];
                    for(var /*int*/  j=0;j<16;j++){
                        
                        for(var /*int*/  i=0;i<32;i++){
                            
                            var /*int*/  val=bytes[counter];
                            if(!val){
                                val=0x0;
                            }
                            if(val<0){
                                val=val & 0xff;
                            }
                            var /*String*/  bits=val.toString(2);
                            while(bits.length<8){
                                bits="0"+bits;
                            }
//                            console.log("bits",bits);
                            var /*int*/  val1=parseInt(bits.substring(0,4),2);
                            var /*int*/  val2=parseInt(bits.substring(4,8),2);
                            v[vCounter]=val2;
                            v[vCounter+1]=val1;
                           // v.push(val2);
                           // v.push(val1);
                            vCounter+=2;
                            counter++;
                        }
                    }
//                    console.log("VVVV",v);
                    var /*int*/  contador=0;
                    for(var /*int*/  tile=0;tile<16;tile++){
                        for(var /*int*/  i=0;i<64;i++){
                            
                            var /*int*/  posI=((i)%8)+((tile%4)*8);
                            var /*int*/  posJ=context.getPosJ(tile,i);
                           // console.log("v",v);
                            context.iconData[posI][posJ]=v[contador];
                            if(posI==30){
                            //console.log("valores["+posI+","+posJ+"]="+v[contador]);
                            }
                            contador++;
                            //console.log(counter+"");
                            
                            
                        }
                        
                    }
                    
                
                
                }
        
                return context.iconData;

        });
        
    }

    getPosJ( tile,i){ //returns int
        var /*int*/  posJ=Math.floor(Number(i)/8);
        if(tile<4){
            posJ+=0;
        }
        else if(tile<8){
            posJ+=8;
        }
        else if(tile<12){
            posJ+=16;
        }
        else if(tile<16){
            posJ+=24;
        }
        return posJ;
    }


    getIconBytes(){
        
        var context=this;
        return this.getIconDataLocation().then(function(iconLocation){
            return context.getBytesFromFile(iconLocation,iconLocation+0x200)
            
        });
    }
    getPalleteBytes(){
        
       
        var context=this;
        return this.getPalleteLocation().then(function(location){
            return context.getBytesFromFile(location,location+0x20)
            
        });
        
    }
    getPalleteLocation(){
        return this.getBannerLocation().then(function(bannerLocation){
            return bannerLocation+0x220;
        });
    }
    getIconDataLocation(){
        return this.getBannerLocation().then(function(bannerLocation){
            return bannerLocation+0x20;
        });
    }
    getBannerLocation(){
        return this.getBytesFromFile(0x68,0x68+0x04).then(function(result){
            return HexUtils.getHexNumber(HexUtils.reverseArray(result));

        });
    }
    getEnglishNameLocation(){
        return this.getBannerLocation().then(function(bannerLocation){
            return bannerLocation+0x340;
        });
    }

    getBytesFromFile(start,end){
        if(!this.file){
            return null;
        }
        var blob = this.file.slice(start, end);
        //end+0x01
        var reader = new FileReader();
        return new Promise(function(resolve, reject) {
            // on success
            try{
                reader.onload = function(result) {
                  //  console.log("RESULT",reader.result);
                    var fileByteArray = [];
                    var array = new Uint8Array(reader.result);
               for (var i = 0; i < array.length; i++) {
                   fileByteArray.push(array[i]);
                }
                    resolve(fileByteArray);
                }
                reader.readAsArrayBuffer(blob);
      
            }
            catch(err){
    
            // on failure
            reject(err);
            }
            
          });

       
    }
    getCardMode(){//returns int
        return this.getBytesFromFile(0x12,0x13).then(function(arr){
            var b=arr[0];
            if(b==0){
                return HexUtils.NTR;
            }
            else if(b==2 || b==3){
                return HexUtils.TWL;
            }
            return 0;

        });
        
    }

    getBannerIconBytes(){
        var context=this;
        return this.getBannerLocation().then(function(location){
            if(context.cardMode==HexUtils.NTR){
                console.log("IS NTR!",context.name);
                return context.getBytesFromFile(location,location+0x840);
            }
            else if(context.cardMode==HexUtils.TWL){
                console.log("IS TWL!",context.name);
                return context.getBytesFromFile(location,location+0x23C0);

            }
            else return null;
        });
        
      
        
    }
    getImportedBanner(){
        return null;
      }
      writeBanner(templateBytes,card){
          var /*int*/  start=0;
          /*if(cardType==CardType.DSTT_R4i_SHDC){
              start=0x11000;
          }
          else if(cardType==CardType.R4_ORIGINAL){
              start= 0x5F800;
          }
          else if(cardType==CardType.R4IDSN){
              start= 0x5FC00;
          }
          else if(cardType==CardType.ACEKARD_RPG){
              start=0x65400;
          }
          */
          start=Number(card.banner_location);
          if(this.getImportedBanner()==null){


            return this.getBannerIconBytes().then(function(banner){



       //   var banner=this.getBannerIconBytes(); //byte[]
          var /*int*/  counter=0;
          
          
          //while(counter<banner.length){
          if(false)//banner.length==0x840)
          {
              var /*int*/  startInit=start;
               while(counter<0x23C0){
                  templateBytes[startInit]=banner[counter];
                  if(templateBytes[startInit]==null || isNaN(Number(templateBytes[startInit]))){
                      templateBytes[startInit]=0;


                  }

                  counter++;
                  startInit++;
              }
               startInit=start+0x840;
              var /*byte[]*/  japaneseName=banner.slice(0x240, 0x240+0x100);
             for(var /*int*/  i=0;i<japaneseName.length;i++){
                 
                
                  templateBytes[startInit]=japaneseName[i];
                  
                  if(templateBytes[startInit]==null || isNaN(Number(templateBytes[startInit]))){
                    templateBytes[startInit]=0;
                  }
                 startInit++;
             }
             for(var /*int*/  i=0;i<japaneseName.length;i++){
                 
                  templateBytes[startInit]=japaneseName[i];
                  if(templateBytes[startInit]==null || isNaN(Number(templateBytes[startInit]))){
                    templateBytes[startInit]=0;
                  }
                 startInit++;
             }
             
              var /*byte[]*/  startByte=[0x03,0x01];
              templateBytes[start]=startByte[0];
              templateBytes[start+1]=startByte[1];
              var /*int*/  tileStart=start+0x1240;
              var /*int*/  bannerCounter=0;
              while(bannerCounter<8){
                  for (var /*int*/  i=0x20;i<0x220;i++){
                      templateBytes[tileStart]=banner[i];
                      tileStart++;
                  }
                  bannerCounter++;
              }
              var /*int*/  palleteStart=start+0x2240;
              var /*int*/  paletteCounter=0;
              while(paletteCounter<8){
              for (var /*int*/  i=0x220;i<0x240;i++){
                  templateBytes[palleteStart]=banner[i];
                  palleteStart++;
              }
              paletteCounter++;
              }
              var /*byte[]*/  endByte=[0x01,0x00,0x00,0x01];
              templateBytes[start+0x2340]=endByte[0];
              templateBytes[start+0x2341]=endByte[1];
              templateBytes[start+0x2342]=endByte[2];
              templateBytes[start+0x2343]=endByte[3];
              
              
              var /*byte[]*/  firstCRC=HexUtils.getCRCFlippedPairBytes(HexUtils.getCRC16((templateBytes.slice(start+0x20, start+0x83F+0x01))));
              //var /*byte[]*/  ra=Arrays.copyOfRange(this.templateBytes,0x20,0x83F+0x01);
           
              var /*byte[]*/  secondCRC=HexUtils.getCRCFlippedPairBytes(HexUtils.getCRC16((templateBytes.slice(start+0x20, start+0x93F+0x01))));
              var /*byte[]*/  thirdCRC=HexUtils.getCRCFlippedPairBytes(HexUtils.getCRC16(templateBytes.slice(start+0x20, start+0xA3F+0x01)));
              var /*byte[]*/  fourthCRC=HexUtils.getCRCFlippedPairBytes(HexUtils.getCRC16((templateBytes.slice(start+0x1240, start+0x23BF+0x01))));
              console.log(HexUtils.getCRC16((templateBytes.slice(0x1240, 0x23BF)))+" CRC");
              //Hex.arrayCopy(firstCRC, 0, this.templateBytes, start+0x02, 2);
              HexUtils.arrayCopy(secondCRC, 0, templateBytes, start+0x04, 2);
              HexUtils.arrayCopy(thirdCRC, 0, templateBytes, start+0x06, 2);
              HexUtils.arrayCopy(fourthCRC, 0, templateBytes, start+0x08, 2);
              
          }
          else{
              while(counter<0x23C0){
                  
                  templateBytes[start]=banner[counter];
                  if(templateBytes[start]==null || isNaN(Number(templateBytes[start]))){
                    templateBytes[start]=0;
                  }
                  counter++;
                  start++;
              }
          }
          
        //  return "Finished write banner!";


        });//END BANNER ICON BYTES





          
          }
          else{
              var /*int*/  counter=0;
              
               while(counter<0x23C0){
                  try{
                  this.templateBytes[start]=this.getImportedBanner()[counter];
                  console.log("Byte "+counter+": "+this.getImportedBanner()[counter]);
                  }
                  catch(ex){
                      this.templateBytes[start]=0;
                  }
                  counter++;
                  start++;
              }
          }
          return this.templateBytes;
      
      }



      writeGamePath(templateBytes,/*int*/  offset,/*int*/  length){
         
                 
                 
        
    var /*byte[]*/  gamePath=HexUtils.getBytesFromWord(this.gamePath);
    var /*int*/  counter=0;    
    var /*int*/  i=offset;
    while(counter<length){
        
        
        //if(i>=0x22DE7 && i<=0x22EE8){
    
        
            if(gamePath[counter]){

                templateBytes[i]=gamePath[counter];
            }
            else{
                templateBytes[i]=0;

            }

            counter++;
            i++;
            
        }
       
       
        //}
        
   
    }   






}