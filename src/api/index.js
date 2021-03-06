
const commitSkill = require('./commitSkill');
const express = require('express');
const bodyParser= require('body-parser')
const cookieParser = require('cookie-parser');
var session = require('express-session')
require('dotenv').config()
let config = require('./config');
const path = require('path');
const fs = require('fs'),
    http = require('http'),
    https = require('https')
var flash = require('connect-flash');
var md5 = require('md5');
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
var cors = require('cors')
var proxy = require('express-http-proxy');
var JWT = require('jsonwebtoken');
var WebSocketServer = require('websocket').server;

var stream = require('stream') 
var Readable = stream.Readable;

var getGoogleDetector = require('./getGoogleDetector') 
var getIbmDetector = require('./getIbmDetector') 
var {getDeepSpeechDetector, getDeepSpeechModel} = require('./getDeepSpeechDetector') 
var JWT = require('jsonwebtoken');
//console.log("PRECONNECT")    
try {
    //mongoose.connect(config.databaseConnection+config.database, {useNewUrlParser: true})
} catch (e) {
    console.log(e)
    throw e
}
//console.log("POSTCONNECT")    
const {skillsSchema, skillTagsSchema, entitiesSchema, utterancesSchema, regexpsSchema} = require('./schemas')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var d = new Date()
const ACCOUNTING_FILE = (process.env.ASR_ACCOUNTING_FOLDER ? process.env.ASR_ACCOUNTING_FOLDER : '../') + 'asr-accounting-'+d.getMonth()+'-'+d.getFullYear()+'.json'
const BILLING_FILE = (process.env.ASR_ACCOUNTING_FOLDER ? process.env.ASR_ACCOUNTING_FOLDER : '../') + 'asr-billing.json'


//function getUserFromAccessToken(bearerToken,secret) {
   //return new Promise(function(resolve,reject) {
        //return JWT.verify(bearerToken, secret, function(err, decoded) {
            //if (err) {
              //resolve(err, false);   // the err contains JWT error data
            //}
            //resolve(false,decoded.user)
        //});
   //})
//}
var accountingChanged = false
var accounting = {}
var billing = {}
    

