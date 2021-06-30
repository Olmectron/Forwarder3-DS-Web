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
 import '@polymer/paper-ripple/paper-ripple.js';
 
 class UploadButton extends PolymerElement {
   static get template() {
     return html`
     <style>
     :host {
         position: relative;
       display: inline-block;
       cursor:pointer !important;
     }
     
     .input-file{
         opacity: 0;
 background-color: red;
           position: absolute; 
           bottom: 0 !important; 
           right: 0 !important; 
           left: 0 !important; 
           right:0 !important;
           width: 100% !important;
           height: 100% !important;
           min-width: 100% !important;
           max-width: 100% !important;
           min-height: 100% !important;
           max-height: 100% !important;
           
       cursor:pointer !important;
     }
     .input-file[invisible]{
       pointer-events: none !important;
     }
   </style>
   <slot style="pointer-events: none;" id="slot"></slot>
   <paper-ripple></paper-ripple>
   <input type="file" id="_fileButton" on-click="clickSlot" multiple$="[[multiple]]" invisible$="[[!enabled]]" on-change="_filesSelectedHandler" class="input-file"/>
 
     `;
   }
   _selectedLocalFilesChanged(files){
     
    this.dispatchEvent(new CustomEvent('file-selected', {detail: {files:files}}));       
   }
   _selectedLocalFileChanged(file){
     this.dispatchEvent(new CustomEvent('image-selected', {detail: {file:file}}));        
     if(this.photo==true && file!=null){
       var context=this;
        // console.log("eefile",e.detail.file);
        this.set("dataFile",file);
        this.set("imageFile",file);
        if (FileReader && file) {
 
            var fr = new FileReader();
            var context=this;
 
            fr.onload = function () {
                context.set("imageUrl",fr.result);
            }
            fr.readAsDataURL(file);
        }
    
     }
     else{
       this.set("imageFile",null);
       this.set("imageUrl",null);
     }
 
     this.dispatchEvent(new CustomEvent('file-selected', {detail: {file:file}}));        
 
   }
   _accChanged(string){
     
       if(string!=null)
    this.$._fileButton.accept=string;
   }
   static get properties() {
     return {
       multiple:{
        type:Boolean,
        notify:true,
        value: false
       },
         accept:{
            type:String,
            notify:true,
            observer: "_accChanged"
         },
       options:{
         type:Object,
         notify:true,
         observer: "_optionsChanged"
       },
       imageUrl:{
         type:String,
         notify:true,
         reflectToAttribute:true,
         value: null
       },
       imageFile:{
         type:Object,
         notify:true,
         reflectToAttribute:true,
         value: null
       },
       _selectedUploadButtonFile:{
         type:String,
         notify:true,
         value:null,
         observer: "_selectedLocalFileChanged"
       },
       _selectedUploadButtonFiles:{

        type:Object,
        notify:true,
        value:null,
        observer: "_selectedLocalFilesChanged"
       },
       manualUpload:{
         type: Boolean,
         notify: true,
         value: false
       },
       photo:{
         type:Boolean,
         notify:true,
         value: false
       },
       crop:{
         type:Boolean,
         notify:true,
         value: false
       },
       enabled:{
         type:Boolean,
         notify:true,
         value: true
       }
     };
   }
   clickSlot(){
     if(!this.enabled){
       return;
     }
     this.$.slot.click();
   }
 
   _optionsChanged(options){
       if(options){
         if(options.fileTypes){
         //   console.log("Type",type);
           this.$._fileButton.accept=options.fileTypes.join(",");
 //                inputFile.accept=type.join(",");
         }
       }
   }
   executeUpload(){
     if(this._selectedUploadButtonFile)
     this._actualUploadAction(this._selectedUploadButtonFile);
     else PolymerUtils.Toast.show("No has seleccionado ningún archivo");
 
   }
   _filesSelectedHandler(e){
     var options=this.options;
     var context=this;
     if(options==null && this.manualUpload!=true){
         PolymerUtils.Toast.show("Error. Verifica la información de la subida de archivos");
 
       console.error("You haven't set an options object");
       return;
     }
   /*  var type=options.fileTypes;
         var path=options.path;
         var name=options.name;
         var uploadDone=options.success;
         var errorFunction=options.error;
         var onPaused=options.onPaused;
         var onResumed=options.onResumed;
         var progressCallback=options.onProgress;*/
 
         
     if(e.target.files && e.target.files[0]){
 
       if(this.photo && this.crop){
         PolymerUtils.Dialog.createAndShow({element:"photo-cropper-dialog",params:[e.target.files[0],function(blob){
           //DataHelper.Storage._actualFirebasePhotoUpload(options,blob,options.width,options.height);
 
           
           var archivo = new File([blob], options.name,{ type: blob.type, lastModified: new Date().getTime()});
           
           if(e.target.files!=null && e.target.files.length>1){
            this.set("_selectedUploadButtonFiles",e.target.files);
           
           }
           else{
            context.set("_selectedUploadButtonFile",archivo);
           }
           context.shadowRoot.querySelector("input").value="";
 
           if(!context.manualUpload){
             context._actualUploadAction(context._selectedUploadButtonFile);
     
           }
             
 
         }]});
       }
       else{
 

         if(e.target.files!=null && e.target.files.length>1){
          this.set("_selectedUploadButtonFiles",e.target.files);
         
         }
         else{
          this.set("_selectedUploadButtonFile",e.target.files[0]);

         }

         context.shadowRoot.querySelector("input").value="";
         if(!context.manualUpload){
           context._actualUploadAction(context._selectedUploadButtonFile);
   
         }
 
 
       }
 
 
      
 
 
 
 
       }
       else{
           PolymerUtils.Toast.show("No seleccionaste ningún archivo");
       }
   }
   _actualUploadAction(file){
     var options=this.options;
 
     if(this.photo){
       /*if(this.crop){
         var t=this;
         PolymerUtils.Dialog.createAndShow({element:"photo-cropper-dialog",params:[file,function(blob){
           DataHelper.Storage._actualFirebasePhotoUpload(options,blob,options.width,options.height);
       
             
 
         }]});
         return;
       }
       else{*/
         DataHelper.Storage._actualFirebasePhotoUpload(options,file,options.width,options.height);
       
 //      }
      
     }
     else{
       DataHelper.Storage._actualFirebaseUpload(options,file);
 
     }
       
   }
 }
 
 window.customElements.define('upload-button', UploadButton);
 