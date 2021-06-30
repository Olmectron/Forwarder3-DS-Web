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
import { setPassiveTouchGestures, setRootPath } from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/iron-icons/iron-icons';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-button/paper-button';
import './my-icons.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import './controls/upload-button';
import '@polymer/paper-checkbox/paper-checkbox';
import { ElectronMixin } from './mixins/electron-mixin';
// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(MyAppGlobals.rootPath);

class MyApp extends ElectronMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          --app-primary-color: var(--paper-indigo-500);
          --app-secondary-color: black;

          display: block;
        }
        .drawer-checkbox{
          margin: 4px 16px;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        app-header {
          color: #fff;
          background-color: var(--app-primary-color);
        }

        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        .drawer-list {
          margin: 0 20px;
        }

        .drawer-list a {
          display: block;
          padding: 0 16px;
          text-decoration: none;
          color: var(--app-secondary-color);
          line-height: 40px;
        }

        .drawer-list a.iron-selected {
          color: black;
          font-weight: bold;
        }
      </style>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <app-drawer-layout fullbleed="" narrow="{{narrow}}">
        <!-- Drawer content -->
        <app-drawer id="drawer" align="end" opened="{{drawerOpened}}" style="text-align: left;" slot="drawer" swipe-open="[[narrow]]">
          <app-toolbar style="background-color: var(--paper-amber-400);">
          
          <div main-title>Settings</div>
          <!--<paper-icon-button icon="close" drawer-toggle></paper-icon-button>-->
          
          
          </app-toolbar>
          <!--<iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">-->

          <paper-dropdown-menu class="drawer-checkbox" label="Target">
          <paper-listbox slot="dropdown-content" style="cursor:pointer;" attr-for-selected="unique" selected="{{selectedTarget}}">
            <template is="dom-repeat" items="[[cardList]]" as="card" sort="_sortName">
            <paper-item on-click="setSelectedTarget" style="border-bottom: 1px solid var(--paper-grey-400);" unique="[[card.id]]">[[card.name]]</paper-item>
            </template>

          </paper-listbox>
          
          </paper-dropdown-menu>
        

          <paper-checkbox class="drawer-checkbox" on-click="saveCheckboxOption" name="autoRandomTid" checked="{{autoRandomTid}}">Auto-random TID</paper-checkbox>
          <template is="dom-if" if="[[isElectron]]">
          <paper-checkbox class="drawer-checkbox" on-click="saveCheckboxOption" name="keepNds" checked="{{keepNds}}">Keep forwarder NDS Files</paper-checkbox>
          <paper-checkbox class="drawer-checkbox" on-click="saveCheckboxOption" name="setRomPath" checked="{{setRomPath}}">Automatically set ROM path</paper-checkbox>
          </template>

          <div style="margin: 4px 16px; border: 1px solid var(--paper-grey-300); padding: 0px 8px;">
          <paper-input label="Folder for all games" value="{{folderForGames}}"></paper-input>
          <paper-button style="color: var(--paper-indigo-500); font-weight: 500;" on-click="updateFolderForGames"><iron-icon icon="save" style="margin-right: 8px;"></iron-icon>Update Folder</paper-button>
          </div>



          <div style="margin: 4px 16px; border: 1px solid var(--paper-grey-300); padding: 0px 8px;">
          <upload-button accept=".nds" on-file-selected="openFile" manual-upload>
          <paper-button style="color: var(--paper-indigo-500); font-weight: 500;"><iron-icon icon="build" style="margin-right: 8px;"></iron-icon>Make CIA Tool</paper-button>
          
              </upload-button>
              </div>

<!--
            <a name="game-list" href="[[rootPath]]game-list">View One</a>
            <a name="view2" href="[[rootPath]]view2">View Two</a>
            <a name="view3" href="[[rootPath]]view3">View Three</a>
          </iron-selector>-->
        </app-drawer>

        <!-- Main content -->
        <app-header-layout has-scrolling-region="">

          <app-header slot="header" condenses="" reveals="" fixed effects="waterfall">
            <app-toolbar>
              <div main-title="">Forwarder 3-DS</div>


         


              <upload-button accept=".nds,.dsi" on-file-selected="requestFiles" manual-upload multiple>
              <paper-icon-button icon="icons:folder-open"></paper-icon-button>
              </upload-button>


              <paper-icon-button icon="icons:settings" drawer-toggle=""></paper-icon-button>
            </app-toolbar>
          </app-header>

          <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
            <game-list card-list="[[cardList]]" class="game-list" name="game-list"></game-list>
            <my-view2 name="view2"></my-view2>
            <my-view3 name="view3"></my-view3>
            <my-view404 name="view404"></my-view404>
          </iron-pages>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }
  openFile(e){
      var file=e.detail.file;
      var context=this;
      if(file!=null){
        //console.log("new file!",file);
        var reader = new FileReader();
        var fileByteArray = [];
        reader.readAsArrayBuffer(file);
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
               var arrayBuffer = evt.target.result,
                   array = new Uint8Array(arrayBuffer);
               for (var i = 0; i < array.length; i++) {
                   fileByteArray.push(array[i]);
                }
                //console.log("ARRAY",fileByteArray);
                context.downloadTest(fileByteArray,file.name);
            }
        }
      }
  }
  downloadTest(fileArray,fileName){
    //console.log("CALLING ENDPOINT!");
    var context=this;
    var req = new XMLHttpRequest();
    MiscUtils.Toast.show("Converting to CIA...",0);
    req.open('POST', 'https://us-central1-forwarder3ds.cloudfunctions.net/execMakeCia', true);
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
         if(req.status == 200){

            //console.log("STATUS OK!");
            var json=JSON.parse(req.responseText);
            //console.log("JSON OK!",json);
            context.testData(json.data,json.fileName);
         }
         else{
          MiscUtils.Toast.show("Error while converting to CIA. Try again later");
           console.error("STATUS ERROR!",req.status,req.responseText);
         }
      }
    };
    req.send(JSON.stringify({fileArray:fileArray,fileName:fileName}));  
  }
  testData(data,fileName){
    let bytes = new Uint8Array(data.length);

for (let i = 0; i < bytes.length; i++) {
    bytes[i] = data[i];
}
let blob = new Blob([bytes], { type: 'application/octet-stream' });
blob.lastModifiedDate = new Date();
blob.name = fileName;

saveAs(blob,fileName);
MiscUtils.Toast.show("CIA made successfully");


  }

  pushFiles(files){
    
    this.shadowRoot.querySelector(".game-list").pushFiles(files);
  }
  requestFiles(e){
    
    var files=e.detail.files;
    var file=e.detail.file;
    if(files){
      this.pushFiles(files);
    }
    else if(file){
      this.pushFiles([file]);
    }
    //var { ipcRenderer }=require("electron");
    //ipcRenderer.send("requestFiles");
  }
  downloadForwarderTemplates(idList){
    if(!idList){
      console.error("No forwarders list found");
      return;
    }
    var context=this;
    for(var i=0;i<idList.length;i++){
      this.downloadCardFile(idList[i],function(card){


        if(!context.cardList){
          context.set("cardList",[]);
        }
        context.push("cardList",card);
//console.log("CARD",card);
      });
    }


  }
  downloadCardFile(cardId,callback){
    

    MiscUtils.requestTextFile("https://olmectron.github.io/forwarders/"+cardId+".fwd",function(data){
      if(!data){
        console.error("No card file found for id: "+cardId);
        return;
      }  
      if(callback){
        var json=MiscUtils.convertCardFileToJSON(data);
        json.id=cardId;
        callback(json);
      }
//      console.log("CARD DATA:",cardId,MiscUtils.convertCardFileToJSON(data));
      
  
      });
  }

  constructor(){
    super();
    var context=this;
    MiscUtils.requestTextFile("https://olmectron.github.io/forwarders/list.txt",function(data){
    if(!data){
      console.error("No forwarders list found");
      return;
    }  
    var idList=null;
    if(data.indexOf("\r\n")>-1){

      idList=data.split("\r\n");   
    }
    else{
      idList=data.split("\n");   
    }
    context.downloadForwarderTemplates(idList);


    });

    
    LocalStoreQuery.addFieldCallback("selectedTarget",function(target){
      context.set("selectedTarget",target);
      
    });
    LocalStoreQuery.addFieldCallback("autoRandomTid",function(checked){
      context.set("autoRandomTid",checked=="true");
      
    });

    LocalStoreQuery.addFieldCallback("setRomPath",function(checked){
      context.set("setRomPath",checked=="true");
      
    });


    LocalStoreQuery.addFieldCallback("keepDns",function(checked){
      context.set("keepDns",checked=="true");
      
    });
    LocalStoreQuery.addFieldCallback("folderForGames",function(folder){
      context.set("folderForGames",folder || "Games");
      
    });
    
  }
  setSelectedTarget(){
    var context=this;
    setTimeout(function(){
      var selectedTarget=context.selectedTarget;
      LocalStoreQuery.set("selectedTarget",selectedTarget);
  
    },250);
  }
  _sortName(a,b){
    var aName=a.name ? a.name.toLowerCase().trim() : "zzzzzz";
    var bName=b.name ? b.name.toLowerCase().trim() : "zzzzzz";
    return aName.localeCompare(bName);
  }
  saveCheckboxOption(e){
    var checkbox=e.target.closest("paper-checkbox");
    var name=checkbox.getAttribute("name");
    console.log("Saving:"+name);

    var context=this;
    setTimeout(function(){
      
      LocalStoreQuery.set(name,context[name]==true ? "true" : "false");

    },250);
  }
  updateFolderForGames(){
    LocalStoreQuery.set("folderForGames",this.folderForGames);
    
    MiscUtils.Toast.show("Folder updated");
  }
  static get properties() {
    return {
      gamesFolder:{
        type:String,
        notify:true,
        value: "Games"
      },
      selectedTarget:{
        type:String,
        notify:true,
        value: null
      },
      ndsFiles:{
        type:Array,
        notify:true
      },
      cardList:{
        type:Array,
        notify:true
      },
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged'
      },
      routeData: Object,
      subroute: Object
    };
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }

  _routePageChanged(page) {
     // Show the corresponding page according to the route.
     //
     // If no page was found in the route data, page will be an empty string.
     // Show 'game-list' in that case. And if the page doesn't exist, show 'view404'.
    if (!page) {
      this.page = 'game-list';
    } else if (['game-list', 'view2', 'view3'].indexOf(page) !== -1) {
      this.page = page;
    } else {
      this.page = 'view404';
    }

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  _pageChanged(page) {
    // Import the page component on demand.
    //
    // Note: `polymer build` doesn't like string concatenation in the import
    // statement, so break it up.
    switch (page) {
      case 'game-list':
        import('./game-list.js');
        break;
      case 'view2':
        import('./my-view2.js');
        break;
      case 'view3':
        import('./my-view3.js');
        break;
      case 'view404':
        import('./my-view404.js');
        break;
    }
  }
}

window.customElements.define('my-app', MyApp);
