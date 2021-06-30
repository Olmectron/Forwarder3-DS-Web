



                import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

                

let internalMixin = function(superClass) {
    return class extends superClass {
      constructor(){
          super();
          
          var userAgent = navigator.userAgent.toLowerCase();
          if (userAgent.indexOf(' electron/') > -1) {

            this.set("isElectron",true);
          }
          else{
              this.set("isElectron",false);
          }
         
      }
      
      ready(){
          super.ready();
    
      }
      static get properties(){
          return{
              isElectron:{
                  type:Boolean,
                  notify:true
              }
            
          };
      }
    }
  }
  export const ElectronMixin = dedupingMixin(internalMixin);