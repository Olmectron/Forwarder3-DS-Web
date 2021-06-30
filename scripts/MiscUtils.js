window.MiscUtils={
    convertCardFileToJSON(string){

        var json={};
        var split=null;
        if(string.indexOf("\r\n")>-1){
            split=string.split("\r\n");

        }
        else{
            split=string.split("\n");

        }

        
        for(var i=0;i<split.length;i++){
            if(split[i].split("=")[0]==""){
                continue;
            }
            json[split[i].split("=")[0]]=split[i].split("=")[1];
            if(json[split[i].split("=")[0]]=="false"){
                json[split[i].split("=")[0]]=false;
            }
            else if(json[split[i].split("=")[0]]=="true"){
                json[split[i].split("=")[0]]=true;
            }
        }


        return json;

    },
    getRandomTid(){
        var random=Math.floor(Math.random()*window.TIDList.length);
        return window.TIDList[random];
    },
    requestTextFile(url,callback){
        // read text from URL location
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.send(null);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var type = request.getResponseHeader('Content-Type');
                if (type.indexOf("text") !== 1) {
                    if(callback){
                        callback(request.responseText);
                    }
                    return request.responseText;
                }
            }
        }
    },
    Toast:{
        /** 
         * Muestra el paper-toast conseguido llamando a la función newToast.
         * Los parámetros se explican en la función newToast
        */
       clearToasts: function(){
    
     
        var myNode = document.getElementById("unique-main-app-body-toast-div");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
       },
    
        show: function (message, duration, wideLayout, dialog, buttonText, buttonColor) {
            this.newToast(message, duration, wideLayout, dialog, buttonText, buttonColor).open();
            
            if(window.PolymerGlobalOptionsData && window.PolymerGlobalOptionsData._notificacionesVoice==true)
            this.sayToast(message);
    
    
        },
        cancelSay: function(){
            if(window.AndroidApp!=null){
                _cancelAndroidSpeechTalk();
            }
            else{
                if(!window.speechSynthesis){
                    return;
                }
                if (window.speechSynthesis.speaking) {
        
                    window.speechSynthesis.cancel();
                }
            }
    
        },
        sayToast: function(text) {
    
            if(window.AndroidApp!=null){
                _callAndroidSpeechTalk(text.replace(/<\/?[^>]+(>|$)/g, ""));
            }
            else{
                if(!window.speechSynthesis){
                    return;
                }
                if(text!=null){
                    text=text.replace(/Corntech/g, 'Corntek');
                    text=text.replace(/corntech/g, 'corntek');
                }
                if (window.speechSynthesis.speaking) {
                    // SpeechSyn is currently speaking, cancel the current utterance(s)
                    window.speechSynthesis.cancel();
            
                    // Make sure we don't create more than one timeout...
                    if (window.sayTimeout !== null)
                        clearTimeout(window.sayTimeout);
            
                    
                    window.sayTimeout = setTimeout(function () { PolymerUtils.Toast.sayToast(text); }, 250);
                }
                else {
                    // Good to go
                    var message = new SpeechSynthesisUtterance(text);
                    message.voiceURI = 'native';
                    message.lang = "es-LA";
                    window.speechSynthesis.speak(message);
                }
            }
            
           
        },
        /** 
         * Crea un nuevo paper-toast.
         * 
         * Recibe los siguientes parámetros:
         * - message: El mensaje a mostrar en el paper-toast.
         * - duration: la duración en pantalla del toast, en milisegundos
         * - dialog: objeto de paper-dialog, en caso de que el toast se deba mostrar 
         *      sobre el overlay de un dialog con "with-backdrop" o con "modal"
         * - buttonText: (opcional) texto que se mostrará como un botón a la derecha del toast.
         * - buttonColor: (opcional) color deol botón que se mostrará a la derecha del toast.
         *  
        */
        newToast: function (message, duration, dialog, buttonText, buttonColor) {
            wideLayout = document.body.clientWidth <= 640;
            var t = message;
            if(typeof(message)=="object"){
                t=JSON.stringify(t);
            }
            var d = duration;
            var toast = document.createElement("paper-toast");
    
            toast.innerHTML = t;
    
            if (buttonText) {
                var but = document.createElement("paper-button");
                but.style.cssText = "text-transform:none; color: " + (buttonColor || "#2196F3") + ";"
    
                but.innerHTML = buttonText;
                toast.appendChild(but);
            }
            if (d != null)
                toast.duration = d;
            if (wideLayout) {
                toast.style = "width: 100%;" +
                    "min-width: 0;" +
                    "border-radius: 0;" +
                    "padding-top: 12px;" +
                    "margin: 0;";
            }
            else {
                toast.style = "";
            }
    
            toast.addEventListener("iron-overlay-closed", function () {
                if (dialog)
                    dialog.removeChild(toast);
                else{
                    var parent=document.getElementById("unique-main-app-body-toast-div");
                    if(parent.contains(toast)){
                        parent.removeChild(toast);
                    }
                }
    //                .removeChild(toast);
                //console.log("Child removed");
            });
            //dynamicEl.cities = this.officesCities;
            //    if(dialog)
            //    dialog.appendChild(toast);
            //    else
            
            document.getElementById("unique-main-app-body-toast-div").appendChild(toast);
    
            return toast;
        }
    
    
    }
};