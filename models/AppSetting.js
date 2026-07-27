const mongoose = require('mongoose');

const appSettingSchema = new mongoose.Schema({

    appName:{
        type:String,
        default:"SS Builds"
    },

    logo:{
        type:String,
        default:""
    },

     // ✅ NEW
  password: {
    type: String,
    default: "123456"
  },

    settings:[

        {

            label:String,

            value:String

        }

    ]

});

module.exports=mongoose.model("AppSetting",appSettingSchema);