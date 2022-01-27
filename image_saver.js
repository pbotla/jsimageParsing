const fs = require('fs');
const request = require('request');
const FileReader= require('filereader') 
const http = require("http")
var Tesseract = require('tesseract.js');
const Jimp= require("jimp");

function logFile(logmsg){
    if(logmsg == undefined)
        console.log("file saved")
    console.log(logmsg)
  }

function convertImage(file){
    file.close()
    Jimp.read(dest, function (err, image) {
        //If there is an error in reading the image, 
        //we will print the error in our terminal
        if (err) {
          console.log(err)
        } 
        //Otherwise we convert the image into PNG format 
        //and save it inside images folder using write() method.
        else {
          image.write("gfg.png")
        }
      })

    getTextfromImage("gfg.png")
}


const getelement = (element)=>{
    if(element.includes(":"))
        return element.split(":")

    if (element.includes("-"))
        return element.split("-")
    
    if (element.split("="))
        return element.split("=")
}

function getTextfromImage(file){
    console.log(typeof(file))
    Tesseract.recognize(file)
            //.progress(function  (p) { console.log('progress', p)  })
	        .catch(err => console.error(err))
	        .then(function (result) {
                console.log("texts",result.data.text)
                const texts = result.data.text

                if(texts.length > 1){
                let text_arr = texts.split("\n")
                let age_gender = []
                let house = []
                let fname = []
                let name = []
                let photo = ""

                text_arr.forEach((element, index)=> {
                    if(element.includes("Husband's Name") || element.includes("Father's Name")){
                        fname = getelement(element)
                        if(text_arr[index+2].includes("House Number"))
                            return;
                        else{
                            fname[1] = fname[1] + " "+ text_arr[index+2]
                            console.log(fname)
                            return;
                        }
                    }

                    if(element.includes("Name")){
                        name = getelement(element)
                        return;
                    }

                    if(element.includes("House Number")){
                        house = getelement(element)
                        return;
                    }

                    if(element.includes("Age")){
                        age_gender = getelement(element)
                        
                        if(age_gender[age_gender.length -1 ].includes("Available") || age_gender[age_gender.length -1 ].includes("Unavailable"))
                            photo = age_gender[age_gender.length -1].replace("FEMALE", "").replace("MALE", "")

                        return; 
                    }

                    if(element.includes("Available") || element.includes("Unavailable")){
                        photo = getelement(element)
                        photo = photo.toString().replace("FEMALE", "").replace("MALE", "")
                    }
                        
                });
                console.log("text_arr:",text_arr)
                console.log(age_gender,name, fname, house, photo)
                const text_obj = {
                    "fileno": text_arr[0],
                    "name": name[1],
                    "FathersName": `${fname[1]} `,
                    "HouseNumber": house[1].toString().replace("Photo is", ""),
                    "age": age_gender[1].replace("Sex", ""),
                    "gender": age_gender[2].replace("Photo is", "").replace("Available", "").replace("Unavailable", ""),
                    "photo": photo
                }

                console.log("text_obj",text_obj)
            }
            else{
                console.log("Image is blank")
            }
	            //process.exit(0)
	        })
}



const download = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);

    // verify response code
    sendReq.on('response', (response) => {

        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        sendReq.pipe(file);
    });

    // close() is async, call cb after close completes
    file.on('finish', () => convertImage(file));

    // check for request errors
    sendReq.on('error', (err) => {
        fs.unlink(dest);
        return cb(err.message);
    });

    file.on('error', (err) => { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};

var url = "http://54.87.15.252:9000/images"
var dest = "/opt/applocal/imageParsing/5.jpg"

download(url, dest, logFile)