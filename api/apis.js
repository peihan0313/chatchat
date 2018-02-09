function getTime_Str(){
    var date = new Date()
    var date = `${date.getFullYear()}/${(date.getMonth()+1)<10?'0'+(date.getMonth()+1):(date.getMonth()+1)}/${date.getDate()<10?'0'+date.getDate():date.getDate()} ${date.getHours()}:${date.getMinutes()}`
    return date
}

module.exports={
    getTime_Str,
}