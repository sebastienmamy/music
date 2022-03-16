/** library for music management
 * @author sebastien.mamy@gmail.com
 * @since 2022-03-12
 */

if(typeof global !== "undefined") require("../../ocean/lib/ocean.helper")
if(typeof global !== "undefined") require("../../ocean/lib/ocean.item")
if(typeof global !== "undefined") require("../../ocean/lib/ocean.store")

if(typeof Item === "undefined") helper.exception("library ocean.item is required")
if(typeof Store === "undefined") helper.exception("library ocean.store is required")


/**  */
helper.static.Music = {New: {}}


/** load a json library to the store
 * @return Store
*/
Music.Load = (json) => {
    helper.assert(json && typeof json === "object", "library data is corrupted")
    Store.Init(Store.MEMORY, json.name)
    Store.path = {images: json.imgdir, sounds: json.basedir}
    for(const creator of Object.values(json.data.creators)) Music.New.Identity(creator, "composer")
    for(const performer of Object.values(json.data.performers)) Music.New.Identity(performer, "performer")
    for(const album of Object.values(json.data.albums)) Music.New.Asset(album, "album")        
    return Store
}


/** creates and store an identity from a json 
 * @return object
*/
Music.New.Identity = (json = null, role) => {
    let identity = Store.Identity(json?.name, "short", json?.id)
    Item.Set(identity, "images.*",json?.cover)
    for(const recId of json.tracks) Item.Set(identity, "links."+recId+".roles.*", role)
    return identity
}

/** creates and store a product from a json */
Music.New.Asset = (json = null, type) => {
    let asset = Store.Asset(json?.title, "original", json?.id)
    for(const recId of json.tracks) Item.Set(asset, "tracks.*.", recId)
    for(const performer of Store.FromIndex(json?.perfomer, "Identity")) Item.Set(asset, "links." + performer + ".role", "performer")
    Item.Set(asset, "images.*", json?.cover).Set(asset, "type", type).Set(asset, "tracks", json.tracks)
    return asset
}
