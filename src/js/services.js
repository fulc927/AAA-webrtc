(function() {

  'use strict';
  var tokenAuthApp = angular.module('tokenAuthApp.services', []);
    
   tokenAuthApp.service('startVoicemail',['$http',function startVoicemail($http) {
    this.sebvoicemail = function(server2){  	
     var server = null;
     server = "https://" + "192.168.69.1" + ":8089/janus";
     
						//const digit = {data: {credentials: hash,realm:'opentelecom.fr'}};
      				//return $http({
        				//method: 'POST',
        				//url: server 
        				//data: digit,
        				//headers: {'apisecret': 'janusrocks'}
      				//});
      
     var janus = null;
     var vmailtest = null;
     var opaqueId = "voicemailtest-"+Janus.randomString(12);
     var started = false;
     var spinner = null;
     var myusername = null;
     var myid = null;
     var audioenabled = false;
     var apisecret = 'janussucks'
   	
			// Create session
			janus = new Janus(
				{
						
					server: server,
					success: function() {
						// Attach to Voice Mail test plugin
						janus.attach(
							{
								plugin: "janus.plugin.voicemail",
								opaqueId: opaqueId,
								success: function(pluginHandle) {
									$('#details').remove();
									vmailtest = pluginHandle;
									Janus.log("Plugin attached! (" + vmailtest.getPlugin() + ", id=" + vmailtest.getId() + ")");
									$('#voicemail').removeClass('hide').show();
									$('#start').removeAttr('disabled').html("Stop")
										.click(function() {
											$(this).attr('disabled', true);
											janus.destroy();
										});
									$('#record').removeAttr('disabled').html("Record")
										.click(function() {
											$(this).attr('disabled', true);
											startRecording();
										});
								},
								error: function(error) {
									Janus.error("  -- Error attaching plugin...", error);
									bootbox.alert("Error attaching plugin... " + error);
								},
								consentDialog: function(on) {
									Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
									if(on) {
										// Darken screen and show hint
										$.blockUI({ 
											message: '<div><img src="up_arrow.png"/></div>',
											css: {
												border: 'none',
												padding: '15px',
												backgroundColor: 'transparent',
												color: '#aaa',
												top: '10px',
												left: (navigator.mozGetUserMedia ? '-100px' : '300px')
											} });
									} else {
										// Restore screen
										$.unblockUI();
									}
								},
								onmessage: function(msg, jsep) {
									Janus.debug(" ::: Got a message :::");
									Janus.debug(JSON.stringify(msg));
									var event = msg["voicemail"];
									Janus.debug("Event: " + event);
									if(event != undefined && event != null) {
										if(event === "event") {
											if(msg["status"] !== undefined && msg["status"] !== null) {
												var status = msg["status"];
												if(status === 'starting') {
													$('#record')
														.removeClass("btn-danger").addClass("btn-default")
														.text("Starting, please wait...");
												} else if(status === 'started') {
													$('#record')
														.removeClass("btn-default").addClass("btn-info")
														.text("Started");
												} else if(status === 'done') {
													$('#record')
														.removeClass("btn-info").addClass("btn-success")
														.text("Done!");
													$('#download').attr('href', msg["recording"]);
													$('#listen').click(function() {
														$('#rec').remove();
														$('#done').parent().append(
															'<audio id="rec" style="width:100%;height:100%;" autoplay controls preload="auto">' +
																'<source id="opusrec" src="' + msg["recording"] + '" type="audio/ogg""></source>' +
																'Your browser doesn\'t support the playout of Opus files' +
															'</audio>'
														);
														$('#opusrec').attr('type', 'audio/ogg; codecs="opus"');
														if($('#opusrec').get(0).error) {
															bootbox.alert("Couldn't play the Opus recording (" + $('#opusrec').get(0).error + "), try downloading it instead");
														}
														return false;
													});
													$('#done').removeClass('hide').show();
													vmailtest.hangup();
												}
											} else if(msg["error"] !== undefined && msg["error"] !== null) {
												bootbox.alert(msg["error"], function() {
													window.location.reload();
												});
											}
										}
									}
									if(jsep !== undefined && jsep !== null) {
										Janus.debug("Handling SDP as well...");
										Janus.debug(jsep);
										vmailtest.handleRemoteJsep({jsep: jsep});
									}
								},
								onlocalstream: function(stream) {
									// We're not going to attach the local audio stream
								},
								onremotestream: function(stream) {
									// We're not going to receive anything from the plugin
								},
								oncleanup: function() {
									Janus.log(" ::: Got a cleanup notification :::");
								}
							});
					},
					error: function(error) {
						Janus.error(error);
						bootbox.alert(error, function() {
							window.location.reload();
						});
					},
					destroyed: function() {
						window.location.reload();
					}
				});
		
      
     function startRecording() {
	   // Negotiate WebRTC now
	   vmailtest.createOffer(
		{
			media: { audioRecv: false, video: false},	// We're going to only send, and not receive, audio
			success: function(jsep) {
				Janus.debug("Got SDP!");
				Janus.debug(jsep);
				var publish = { "request": "record" };
				vmailtest.send({"message": publish, "jsep": jsep});
			},
			error: function(error) {
				Janus.error("WebRTC error:", error);
				bootbox.alert("WebRTC error... " + JSON.stringify(error));
			}
		});
     }
     };
    }
    ]);
    
   tokenAuthApp.service('authService',['$http',function authService($http) {
    /*jshint validthis: true */
    const baseURL = 'https://192.168.69.1:8443/v2/';
    this.login = function(user) {
      //console.log(user);
      function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17,  606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12,  1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7,  1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7,  1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22,  1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14,  643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9,  38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5,  568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20,  1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14,  1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16,  1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11,  1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4,  681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23,  76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16,  530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10,  1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6,  1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6,  1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21,  1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15,  718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);

      }

      function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
      }

      function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
      }

      function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
      }

      function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
      }

      function md51(s) {
        var txt = '';
        var n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i = 64; i <= s.length; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
        for (i = 0; i < s.length; i++)
        tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
      }

      function md5blk(s) { /* I figured global was faster.   */
        var md5blks = [], i; /* Andy King said do it this way. */
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);}
        return md5blks;
      }

      var hex_chr = '0123456789abcdef'.split('');

      function rhex(n) {
        var s = '', j = 0;
        for (; j < 4; j++)
          s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
      }

      function hex(x) {
        for (var i = 0; i < x.length; i++)
          x[i] = rhex(x[i]);
        return x.join('');
      }

      function md5(s) {
        return hex(md51(s));
      }

      function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
      }

      if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
        var hello = 'hello';
        //function add32(x, y) {
        //var lsw = (x & 0xFFFF) + (y & 0xFFFF),
        //msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        //return (msw << 16) | (lsw & 0xFFFF);
      }
      let hash = md5(user.username + ':' + user.password);
      const digit = {data: {credentials: hash,realm:'opentelecom.fr'}};
      return $http({
        method: 'PUT',
        url: baseURL + 'user_auth',
        data: digit,
        headers: {'Content-Type': 'application/json'}
      });
    };
    
    this.ensureAuthenticated = function(token) {
      return $http({
        method: 'GET',
        url: baseURL + 'accounts/e9eff1cac2c2a186af6fd4de74aaccb6/registrations',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });
    };
    this.choppeJanusToken = function(token) {
      return $http({
        method: 'GET',
        url: baseURL + 'accounts/e9eff1cac2c2a186af6fd4de74aaccb6/',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });
    };
    this.tokenJanus = function(user) {
      return $http({
        method: 'POST',
        url: server,
        data: {},
        headers: {
          'Content-Type': 'application/json',
          'janus': 'create',
          'transaction': 'ciea87euea978',
          'apisecret': 'janusrocks'
        }
      });
        //console.log($http);
        //console.log(user);
        ////console.log(server);
    };
    this.logoff = function() {
      localStorage.removeItem('token');
    };
    }]);
   
   tokenAuthApp.service('captureAmqp',[function captureAmqp() {
    this.amqp = function(token){  
    var socket = new WebSocket("wss://192.168.69.1:7777");

        function send(data) {
            socket.send(JSON.stringify(data));
        }

        socket.onopen = function() {
            send({
                action: 'subscribe',
                auth_token: token,
                request_id: 'whatthefuck254435232323072307823027',
                data: {
                    account_id: 'aad22d58afe7650a6f9b640bffd73ac1',
		    //working
                    //binding: 'call.CHANNEL_CREATE.*'
                    //binding: 'doc_created.*.user.*'
                    binding: 'from-janus'
                    //binding: 'authz.*'
                }
            });
    	  socket.onmessage = function(raw_message) {
            var json_data = JSON.parse(raw_message.data);

            console.log(json_data);
        };
       } 
       }
    	   }]);  
})();
