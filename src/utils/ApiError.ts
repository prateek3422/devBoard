class ApiError extends Error {
    statusCode:number
    message:string
    success:boolean
    data:any
    
    constructor(){

    }

}