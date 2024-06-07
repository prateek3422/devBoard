import crypto from 'crypto';


export const generateOtp = (length: number = 6) =>{
  if (length <= 0) {
    throw new Error('Length must be a positive number');
}

const otpBytes = crypto.randomBytes(length);
let otp = '';

for (let i = 0; i < length; i++) {
    // Convert each byte to a number between 0-9
    otp += (otpBytes[i] % 10).toString();
}

return parseInt(otp);
}



  export const expairyToken = 20*1000*60 //20min