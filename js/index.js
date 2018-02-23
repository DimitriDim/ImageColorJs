/**
 * Body HTTP
 * => Formaté par FormData (tout type de donnée)
 * 
 */
var app = (function () {

    //pas de let car pas de transpileur
    var endpoint;
    var style;
    //on a recupéré le fichier
    var input = document.getElementById("input");
    var output = document.getElementById('output');
    var colorList = document.getElementById("color-list");

    var user = "acc_eb766073b033d86";
    var pswd = "7efeb3e48b91eaaca97f03f2aca65522";
    var endpoint = "https://api.imagga.com/v1/content";
    var auth = "Basic " + btoa(user + ":" + pswd);
    var xhr = new XMLHttpRequest;
    var myFormData = new FormData;
    var endpointget;

    function hydrateColorList(colors) {
        for (var i = 0, l = colors.length; i < l; i++) {
            var li = document.createElement('li');
            li.innerHTML = colors[i].html_code;
            colorList.appendChild(li);
            li.style.backgroundColor = colors[i].html_code;
        }
    }

    return {
        initialize: function () {
            //Version mobile avec serveur phonegap: 
            //document.addEventListener('deviceready', this.render.bind(this), false);//quand le device est ready, j'active
            //Version desktop si on veux utiliser un localHoast:
            window.onload = function () { this.onDeviceReady() }.bind(this);
        },

        onDeviceReady: function () {
            //callback est une copie de la function onChange
            var callback = this.onChange.bind(this);
            //bug de l'alert ios dans un evement (on change ici)
            input.onchange = function () {
                var file = input.files[0];
                var id = window.setTimeout(function () {
                    //on envoi file a callback qui est une copie de la function onChange(file)
                    callback(file);
                }, 1000);
            }
        },

        onChange: function (file) {

            var reader = new FileReader();
            reader.readAsDataURL(file);
            //quand il a fini sa lecture, on appel sa fonction de rappel
            reader.onload = (function () {
                output.src = reader.result;
                //si on veux pas utiliser le bind, mais mauvais code car pas utilisable en class
                //window.app.getId(file)
                this.getId(file);
            }).bind(this) // je change le context avec bind pour ne plus etre xhr et appeler la fonction getId(file)

            reader.onerror = function () {
                alert("pas de lecture possible")
            }

        },

        getId: function (file) {
            //formdata est un "sac" qui envoi les fichiers
            myFormData.append("monFichier", file);
            xhr.open("POST", endpoint);
            xhr.onload = onerror = onabort = (function () {

                if (window.JSON.parse(xhr.response)['status'] == "success") {
                    endpointget = "https://api.imagga.com/v1/colors?content=" + window.JSON.parse(xhr.response)['uploaded']['0']['id'];
                    this.getColor(endpointget);
                }
            }).bind(this)
            //il faut ajouter une entete !!
            xhr.setRequestHeader("Authorization", auth);
            xhr.send(myFormData);

        },


        getColor: function (endpointget) {

            xhr.open("GET", endpointget);
            xhr.onload = onerror = onabort = (function () {
                if (window.JSON.parse(xhr.response).results) {
                    this.render(window.JSON.parse(xhr.response));
                }
            }).bind(this);

            xhr.setRequestHeader("Authorization", auth);
            xhr.send();
        },

        render: function (Json) {

            hydrateColorList(Json.results['0'].info.background_colors);
            hydrateColorList(Json.results['0'].info.foreground_colors);
            hydrateColorList(Json.results['0'].info.image_colors);

        },



    };
})();


