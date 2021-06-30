/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import './game-item.js';
import { ElectronMixin } from './mixins/electron-mixin.js';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-fab/paper-fab';
class GameList extends ElectronMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
        [bordered]{
          border: 6px dashed var(--paper-grey-400);
        }
      </style>

        <div style="min-height: calc(100vh - 200px);" bordered$="[[!ndsFiles.length]]" id="dropZone">

        <template is="dom-if" if="[[!ndsFiles.length]]">
          <div style="display: flex; align-items: center; justify-content: center; padding: 24px; min-height: calc(100vh - 200px - 48px);">
          <div style="text-align: center;">
            <div style="font-size: 24px; color: var(--paper-grey-500); font-weight: 600;">You haven't added any file yet. </div>
          
             <div style="font-size: 15px; color: var(--paper-grey-500);"> Drag and drop them here or click on the folder icon button in the top right corner.</div>
        
        </div>
          </div>
        </template>

      <template is="dom-repeat" items="[[ndsFiles]]" as="nds" restamp>

      <game-item data="[[nds]]" on-delete-clicked="removeGame"></game-item>

      </template>
        <template is="dom-if" if="[[ndsFiles.length]]">
      <div style="position: sticky; bottom: 24px; right: 24px; display: flex; align-items: center; justify-content: flex-end;">
      <paper-fab on-click="downloadAllTemplates" disabled$="[[saving]]" icon="file-download" ></paper-fab>
      </div>
      </template>
      </div>
    `;
  }
  zipForwarders(blobs){
    var zip = new JSZip();
  //  var photoZip = zip.folder("fotos");

              
              for(var i=0;i<blobs.length;i++){
                zip.file(blobs[i].name,blobs[i]);
              }
              var context=this;
              
              return zip.generateAsync({type:"blob"})
              .then(function (blobZip) {
                  saveAs(blobZip, "forwarders_"+(new Date().getTime())+".zip");
                  context.set("saving",false);
                  
                  MiscUtils.Toast.show("CIA forwarders generated successfully!");
              });
//                                    saveAs(blob2, "skus.xlsx");
    
  }
  downloadTest(fileArray,fileName){
    //console.log("CALLING ENDPOINT!");
    var context=this;

    return new Promise(function(resolve,reject){
      var req = new XMLHttpRequest();
      req.open('POST', 'https://us-central1-forwarder3ds.cloudfunctions.net/execMakeCia', true);
      req.onreadystatechange = function (aEvt) {
        if (req.readyState == 4) {
           if(req.status == 200){
  
              //console.log("STATUS OK!");
              var json=JSON.parse(req.responseText);
              //console.log("JSON OK!",json);
              var blob=context.testData(json.data,"forwarder-"+json.fileName.substring(0,json.fileName.length-4)+"_"+(new Date().getTime())+".cia");
              resolve({blob:blob,success:true});
           }
           else{
             console.error("STATUS ERROR!",req.status,req.responseText);
             resolve({success:false,status:req.status,response:req.responseText});

           }
        }
      };
      req.send(JSON.stringify({fileArray:fileArray,fileName:fileName}));  
    });
    
  }
  testData(data,fileName){
    let bytes = new Uint8Array(data.length);

for (let i = 0; i < bytes.length; i++) {
    bytes[i] = data[i];
}
let blob = new Blob([bytes], { type: 'application/octet-stream' });
blob.lastModifiedDate = new Date();
blob.name = fileName;

return  blob;
//saveAs(blob,fileName);


  }

  removeGame(e){
    var ndsFile=e.detail.ndsFile;
    this.splice("ndsFiles",this.ndsFiles.indexOf(ndsFile),1);
    MiscUtils.Toast.show("File removed successfully");
  }
  pushFiles(files){
    if(!this.ndsFiles){
      this.set("ndsFiles",[]);
    }
    for(var i=0;i<files.length;i++){
//      var ndsFile=new NDSFile(files[i],function());
      this.push("ndsFiles",{file:files[i]});
    }
  }
  findCardSetup(targetId){
    for(var i=0;i<this.cardList.length;i++){
      var card=this.cardList[i];
      if(card!=null && card.id==targetId){
        return card;
      }
    }
    return null;
  }
  downloadAllTemplates(){
    var targetId=LocalStoreQuery.get("selectedTarget");
    if(!targetId){
      MiscUtils.Toast.show("Select a target in the drawer menu");
      return;
    }



    var templates=this.shadowRoot.querySelectorAll("game-item");
    var arr=[];
    for(var i=0;i<templates.length;i++){
      arr.push(this.downloadTemplate(templates[i]));
    }
    if(!arr.length){
      MiscUtils.Toast.show("There aren't files in the list");
      return;
    
    }
    var context=this;
    
    MiscUtils.Toast.show("Generating forwarder CIAs...",0);
    this.set("saving",true);
    return Promise.all(arr).then(function(res){
      console.log("ALL CONVERTED!",res);
      var blobs=[];
      for(var i=0;i<res.length;i++){
        var r=res[i];
        if(r!=null && r.success==true && r.blob!=null){
          blobs.push(r.blob);
        }
      }
      if(blobs.length==1){
        saveAs(blobs[0],blobs[0].name);
        context.set("saving",false);
        MiscUtils.Toast.show("CIA forwarder generated successfully!");
      }
      else{
        return context.zipForwarders(blobs);

      }
      

    }).catch(function(err){
      MiscUtils.Toast.show("Something went wrong. Try again later");
      
      context.set("saving",false);
      console.error("Error converting!",err);
    });
  }
  downloadTemplate(template1){
    var context=this;
    var targetId=LocalStoreQuery.get("selectedTarget");
    if(!targetId){
      MiscUtils.Toast.show("Select a target in the drawer menu");
      return new Promise(function(resolve,reject){resolve();});
    }
    console.log("template1",template1);
    //var object=e.detail.nds;

    var ndsFile=template1.lastNdsFile;
    console.log("NDS FILE",ndsFile);
    var cardSetup=this.findCardSetup(targetId);

    console.log("card setup",cardSetup);
    console.log("banner loc",Number(cardSetup.banner_location));

    return HexUtils.downloadUrlAsByteArray("https://olmectron.github.io/forwarders/"+targetId+".nds",targetId).then(function(templateBytes){
        console.log("FORWARDER TEMPLATE!",templateBytes);
        return ndsFile.getBytesFromFile(0x0, 0x12).then(function(romHeader){
          console.log("ROM HEADER",romHeader);
          for(var i=0;i<romHeader.length;i++){
            templateBytes[i]=romHeader[i];
          }

          return ndsFile.getFullGameTitleBytes().then(function(gameTitle){
            console.log("GAME TITLE",gameTitle);
            for(var i=0;i<gameTitle.length;i++){
              templateBytes[i]=gameTitle[i];
            }


            var tidBytes=HexUtils.getBytesFromWord(ndsFile.overrideTid || ndsFile.tid);
            console.log("ndsFile tid",ndsFile.overrideTid , ndsFile.tid);
            console.log("TID BYTES!",tidBytes);


            //SET UP TID BYTES, both normal and reversed
            var c=0;
            for(var i=0xC;i<(0xC+0x4);i+=0x1){
                templateBytes[i]=tidBytes[c];
                c++;
            }
            
            var reverseTID=HexUtils.reverseArray(tidBytes);
            var counter=0;
            for(var i=0x230;i<(0x230+0x4);i+=0x1){
                templateBytes[i]=reverseTID[counter];
                counter++;
            }
       //     return templateBytes;

        //  HexUtils.getCRC16(templateBytes);          
            return ndsFile.writeBanner(templateBytes,cardSetup).then(function(resultMessage){
              console.log("WRITE BANNER",resultMessage);
              
              
                ndsFile.writeGamePath(templateBytes,Number(cardSetup.gamepath_location),Number(cardSetup.gamepath_length));
                  console.log("GAME PATH saved!");


                  return context.downloadTest(templateBytes,ndsFile.finalFileName);




                  


            });
//            context.writeBanner(templateBytes,cardSetup);


       













          });

        });

    });
  }
  ready(){
    super.ready();

    var context=this;
    setTimeout(function(){
      context.setupDropZone();
    },500);
    

  }
  setupDropZone(){
    var dropZone = this.shadowRoot.querySelector('#dropZone');
var context=this;
// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
dropZone.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files; // Array of all files

    for (var i=0, file; file=files[i]; i++) {
      console.log("FILEddd",file);
        if (file.name.endsWith(".nds") || file.name.endsWith(".dsi")) {
          console.log("IS NDS file!");
            context.pushFiles([file]);
/*            var reader = new FileReader();

            reader.onload = function(e2) {
                // finished reading file data.
                var img = document.createElement('img');
                img.src= e2.target.result;
                document.body.appendChild(img);
            }

            reader.readAsDataURL(file); // start reading the file data.
            */
        }
    }
});
  }
  static get properties(){
    return{
      saving:{
        type:Boolean,
        notify:true,
        value: false
      },
      cardList:{
        type:Array,
        notify:true
      },
      ndsFiles:{
        type:Array,
        notify:true,
        value:null
      },
      data:{
        type:Object,
        notify:true,
        value:{
          name:"Super Mario 64 DS",
          publisher: "Nintendo",
          tid: "AF12",
          type:"DS Standard",
          image:"../images/example.png"
        }
      }
    };
  }
}

window.customElements.define('game-list', GameList);
