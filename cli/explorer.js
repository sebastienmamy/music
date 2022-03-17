/** service for exploring a path and creates a store from found mp3 files
 */

 if(typeof global !== "undefined") require("../../ocean/lib/ocean.service")
 if(typeof global !== "undefined") require("../resources/js/ocean.music")


Service.Init(__dirname, __filename)
Store.Init(FILE, Service.name, Service.conf.files.output)
Store.path = {images: Service.conf.directories.image, sounds: Service.conf.directories.sound}



for(const path of io.ls({path: io.path(Service.conf.directories.sound),options: "D"}))
    for(const file of io.ls({path: io.path(Service.conf.directories.sound, path)}))
        Music.FromMp3(path, file)

Store.Save()

// helper.info(Store)

// const GetMetadata = (fileName) => {
//     // let h = hash.md5(fileName).toUpperCase();
//     // h = [...h].map((d, i) => (i) % 4 === 0 && i > 0 ? '-' + d : d).join('').trim().padEnd(33, 0) + "21";
//     var name = fileName.split(".");
//     name.pop();
//     name = name.join(".");
//     var fields = name.split(", ");
//     let product = {"type": "recording", "id" : GetHash(fileName)};
//     if(fields.length === 1) {
//         product.title = fields[0];
//     } else if(fields.length === 2) {
//         product.performer = fields[0];
//         product.title = fields[1];
//     } else if(fields.length === 3) {
//         product.performer = fields[0];
//         product.title = fields[1];
//         product.creator = fields[2];
//     } else if(fields.length === 4) {
//         product.performer = fields[0];
//         product.album = fields[1];
//         product.track = fields[2];
//         product.title = fields[3];
//     } else if(fields.length === 5) {
//         product.performer = fields[0];
//         product.album = fields[1];
//         product.track = fields[2];
//         product.title = fields[3];
//         product.albumType = fields[4];
//     } else if(fields.length === 6) {
//         product.performer = fields[0];
//         if(fields[1].trim().toLowerCase() !== "none") product.album = fields[1].trim();
//         if(fields[2].trim() !== "0") product.track = fields[2].trim();
//         product.title = fields[3];
//         if(fields[4].trim() !== "none") product.identifier = fields[4];
//         product.creator = fields[5];
//     }
//     return product;
// };



// /** adds a track to an album */
// const AddTrackToAlbum = (product) => {
//     let albumKey = product.album !== undefined ? ((product.albumType !== undefined ? product.albumType : product.performer) + ", " + product.album) : "Unknown";
//     let albumID = GetHash(albumKey);
//     let album = dirs.data.albums[albumID] === undefined ? {
//         "id": albumID,
//         "title": product.album !== undefined ? product.album : "Unknown",
//         "type": "album",
//         "perfomer": product.albumType !== undefined ? "Multiple" : product.performer,
//         "cover": dirs.imgdir + io.sep+ encodeURIComponent(albumKey)+".jpg",
//         "tracks": []
//     } : dirs.data.albums[albumID];
//     if(album.tracks.indexOf(product.id) < 0) album.tracks.push(product.id);
//     dirs.data.albums[albumID] = {...album};
//     return dirs.data.albums[albumID];
// }

// /** adds a track to a set */
// const AddTrackToSet = (product, field, set) => {
//     let entityKeys = product[field] === undefined ? "Unknown" : product[field];
//     let names = entityKeys.split("|");
//     names.reduce((tmp, name) => {
//         let entityID = GetHash(name);
//         let entity = dirs.data[set][entityID] === undefined ? {
//             "id": entityID,
//             "name": name,
//             "type": "entity",
//             "cover": dirs.imgdir + io.sep+ encodeURIComponent(name)+".jpg",
//             "tracks": []
//         } : dirs.data[set][entityID];
//         if(entity.tracks.indexOf(entityID) < 0) entity.tracks.push(product.id);
//         dirs.data[set][entityID] = {...entity}
//     },{});
    
// }


// Object.values(dirs.data.products).reduce((tmp, product) => {
//     let album = AddTrackToAlbum(product);
//     product.cover = album.cover;
//     AddTrackToSet(product,"performer","performers");
//     AddTrackToSet(product,"creator","creators");
// }, {});

// io.writeFile(dirs, config.output_file);

// helper.log("INFO", config.media_dir, dirs);