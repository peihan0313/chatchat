function getTime_Str(){
    var date = Date.now()
    //var date = `${date.getUTCFullYear()}-${(date.getUTCMonth()+1)<10?'0'+(date.getUTCMonth()+1):(date.getUTCMonth()+1)}-${date.getUTCDate()<10?'0'+date.getUTCDate():date.getUTCDate()} ${date.getUTCHours()<10?'0'+date.getUTCHours():date.getUTCHours()}:${date.getUTCMinutes()<10?'0'+date.getUTCMinutes():date.getUTCMinutes()}:${date.getUTCSeconds()<10?'0'+date.getUTCSeconds():date.getUTCSeconds()}`
    return date
}

module.exports={
    getTime_Str,
}