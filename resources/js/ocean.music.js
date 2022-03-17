/** library for music management
 * @author sebastien.mamy@gmail.com
 * @since 2022-03-12
 */

if(typeof global !== "undefined") require("../../../ocean/lib/ocean.helper")
if(typeof global !== "undefined") require("../../../ocean/lib/ocean.item")
if(typeof global !== "undefined") require("../../../ocean/lib/ocean.store")

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
    for(const product of Object.values(json.data.products)) Music.New.Asset(product, "recording")
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
    if(json?.tracks) for(const [i, recId] of json.tracks.entries()) {
        let link = Store.Link(Item.GetId(asset),recId)
        Item.Set(link,"type", "track").Set("position",i+1)
    }
    if(json?.perfomer) for(const performer of Store.FromIndex(json.perfomer, "Identity")) Item.Set(asset, "links." + performer + ".role", "performer")
    if(json?.performer) for(const performer of Store.FromIndex(json.performer, "Identity")) Item.Set(asset, "links." + performer + ".role", "performer")
    Item.Set(asset, "images.*", json?.cover)
    Item.Set(asset, "type", type)
    Item.Set(asset,"location", json?.location)
    return asset
}


/** creates the item and strore them in the store, from a normalized filename
 * @return Store
 */
Music.FromMp3 = (subpath, mp3File) => {
    var name = mp3File.split(".")
    name.pop()
    var fields = name.join(".").split(", ")
    let product = Store.FromIndex(mp3File)
    product = product.length === 1 ? Store.Get(product[0]) : Music.New.Asset(null, "recording")
    Store.Index(mp3File, product)
    let performers = null, creators = null, album = null, track = null, albumType = null, identifier = null
    switch(fields.length) {
        case 1:
            Item.SetTitle(product, fields[0].trim())
            break
        case 2:
            performers = fields[0].trim().split("|")
            Item.SetTitle(product, fields[1].trim())
            break
        case 3:
            performers = fields[0].trim().split("|")
            Item.SetTitle(product, fields[1].trim())
            creators = fields[2].trim().split("|")
            break
        case 4:
            performers = fields[0].trim().split("|")
            album = fields[1].trim()
            track = fields[2].trim()
            Item.SetTitle(product, fields[3].trim())
            break
        case 5:
            performers = fields[0].trim().split("|")
            album = fields[1].trim()
            track = fields[2].trim()
            Item.SetTitle(product, fields[3].trim())
            albumType = fields[4].trim().toLowerCase()
            break
        case 6:
            performers = fields[0].trim().split("|")
            album = fields[1].trim()
            track = fields[2].trim()
            Item.SetTitle(product, fields[3].trim())
            creators = fields[5].trim().split("|")
            identifier = fields[4].trim()
            break
    }
    Music.AddContributors(product, performers,"performer")
         .AddContributors(product, creators, "creator")
         .AddAlbum(product, album?.trim(), performers, track?.trim(), albumType?.trim())
         .Set(product, "identifiers.values.*", identifier)
         .Index(product, identifier)
    return Store
}


/** shortcut to Item.Set 
 * return Music
 */
Music.Set = (item, path, value) => {
    Item.Set(item, path, value)
    return Music
}


/** shortcut to Store.Index
 * @return Music
 */
Music.Index = (item, value) => {
    Store.Index(value, item)
    return Music
}


/** adds performers to an asset 
 * @returns Music
 */
Music.AddContributors = (asset, contributors = null, role) => {
    if(contributors === null) return Music
    let share = Math.floor(10000/contributors.length)
    for(let name of contributors) {
        let contributor = Store.Fetch(name.trim(),"Identity")
        Item.SetName(contributor, name)
        Store.AddLink(contributor, asset, "participations", "roles." + role + ".share", share)
    }
    return Music
}


/** adds the asset to the album
 * @returns Music
 */
 Music.AddAlbum = (asset, title = null, performers = null, track = null, albumType = null) => {
    if(title === null || title.toLowerCase() === "none") return Music
    let album = Store.Fetch(Music.AlbumIndex(title, albumType, performers), "Asset")
    Item.Set(album, "type", "album").SetTitle(album, title)
    Store.AddLink(album, asset, "tracks", track === null ? null : "position", track)
    return Music
}


/** returns the index value for an album
 * @return string
 */
Music.AlbumIndex = (album, albumType = null, performers = null) => album + (albumType !== null && albumType.length > 1 ? ":" + albumType : performers === null ? "[unknown]" : "[" + performers.join("|") + "]")


/** returns the index value for an asset
 * @return string
 */
Music.AssetIndex = (title, performers = null, creators = null) => title + (performers !== null && performers.length > 0 ? "[" + performers.join("|") + "]" : "") + (creators !== null && creators.length > 0 ? "(" + creators.join("|") + ")" : "")