function startWebSocketAsr(server) {
    //console.log('START WEBSOCKT')
    //console.log([config])
    var model = getDeepSpeechModel()
    function logTranscription(val) {
        //console.log(['logTranscription',val])
        if (val) {
             //console.log(['logTranscription have val',val])
            var {skill, duration, type} = val
            if (skill && duration && type) {
                 //console.log(['logTranscription have all',skill,duration,type])
                var currentSite = accounting[skill] ? accounting[skill] : {}
                var currentSiteMethod =currentSite[type] ? currentSite[type] : {}
                var currentBillingChunks = currentSiteMethod && currentSiteMethod.chunks > 0 ? currentSiteMethod.chunks : 0
                var currentDuration = currentSiteMethod && currentSiteMethod.duration > 0 ? currentSiteMethod.duration : 0
                
                if (duration > 0) {
                    //console.log(['duration ',duration])
                    var billingChunks = currentBillingChunks + parseInt(duration / 15) + 1
                    var duration = currentDuration + duration
                    currentSite[type] = {duration: duration, chunks: billingChunks}
                    //console.log(['currentSIte ',currentSite, accounting])
                    accounting[skill] = currentSite
                    accountingChanged = true
                }
            }
        }
        //console.log(['DONE logTranscription',JSON.stringify(accounting)])
    }
    try {
        accounting = JSON.parse(fs.readFileSync(ACCOUNTING_FILE))
        console.log(['load accounting',JSON.stringify(accounting)])
    } catch (e) {
        console.log(e)
    }
    
    try {
        billing = JSON.parse(fs.readFileSync(BILLING_FILE))
        console.log(['load billing',JSON.stringify(billing)])
    } catch (e) {
        console.log(e)
    }
    
    
    setInterval(function() {
       if (accountingChanged) {
        console.log(['save accounting',JSON.stringify(accounting)])
           fs.writeFileSync(ACCOUNTING_FILE,JSON.stringify(accounting))
           accountingChanged = false
       } 
    },2000)
    
        
   wsServer = new WebSocketServer({
        httpServer: server,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });
     
   
    wsServer.on('connect', function(request) {
        //console.log(['WS connect'])
    })
    
    wsServer.on('close', function(request) {
        //console.log(['WS close'])
        //clearTimeouts()
    })
     
    wsServer.on('request', function(request) {
        console.log(['WS request'])
        if (!originIsAllowed(request.origin)) {
          // Make sure we only accept requests from an allowed origin
          request.reject();
          console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
          return;
        }

        
        var silenceTimeout = null
        var maxTimeout = null
         
        var connection = null
        var detector = null 
        var token = null
        
        function cleanup() {
            clearTimeouts()
            try {
                if (detector) {
                    //console.log(JSON.stringify(detector,false,2))
                    //if (detector.write) {
                        //console.log('wrote stop f')
                        //// for ibm
                        ////detector.write(JSON.stringify({action: 'stop'}))
                    //}
                    if (detector.pause) detector.pause()
                    if (detector.destroy) detector.destroy()
                }
                if (connection) {
                    connection.close()
                }
            } catch (e) {
                console.log(e)
            }
            
        }
        
        function createMaxTimeout() {
            maxTimeout = setTimeout(function() {
                console.log('SERVER MAX TIMEOUT')
                cleanup()
            },10000)
        }

        function clearMaxTimeout() {
            if (maxTimeout) clearTimeout(maxTimeout)
            maxTimeout = null
        }

        function createSilenceTimeout() {
            silenceTimeout = setTimeout(function() {
                console.log('SERVER SILENCE TIMEOUT')
                cleanup()
            },3000)
        }

        function clearSilenceTimeout() {
            if (silenceTimeout) clearTimeout(silenceTimeout)
            silenceTimeout = null
        }

        function clearTimeouts() {
            clearSilenceTimeout()
            clearMaxTimeout()
        }

        function originIsAllowed(origin) {
            //return true
            if (config.websocketAsr && Array.isArray(config.websocketAsr.allowedOrigins)) {
                if (config.websocketAsr.allowedOrigins.indexOf(origin) !== -1) {
                    return true
                }
            } 
          // put logic here to detect whether the specified origin is allowed.
          return false;
        }
        

        clearTimeouts()
        createSilenceTimeout()
        createMaxTimeout()
        
        connection = request.accept('asr-audio', request.origin);
        console.log((new Date()) + ' Connection accepted.');
        //console.log(['dsmodel',model])
        
        var detector = null
        var detectorCreated = false
        var audioIn = null
        audioIn = new Readable()
        audioIn._read = () => {} // _read is required but you can noop it
        console.log('create detector')                    
        //detector = getIbmDetector(connection, logTranscription, 'sss')
        ////detector = getDeepSpeechDetector(connection, model, logTranscription, 'sss') 
        //if (detector) audioIn.pipe(detector)	
        
        connection.on('message', function(message) {
            //console.log(['Received Message: ',message]);
            if (message.type === 'utf8') {
                //console.log(['Received Text Message: ' + message.utf8Data,detectorCreated]);
                if (!detectorCreated && !detector) {
                    detectorCreated = true
                            
                    var data = {}
                    try {
                        data = JSON.parse(message.utf8Data)
                        //console.log(['ddd Text Message: ' ,JSON.stringify(data),config.jwtAccessTokenSecret]);
                        
                        function createProcessorForSkill(data,user) {
                            var detector = null
                            var billingKey = user && user.username ? user.username : null
                            if (billingKey) {
                                console.log('create detector')
                                audioIn = new Readable()
                                audioIn._read = () => {} // _read is required but you can noop it
                                
                                // default plan
                                var billingData = billing.hasOwnProperty(billingKey) ? billing[billingKey] : {google:{chunks:0}, ibm:{duration:0}, deepspeech:{duration:1200}}
                                
                                var accountingData = accounting.hasOwnProperty(billingKey) ? accounting[billingKey] : {google:{chunks:0}, ibm:{duration:0}, deepspeech:{duration:0}}
                                
                                var googleChunks = accountingData && accountingData.google && accountingData.google.chunks ? accountingData.google.chunks : 0
                                var ibmDuration = accountingData && accountingData.ibm && accountingData.ibm.duration ? accountingData.ibm.duration : 0
                                var deepspeechDuration = accountingData && accountingData.deepspeech && accountingData.deepspeech.duration ? accountingData.deepspeech.duration : 0
                                
                                console.log([googleChunks, ibmDuration, deepspeechDuration])
                                console.log([(billingData && billingData.google  && billingData.google.chunks > 0  && billingData.google.chunks > googleChunks) ? 'tt' : 'ff',
                                (billingData && billingData.ibm && billingData.ibm.duration > 0 && billingData.ibm.duration > ibmDuration) ? 'tt' : 'ff'])
                                console.log([billingData,accountingData])
                                if (false && billingKey && data.token && data.token.trim()) {
                                    console.log('USE GOOGLE by login')
                                    detector = getGoogleDetector(connection, logTranscription, billingKey)
                                } else if (billingData.google && billingData.google.chunks > 0 && billingData.google.chunks > googleChunks) {
                                    console.log('USE GOOGLE from skill')
                                    detector = getGoogleDetector(connection, logTranscription, billingKey)
                                } else if (billingData.ibm && billingData.ibm.duration > 0 && billingData.ibm.duration > ibmDuration) {
                                    console.log('USE IBM from skill')
                                    detector = getIbmDetector(connection, logTranscription, billingKey)
                                } else  {
                                    console.log(['try ds'])
                                    if (billingData.deepspeech && billingData.deepspeech.duration > 0) {
                                        var usedSeconds = accountingData.deepspeech && accountingData.deepspeech.duration ? accountingData.deepspeech.duration : 0
                                        if (usedSeconds < billingData.deepspeech.duration) {
                                            console.log('1 USE DEEPSPEECH')
                                            detector = getDeepSpeechDetector(connection, model, logTranscription, billingKey) 
                                        } else {
                                            connection.close()
                                        }
                                    } else {
                                        connection.close()
                                    }
                                }
                            } else {
                                console.log('ANON USE DEEPSPEECH')
                                detector = getDeepSpeechDetector(connection, model, logTranscription, billingKey) 
                            }
                            if (detector) audioIn.pipe(detector)	
                            return detector
                        }
                        
                        if (data.token) {
                            try {
                                function getUserFromAccessToken(bearerToken, secret) {
                                    return JWT.verify(bearerToken, secret, function(err, decoded) {
                                        if (err) {
                                          console.log(['verify err',err]);   // the err contains JWT error data
                                        } else {
                                            console.log(['user from access token',decoded]) 
                                            createProcessorForSkill(data, decoded && decoded.user ? decoded.user : {})
                                        }
                                    })
                                }
                                
                                var secret = config && config.websocketAsr && config.websocketAsr.loginSecret ? config.websocketAsr.loginSecret : ''
                                //console.log('secret'+secret)
                                getUserFromAccessToken(data.token,secret)
                                //.then(function(user) {
                                  //console.log(['user from access token',user])  
                                //})
                            } catch (e) {
                                console.log(e)
                            }
                                                    
                            //detector = getIbmDetector(connection, logTranscription, billingKey)
                            //detector = getDeepSpeechDetector(connection, model, logTranscription, billingKey) 
                            if (detector) audioIn.pipe(detector)	
                        } else {
                            createProcessorForSkill(data, null)
                        }
                        // audio to stream - pushed to when audio packet arrives
                        
                    } catch (e) {
                        console.log(e)
                    }
                }
                //////connection.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                
                clearSilenceTimeout()
                createSilenceTimeout()
                //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                //connection.sendBytes(message.binaryData);
                if (audioIn) {
                    //console.log('Pushed Binary Message of ' + message.binaryData.length + ' bytes');
                    audioIn.push(message.binaryData)
                }
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            cleanup()
            
        });
        connection.on('error', function(reasonCode, description) {
            console.log([(new Date()) + ' Peer ' + connection.remoteAddress + ' error.',description]);
            cleanup()
        });
    });

}


function startMainWebServer() {
    if (!config.skipWWW) {
        var staticPath = __dirname.split("/")
        staticPath.pop()
        staticPath.pop()
        //console.log(staticPath)
        const app2 = express();
       // console.log(JSON.stringify(process.env))
         if (process.env.proxyDev !== "TRUE" && fs.existsSync(path.join(staticPath.join("/"), 'docs', 'index.html'))) {
            console.log('serve www')
             app2.use(express.static(path.join(staticPath.join("/"), 'docs')));
             app2.get('/*', function (req, res) {
               res.sendFile(path.join(staticPath.join("/"), 'docs', 'index.html'));
             });
          } else {
            console.log('PROXY www DEV')
            //// proxy to 3000 in dev mode
            app2.use('/', proxy('http://localhost:3000'));
         }
        console.log(['ssl',config.sslKeyFile,config.sslCertFile])
         if (config.sslKeyFile && config.sslKeyFile.trim() && config.sslCertFile && config.sslCertFile.trim() && fs.existsSync(config.sslCertFile) && fs.existsSync(config.sslKeyFile)) {
            var port=443
            console.log(['PORT',port])
            var key = fs.readFileSync(config.sslKeyFile)
            var cert = fs.readFileSync(config.sslCertFile)
           // console.log([key,cert])
            https.createServer({
                key: key,
                cert: cert,
            }, app2).listen(port, () => {
                console.log(`OpenNLU WWW listening securely at https://localhost:${port}`)
                
            })
         } else {
            var port=80
            app.listen(port, () => {
              console.log(`OpenNLU WWW listening at http://localhost:${port}`)
            })
         }
    } else {
        console.log('main www disabled')
    }

}

var loginSystem = require('express-oauth-login-system-server')

loginSystem(config).then(function(login) {
    const loginRouter = login.router
    const authenticate = login.authenticate
    const csrf = login.csrf
    var router = express.Router();
    
    
    function checkMedia(req,res,next) {
        let cookie = req.cookies['access-token'] ? req.cookies['access-token']  : '';
        let parameter = req.query._media ? req.query._media : (req.body._media ? req.body._media : '')
        if (md5(cookie) === parameter) {
            next()
        } else {
            res.send({error:'media check failed'})
        }
    }

    //// use media authentication with cookie and req parameter because media element cannot send auth in header.
    //router.use('/api/protectedimage',cors(),csrf.checkToken, checkMedia,function (req,res) {
        //const stream = fs.createReadStream(__dirname + '/lock.jpg')
        //stream.pipe(res)
    //});


    //router.use('/api/csrfimage',cors(),csrf.checkToken,function (req,res) {
        //const stream = fs.createReadStream(__dirname + '/protect.jpg')
        //stream.pipe(res)
    //});

    //// An api endpoint that returns a short list of items
    //router.use('/api/getlist',cors(), authenticate, (req,res) => {
        //var list = ["item1", "item2", "item3"];
        //res.send([{items:list}]);
    //});

    var options = {
        findOneAndUpdate: false,
        allowRegexp: false,
         // only owners can create and update
         
        preCreate: (req, res, next) => {
            var loginUser = res.locals && res.locals.oauth && res.locals.oauth.token && res.locals.oauth.token.user ? res.locals.oauth.token.user : {}
            ////console.log(['PRECREATE ',loginUser, res.locals, res.body])
            if (loginUser && loginUser._id) { 
                req.body.created_date = new Date().getTime();
                req.body.updated_date = new Date().getTime();
                req.body.user = loginUser._id
                req.body.userAvatar = loginUser.avatar
                ////console.log(['PRECREATEdd ',req.body.tags])
                //if (req.body.tags) {
                    //skillTagModel = mongoose.model('SkillTags',skillTagsSchema)
                    //skillTagModel.insertMany(req.body.tags.map(function(tag) { return {tag:tag}  }), {ordered: true}).then(function(res) {
                      //////console.log(['INSERTED TAGS',res])  
                    //})
                //}
               
                next()
            } else {
                return res.sendStatus("401") // not authenticated
            }
        },
        
        preUpdate: (req, res, next) => {
            var loginUser = res.locals && res.locals.oauth && res.locals.oauth.token && res.locals.oauth.token.user ? res.locals.oauth.token.user : {}
            ////console.log(['PREUPDATE',loginUser,res.locals, res.body])
            if (loginUser&& loginUser._id) { 
                req.body.updated_date = new Date().getTime();
                req.body.user = loginUser._id
                req.body.userAvatar = loginUser.avatar
                ////console.log(['PREUPDATEdd ',req.body.tags])
                //if (req.body.tags) {
                    //skillTagModel = mongoose.model('SkillTags',skillTagsSchema)
                    //skillTagModel.insertMany(req.body.tags.map(function(tag) { return {tag:tag}  }), {ordered: true}).then(function(res) {
                      //////console.log(['INSERTED TAGS',res])  
                    //})
                //}
                //if ()
                
                next()
            } else {
                return res.sendStatus("401") // not authenticated
            }
        },
        
        preDelete: (req, res, next) => {
          var loginUser = res.locals && res.locals.oauth && res.locals.oauth.token && res.locals.oauth.token.user ? res.locals.oauth.token.user : {}
            
            if (loginUser&& loginUser._id) { 
                //////console.log(['NOW GIT RM',skill])
                
                next()
            } else {
                return res.sendStatus("401")
            }
        }, 

        postCreate: (req, res, next) => {
            const skill = req.erm.result         // unfiltered document or object
            const statusCode = req.erm.statusCode // 201 created OK

            commitSkill(skill).then(result => {
              ////console.log(result)
              next()
            }).catch(err => {
              console.error(err)
              next(err)
            })
        }, 
        
        postUpdate: (req, res, next) => {
          const skill = req.erm.result         // unfiltered document or object
          const statusCode = req.erm.statusCode // 200 updated OK

          commitSkill(skill).then(result => {
              ////console.log(result)
              next()
            }).catch(err => {
              console.error(err)
              next(err)
            })
        },
        
        postDelete: (req, res, next) => {
          const skill = req.erm.result         // unfiltered document or object
          const statusCode = req.erm.statusCode // 204 deleted OK
          ////console.log(['POSTDELETE', req.url])
            var parts = req.url.split("/")
            var id = parts[parts.length - 1]
            commitSkill({_id: id}, true).then(result => {
                  ////console.log(result)
                  next()
                }).catch(err => {
                  console.error(err)
                  next(err)
                })
        }
        

    }
    //var skillOptions = JSON.parse(JSON.stringify(options))
    //skill.options.pre
    
    var restifyRouter = express.Router();
    restify.serve(restifyRouter, mongoose.model('Skill',skillsSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('Entities',entitiesSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('Utterance',utterancesSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('Regexp',regexpsSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('SkillTags',skillTagsSchema ), {
        //preCreate: function(req,res,next) {return res.sendStatus("401")}, // not authenticated
        //preUpdate: function(req,res,next) {return res.sendStatus("401")}, // not authenticated
        //preDelete: function(req,res,next) {return res.sendStatus("401")} // not authenticated
    //})
    // SSL
    // allow self generated certs
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    //var options = {
        //key: fs.readFileSync('./key.pem'),
        //cert: fs.readFileSync('./certificate.pem'),
    //};

    //var webServer = https.createServer(options, app).listen(port, function(){
      //////console.log("Express server listening on port " + port);
    //});
    const app = express();
    app.use(cors())
    app.use(methodOverride())
    app.use(bodyParser.json());
    app.use(cookieParser());
    // session required for twitter login
    app.use(session({ secret: config.sessionSalt ? config.sessionSalt : 'board GOAT boring do boat'}));
    //app.use('/static', express.static(path.join(__dirname, 'loginpages','build','static')))

    //app.use('/login/*', express.static(path.join(__dirname, 'loginpages','build')))
    var loginWWW = '../../react-express-oauth-login-system' //path.dirname(require.resolve('react-express-oauth-login-system'))
    var staticPath = __dirname.split("/")
    staticPath.pop()
    staticPath.pop()
    staticPath.pop()
    staticPath.push('react-express-oauth-login-system')
    console.log(staticPath)
    if (fs.existsSync(path.join(staticPath.join('/'),  'build', "index.html"))) {
        console.log(['NPATH custom',path.join(staticPath.join('/'),  'build', "index.html")])
        
    } else {
        // fallback to build from installed package
        console.log(['NPATH',loginWWW])
        staticPath = loginWWW.split("/")
        staticPath.pop()
        staticPath.pop()
    }
    if (fs.existsSync(path.join(staticPath.join('/'),  'build', "index.html") )) {
        console.log('SERVE BUILD')
        // serve build folder
        app.use('/static', express.static(path.join(staticPath.join('/'),  'build', 'static')))
        app.use('/login/*', express.static(path.join(staticPath.join('/'),  'build' )))
        
        app.get('/*', express.static(path.join(staticPath.join('/'),  'build' )))
        app.get('/',cors(), (req, res) => {
            //console.log(["TEMPL",path.join(staticPath.join('/'),  'build', "index.html"),__dirname])
            res.sendFile(path.join(staticPath.join('/'),  'build', "index.html"));
        })
        app.get('/login',cors(), (req, res) => {
            //console.log(["TEMPL",path.join(staticPath.join('/'),  'build', "index.html"),__dirname])
            res.sendFile(path.join(staticPath.join('/'),  'build', "index.html"));
        })
        app.get('/profile',cors(), (req, res) => {
            //console.log(["TEMPL",path.join(staticPath.join('/'),  'build', "index.html"),__dirname])
            res.sendFile(path.join(staticPath.join('/'),  'build', "index.html"));
        })
        app.get('/logout',cors(), (req, res) => {
            //console.log(["TEMPL",path.join(staticPath.join('/'),  'build', "index.html"),__dirname])
            res.sendFile(path.join(staticPath.join('/'),  'build', "index.html"));
        })
        app.get('/blank',cors(), (req, res) => {
            //console.log(["TEMPL",path.join(staticPath.join('/'),  'build', "index.html"),__dirname])
            res.sendFile(path.join(staticPath.join('/'),  'build', "index.html"));
        })
    } else {
        console.log("MISSING WWW FILES")
    }
    
    app.use('/api/login',loginRouter);
    app.use(router);
    app.use('/public',cors(),restifyRouter);
    app.use("/",authenticate, cors(), restifyRouter);
    router.use('/',function(req,res,next) {
        console.log(['URL',req.url]); //,req.cookies,req.headers
        next()
    });
    
    //router.get('/',cors(), (req, res) => {
      //res.sendFile(path.join(__dirname,  'loginpages','build', "index.html"));
    //})

    //router.get('/login', (req,res,next) => {
        //res.sendFile(path.join(__dirname,  'loginpages','build', "index.html"));
    //})

    //app.get("/login*", (req, res) => {
      ////res.sendFile(path.join(__dirname, "loginapp"));
        //console.log(['lF',req.url,req])
        //res.send('AAA')
    //});
    
    //router.get('/login', (req,res,next) => {
        //res.sendFile(path.join(__dirname, "loginapp", "index.html"));
    //})
    
    
    router.get('/loginsuccess', (req,res,next) => {
        res.send("loginpage succ")
    })
    
    router.get('/loginfail', (req,res,next) => {
        res.send("loginpage fail")
    })

    //router.use('/api',function (req,res) {
        //////console.log('API')
        //res.send({error:'Invalid request'})
    //});

    app.use(function (err, req, res, next) {
        //console.log('ERR');
        //console.log(err);
        res.sendStatus("500")
    });
    //console.log(['LPROUTE',path.join(__dirname, 'loginapp')])
    //app.use('/loginpage', express.static(path.join(__dirname, 'loginapp')))
    var options = {}
    let port=config.authServerPort ? String(parseInt(config.authServerPort))  : '5000'
    //app.listen(port, () => {
      ////console.log(`opennludata listening at http://localhost:${port}`)
    //})
    //sudo certbot certonly --standalone -d auth.opennludata.org -d api.opennludata.org
    if (config.sslKeyFile && config.sslKeyFile.trim() && config.sslCertFile && config.sslCertFile.trim()) {
        startWebSocketAsr(https.createServer({
            key: fs.readFileSync(config.sslKeyFile),
            cert: fs.readFileSync(config.sslCertFile),
        }, app).listen(port, () => {
          console.log(`OpenNLU listening securely at https://localhost:${port}`)
          startMainWebServer()
        }))
    } else {
        app.listen(port, () => {
          console.log(`OpenNLU listening at http://localhost:${port}`)
          startMainWebServer()
        })
    }
})
