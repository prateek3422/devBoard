 class ApiError extends Error {
    statusCode:number;
    message:string;
    error:string[];
    success:boolean;
    data:any;
    
    constructor(statusCode:number, message:"something went wrong", error:string[],){

        super(message)
        this.statusCode = statusCode
        this.message = message
        this.error = error
        this.data = null
        this.success = false
        
    }

}

export default ApiError