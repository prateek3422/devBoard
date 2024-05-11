

 class ApiError extends Error {
    statusCode:number;
    message:string;
    error:string[];
    success:boolean;
    data:any;
    
    constructor(statusCode:number, message:string = "something went wrong",errors:string[] = [] ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.error = errors
        this.data = null
        this.success = false
        
    }

}

export {ApiError}