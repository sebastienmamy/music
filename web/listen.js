var data = {}
data.helper = window.helper
data.vh = window.innerHeight
data.vw = window.innerWidth
data.list = false
data.search = ""
data.mode = "home"
data.subset = null
data.prevsubset = null
data.volume = null

data.playing = {}
data.playing.index = undefined
data.playing.audio = null
data.playing.playing = false
data.playing.currentTime = helper.time(":", 0)
data.playing.media = null

data.library = {}
data.library.imgdir = '/Volumes/Mobile/University/Ocean Media/Image/'
data.library.basedir = '/Volumes/Mobile/University/Ocean Media/Audio'
data.library.name = 'My Library', 
data.library.index = {} 
data.library.lists = {}
data.library.data = {}
data.library.data.products = {}
data.library.data.albums = {}
data.library.data.performers = {}
data.library.data.creators = {}

data.view = {}
data.view.offset = 0
data.view.size = 13

data.state = {}
data.state.info = null
data.state.error = null
data.state.success = null

data.grid = {}
data.grid.album =  null
data.grid.creator = null
data.grid.performer = null
data.grid.playlist = null

data.search = {}
data.search.active = false
data.search.value = ""

data.selection = []




var methods = {}

            methods.Get = (type, id) => {
                return this.sets[type]
            }

            methods.Index = (field = "id") => {
                window.apps.library.index = {};
                window.apps.library.index.products = helper.sort(window.apps.library.data.products, field);
                window.apps.current = window.apps.library?.index?.products;
                window.apps.set = window.apps.current;

                // windows.apps.selection = 
                
            }

            methods.LoadJson = (event) => {
                let file = event.target.files[0];
                let fr = new FileReader();
                fr.onload = (ev) => {
                    window.apps.library = JSON.parse(ev.target.result);
                    
                    helper.info(Music.Load(window.apps.library))
                    

                    window.apps.Index("album");
                    window.apps.Message("success","" + new Intl.NumberFormat().format(helper.size(window.apps.library.data.products)) + " products loaded successfully");
                }
                if(!file.name.endsWith(".json")) window.apps.Message("error","invalid file, must be a .json file");
                else fr.readAsText(file);
            }

            methods.LoadMedias = (event) => {
                let vue = window.apps, library = window.apps.library;
                if(!library.basedir) {
                    vue.Message("error", "no library loaded, go to 'library' first");
                    return;
                }
                let added = 0;
                for(let file of event.target.files) {
                    let fname = (""+file.name[0]).toUpperCase() + "/" + encodeURIComponent(file.name);
                    let product = helper.reduce(library.data.products, (item) => item.location === fname);
                    if(helper.size(product) === 1) {
                        
                    } else {
                        product = {location: fname};
                        let fields = file.name.split(",");
                        product.album       = "unknown";
                        product.creator     = "unknown";
                        product.type        = "recording";
                        switch(fields.length) {
                            case 2:  // performer, title
                                product.performer   = fields[0].trim();
                                product.title = fields[1].split(".")[0].trim();
                                break;
                            case 3: // performer, title, creator
                                product.performer   = fields[0].trim();
                                product.title = fields[1];
                                product.creator = fields[2].split(".")[0].trim();
                                break;
                            case 4: // performer, album, track, title
                                product.performer   = fields[0].trim();
                                product.album = fields[1].trim();
                                product.track = fields[2].trim();
                                product.title = fields[3].split(".")[0].trim();
                                break;
                            case 5:
                                product.performer   = fields[0].trim();
                                product.album = fields[1].trim();
                                product.track = fields[2].trim();
                                product.title = fields[3].trim();
                                product.albumType = fields[4].split(".")[0].trim();
                                break;
                            case 6: // performer, album, track, title, identifier, creator
                                product.performer   = fields[0].trim();
                                if(fields[1].trim().toLowerCase() !== "none") product.album = fields[1].trim();
                                if(fields[2].trim() !== "0") product.track = fields[2].trim();
                                product.title = fields[3].trim();
                                product.identifier = fields[4].trim();
                                product.creator = fields[5].split(".")[0].trim();
                                break;
                        }
                        library.data.products = helper.push(library.data.products, product);
                        product.id = Object.values(library.data.products)[helper.size(library.data.products) -1].id;
                        added++;
                        // creates albums
                        (product.album ? product.album.split("|") : ["unkown"]).reduce((ret, alb) => {
                            let album = helper.reduce(library.data.albums, (item, key) => item.title === alb && ( alb === 'unknown' || item.performer === product.performer) );
                            if(helper.size(album) === 0) {
                                album = {
                                    type: "album", 
                                    title: alb,
                                    performer: product.album === 'unknown' ? 'unknown' : product.performer ,
                                    cover: library.imgdir + window.encodeURIComponent(product.album === 'unknown' ? 'unknown' : product.performer + ', ' + product.album) + '.jpg',
                                    tracks: []
                                }
                                album.tracks[parseInt(product.track) - 1] = product.id;
                                library.data.albums = helper.push(library.data.albums, album);
                            }
                            else if(alb === "unknown") Object.values(album)[0].tracks.push(product.id);
                            else Object.values(album)[0].tracks[parseInt(product.track) - 1] = product.id;              
                        },{});              

                        // creates performers
                        (product.performer ? product.performer.split("|") : []).reduce((ret, perfo) => {
                            let performer = helper.reduce(library.data.performers, (item, key) => item.name === perfo.trim());
                            if(helper.size(performer) === 0) library.data.performers = helper.push(library.data.performers, {type: "entity", name:perfo.trim(),tracks: [product.id], cover: library.imgdir + window.encodeURIComponent(perfo.trim() + '.jpg')});
                            else Object.values(performer)[0].tracks.push(product.id);   
                        },{});
                                                                        

                        // creates creators
                        (product.creator ? product.creator.split("|") : []).reduce((ret, crea) => {
                            let creator = helper.reduce(library.data.creators, (item, key) => item.name === crea);
                            if(helper.size(creator) === 0) {
                                let c = {type: "entity", name:crea.trim(),tracks: [product.id], cover: library.imgdir + window.encodeURIComponent(crea.trim() + '.jpg')};
                                library.data.creators = _push(library.data.creators, c);
                            }
                            else Object.values(creator)[0].tracks.push(product.id);  
                        },{});                               
                    }
                }       
                vue.Index("album");
                vue.Message("success", "" + new Intl.NumberFormat().format(added) + " tracks added");
                vue.$forceUpdate();
                event.target.value = "";
            }

            methods.Message = (type, text, time = 5000) => {
                window.apps.state[type] = text;
                setTimeout(() => window.apps.state[type] = null, time);
            }

            methods.Filter = (event) => { 
                window.apps.search.value = event.target.value;
                if(window.apps.search.value.length === 0) window.apps.current = window.apps.set;
                else if(window.apps.search.value.length >= 3) window.apps.current = helper.reduce(window.apps.set, (item) => 
                    (item?.album !== undefined &&item.album.includes(window.apps.search.value)) ||
                    (item?.performer !== undefined &&item.performer.includes(window.apps.search.value)) ||
                    (item?.title !== undefined &&item.title.includes(window.apps.search.value)) ||
                    (item?.creator !== undefined &&item.creator.includes(window.apps.search.value)));
                
                
                // this.index = Object.keys(_properties(
                //     properties(this.medias, (property, key) => this.index.includes(key))    
                //     , (property, key) => key === "value" && property === dom));                    
            }

            methods.Play = (index) => {
                const vue = window.apps;
                if(helper.size(vue.current) === 0 || index === undefined) {
                    vue.Message("error", "no track to play, please select a library or a track set");
                    return;
                } else if(vue.playing.index === index) {
                    if(vue.playing.audio === null) vue.SelectSong(index);
                    if(vue.playing.playing) vue.playing.audio.pause();
                    else vue.playing.audio.play();    
                    vue.playing.playing = !vue.playing.playing;                                            
                } else {
                    if(vue.playing.index !== undefined ||vue.playing.playing) vue.playing.audio.pause();                        
                    vue.SelectSong(index);
                    vue.playing.audio.play(); 
                    vue.playing.playing = true;
                } 

                if(vue.playing.index < vue.view.offset)                     vue.view.offset = index;
                if(vue.playing.index > (vue.view.offset + vue.view.size -1))   vue.view.offset = index - vue.view.size + 1;
            }

            methods.PlayMedia = (id) => {
                return window.apps.Play(Object.keys(window.apps.current).indexOf(id))
            }

            methods.SelectSong = (index) => {
                let a = window.apps;
                index  = index === undefined || index < 0 || index >= helper.size(a.current) ? 0 : index;
                a.playing.index = index;
                if(a.library.index.products === undefined || helper.size(a.library.index.products) === 0) a.Index();
                var product = Object.values(a.current)[index];
                if(product === "undefined" || product == undefined) product = Object.values(a.current)[0];                    
                a.playing.media = product;
                a.playing.audio = new Audio("file://"+a.library.basedir + "/" + product.location);
                if(a.volume === null) a.volume = 0.5;
                a.playing.audio.volume = a.volume;

                document.title = product.title + ' (' + product.performer + ') '
                a.playing.audio.onloadedmetadata = () => product.duration = helper.time(":",Math.floor(a.playing.audio.duration));
                a.playing.audio.onended = () => a.PlayNext();
                a.playing.audio.ontimeupdate = () => a.playing.currentTime = helper.time(":",Math.floor(a.playing.audio.currentTime));
            }

            methods.PlayNext = (reverse = false) => {
                let     product = undefined, 
                        index = window.apps.playing.index, 
                        vue = window.apps,
                        count = 0;;
                while(product === undefined) {
                    count++;
                    index = parseInt(index) + (reverse ? -1 : 1);
                    if(index >= helper.size(vue.current)) index = 0;
                    if(index < 0) index = helper.size(vue.current) - 1;
                    product = Object.values(vue.current)[index];
                    if(index === vue.playing.index && product === undefined) {
                        vue.Message("error", "empty album");
                        return;
                    } else if(index === vue.playing.index) return;  
                    if(count > 1000) {
                        helper.error("infinte loop in track list", index, Object.values(vue.current));
                        break;
                    }                
                }
                if(vue.playing.playing && vue.playing.index !== index) vue.Play(index);
                
            }

            methods.SaveLibrary = () => {
                let a = document.createElement('a');
                a.setAttribute("href",   "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.apps.library))  );
                a.setAttribute("download", window.apps.library.name + ".json");
                document.body.appendChild(a); // required for firefox
                a.click();
                a.remove();
            }

            methods.PlaySet = (set, mode = "track") => {
                // window.apps.set = helper.select(window.apps.library.data.products, (product) => set.includes(product.id));
                window.apps.set = Object.keys(window.apps.library.data.products).reduce((result, id) => set.includes(id) ? {...result, [id]: window.apps.library.data.products[id]} : result, {})
                window.apps.current = window.apps.set;
                if(window.apps.playing.playing) {
                    window.apps.playing.playing = false;
                    window.apps.playing.audio.pause();
                }
                let product = undefined, index = 0, vue = window.apps;
                product = Object.values(vue.current)[index];
                while(product === undefined) {
                    index++;
                    if(index >= helper.size(vue.current)) index = 0;
                    product = Object.values(vue.current)[index];
                    if(index === 0) {
                        vue.Message("error", "empty album");
                        return;
                    }                        
                }
                window.apps.SelectSong(index);
                window.apps.Play(index);
                window.apps.mode = mode;
            }

            methods.SetMode = (mode, before = () => true, after = () => true) => {
                before();
                window.data.menu.toggle(false);
                switch(mode) {
                    case 'track':
                        // window.apps.current = window.apps.library?.index?.products;
                        break;
                    case 'album':
                        window.apps.grid.album = helper.sort(window.apps.library.data.albums, "title");
                        break;
                    case 'creator':
                        window.apps.grid.creator = helper.sort(window.apps.library.data.creators, "name");
                        break;
                    case 'performer':
                        window.apps.grid.performer = helper.sort(window.apps.library.data.performers, "name");
                        break;
                    default:
                        break;
                }
                window.apps.mode = mode;
                window.apps.$forceUpdate();
                after();
            }
                
            methods.GetView = () => {
                return Object.values(this.current).slice(this.view.offset, this.view.size + this.view.offset)
            }

            methods.Scroll = (event) => {
                let speed = this.view.size;
                if(this.mode === 'track') {
                    if(event.deltaY > 0 && this.view.offset < (helper.size(this.current) - this.view.size)) this.view.offset = this.view.offset + speed;
                    if(event.deltaY < 0 && this.view.offset > 0) this.view.offset = this.view.offset - speed;
                }
            }

            methods.Page = () => {
                window.apps.view.size = Math.floor((window.apps.vh - 0.22 * window.apps.vw) / (0.04 * window.apps.vw));
                if(Object.keys(window.apps.current).length === 0) return null;
                if(window.apps.view.offset >= Object.keys(window.apps.current).length) return helper.paginate(window.apps.current,0,window.apps.view.size);
                return  helper.paginate(window.apps.current,window.apps.view.offset,window.apps.view.size);
            }

            methods.ShowList = () => {
                window.apps.list = !window.apps.list;
            }

            methods.Random = () => { 
                let newOrder = helper.shuffle(Object.keys(window.apps.current))
                newCurrent = newOrder.reduce((current, id) => ({...current, [id]: window.apps.current[id]}),{});
                helper.log("info", "order",newOrder, Object.keys(newCurrent))
                if(window.apps.playing.playing) window.apps.playing.index = Object.values(window.apps.current).indexOf(window.apps.playing.media);
                // helper.log("info", "after", window.apps.current)
                window.apps.$forceUpdate(); 
            }

            methods.Subset = (id) => {
                if(window.apps.subset === id) {
                    window.apps.prevsubset = id;
                    window.apps.subset = null;
                } else {
                    window.apps.subset = id;
                    if(id !== window.apps.prevsubset) window.apps.PlaySet(window.apps.library.data.creators[id].tracks, "creator");
                }
            }

            methods.ActivateSearch = () => {
                window.apps.search.active = true
                console.log(window.apps.search.active)
            }
               
            methods.DisableSearch = () => {
                window.apps.search.active = false
                console.log(window.apps.search.active)
            }
            
            methods.AdjustVolume = (event) => {
                window.apps.volume = event.currentTarget.value/100;
                if(window.apps?.playing?.audio)  window.apps.playing.audio.volume = window.apps.volume;
            }

            methods.Reload = () => {
                window.apps.current = window.apps.library?.index?.products;
            }