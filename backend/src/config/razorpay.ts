import Razorpay from "razorpay";
import config from "./index.js";

const razorpay = new Razorpay({
    key_id:config.RAZORPAY_API_KEY ,
    key_secret: config.RAZORPAY_SECRET 
});

export default razorpay;