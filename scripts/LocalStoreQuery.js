
class Storage {
    constructor() {
    }
    get(key) {
      
      return localStorage.getItem(key);
      
    }
    remove(key){
      localStorage.removeItem(key);
    }
    set(key, val) {
      localStorage.setItem(key,val);
    }
  
}


class LocalStoreQueryClass{
    constructor(){
      

        this.callbacks=[];
        
        this.localStore=new Storage();
          

        
      }
    set(field,value){
        this.localStore.set(field,value);
        this._callFieldCallbacks(field);
      //  console.warn("LOCALSTORE SET",this.localStore.get(field));
    }
    get(field,defa){
        var value=this.localStore.get(field);
        if(!defa){
            defa=null;
        }
        if(!value || value.trim()==""){
            return defa;
        }
        return value;
    }
    removeFieldCallback(context,name){
        
        for(var i=this.callbacks.length-1;i>=0;i--){
            var callback=this.callbacks[i];
            if(callback.context!=null && callback.context==context && callback.name==name){

                this.callbacks.splice(i,1);
                
            }
        }
        
    }
    addFieldCallback(name,callback,context){
        this.callbacks.push({"name":name,"callback":callback,context:context});

        
        callback(this.get(name,null));
        
        
    }
    _callFieldCallbacks(name){
        for(var i=0;i<this.callbacks.length;i++){
            var calla=this.callbacks[i];
            if(calla && calla.callback && calla.name==name){
                calla.callback(this.get(name,null));
            }
        }
    }

  
}
window.LocalStoreQuery=new LocalStoreQueryClass();