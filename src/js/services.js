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
    
    
     tokenAuthApp.service('startSipgateway',['$http',function startVoicemail($http) {
    this.sipgateway = function(server3){  	
     var server = null;
     server = "https://" + "192.168.69.1" + ":8089/janus";
     
     var janus = null;
     var vmailtest = null;
     var opaqueId = "sipgateway-"+Janus.randomString(12);
     var started = false;
     var spinner = null;
     var selectedApproach = null;
     var registered = false;
     var incoming = null;

         
     
     janus = new Janus(
				{
					server: server,
					success: function() {
						// Attach to echo test plugin
						janus.attach(
							{
								plugin: "janus.plugin.sipre",
								opaqueId: opaqueId,
								success: function(pluginHandle) {
									$('#details').remove();
									sipcall = pluginHandle;
									Janus.log("Plugin attached! (" + sipcall.getPlugin() + ", id=" + sipcall.getId() + ")");
									// Prepare the username registration
									$('#sipcall').removeClass('hide').show();
									$('#login').removeClass('hide').show();
									$('#registerlist a').unbind('click').click(function() {
										selectedApproach = $(this).attr("id");
										$('#registerset').html($(this).html()).parent().removeClass('open');
										if(selectedApproach === "guest") {
											$('#password').empty().attr('disabled', true);
										} else {
											$('#password').removeAttr('disabled');
										}
										switch(selectedApproach) {
											case "secret":
												bootbox.alert("Using this approach you'll provide a plain secret to REGISTER");
												break;
											case "guest":
												bootbox.alert("Using this approach you'll try to REGISTER as a guest, that is without providing any secret");
												break;
											default:
												break;
										}
										return false;
									});
									$('#register').click(registerUsername);
									$('#server').focus();
									$('#start').removeAttr('disabled').html("Stop")
										.click(function() {
											$(this).attr('disabled', true);
											janus.destroy();
										});
								},
								error: function(error) {
									Janus.error("  -- Error attaching plugin...", error);
									bootbox.alert("  -- Error attaching plugin... " + error);
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
									Janus.debug(msg);
									// Any error?
									var error = msg["error"];
									if(error != null && error != undefined) {
										if(!registered) {
											$('#server').removeAttr('disabled');
											$('#username').removeAttr('disabled');
											$('#authuser').removeAttr('disabled');
											$('#displayname').removeAttr('disabled');
											$('#password').removeAttr('disabled');
											$('#register').removeAttr('disabled').click(registerUsername);
											$('#registerset').removeAttr('disabled');
										} else {
											// Reset status
											sipcall.hangup();
											$('#dovideo').removeAttr('disabled').val('');
											$('#peer').removeAttr('disabled').val('');
											$('#call').removeAttr('disabled').html('Call')
												.removeClass("btn-danger").addClass("btn-success")
												.unbind('click').click(doCall);
										}
										bootbox.alert(error);
										return;
									}
									var result = msg["result"];
									if(result !== null && result !== undefined && result["event"] !== undefined && result["event"] !== null) {
										var event = result["event"];
										if(event === 'registration_failed') {
											Janus.warn("Registration failed: " + result["code"] + " " + result["reason"]);
											$('#server').removeAttr('disabled');
											$('#username').removeAttr('disabled');
											$('#authuser').removeAttr('disabled');
											$('#displayname').removeAttr('disabled');
											$('#password').removeAttr('disabled');
											$('#register').removeAttr('disabled').click(registerUsername);
											$('#registerset').removeAttr('disabled');
											bootbox.alert(result["code"] + " " + result["reason"]);
											return;
										}
										if(event === 'registered') {
											Janus.log("Successfully registered as " + result["username"] + "!");
											$('#you').removeClass('hide').show().text("Registered as '" + result["username"] + "'");
											// TODO Enable buttons to call now
											if(!registered) {
												registered = true;
												$('#phone').removeClass('hide').show();
												$('#call').unbind('click').click(doCall);
												$('#peer').focus();
											}
										} else if(event === 'calling') {
											Janus.log("Waiting for the peer to answer...");
											// TODO Any ringtone?
											$('#call').removeAttr('disabled').html('Hangup')
												  .removeClass("btn-success").addClass("btn-danger")
												  .unbind('click').click(doHangup);
										} else if(event === 'incomingcall') {
											Janus.log("Incoming call from " + result["displayname"] + " (" + result["username"] + ")!");
											var doAudio = true, doVideo = true;
											var offerlessInvite = false;
											if(jsep !== null && jsep !== undefined) {
												// What has been negotiated?
												doAudio = (jsep.sdp.indexOf("m=audio ") > -1);
												doVideo = (jsep.sdp.indexOf("m=video ") > -1);
												Janus.debug("Audio " + (doAudio ? "has" : "has NOT") + " been negotiated");
												Janus.debug("Video " + (doVideo ? "has" : "has NOT") + " been negotiated");
											} else {
												Janus.log("This call doesn't contain an offer... we'll need to provide one ourselves");
												offerlessInvite = true;
												// In case you want to offer video when reacting to an offerless call, set this to true
												doVideo = false;
											}
											// Any security offered? A missing "srtp" attribute means plain RTP
											var rtpType = "";
											var srtp = result["srtp"];
											if(srtp === "sdes_optional")
												rtpType = " (SDES-SRTP offered)";
											else if(srtp === "sdes_mandatory")
												rtpType = " (SDES-SRTP mandatory)";
											// Notify user
											bootbox.hideAll();
											var extra = "";
											if(offerlessInvite)
												extra = " (no SDP offer provided)";
											incoming = bootbox.dialog({
												message: "Incoming call from " + result["displayname"] + " (" + result["username"] + ")!" + rtpType + extra,
												title: "Incoming call",
												closeButton: false,
												buttons: {
													success: {
														label: "Answer",
														className: "btn-success",
														callback: function() {
															incoming = null;
															$('#peer').val(result["username"]).attr('disabled', true);
															// Notice that we can only answer if we got an offer: if this was
															// an offerless call, we'll need to create an offer ourselves
															var sipcallAction = (offerlessInvite ? sipcall.createOffer : sipcall.createAnswer);
															sipcallAction(
																{
																	jsep: jsep,
																	media: { audio: doAudio, video: doVideo },
																	success: function(jsep) {
																		Janus.debug("Got SDP " + jsep.type + "! audio=" + doAudio + ", video=" + doVideo);
																		Janus.debug(jsep);
																		var body = { request: "accept" };
																		// Note: as with "call", you can add a "srtp" attribute to
																		// negotiate/mandate SDES support for this incoming call.
																		// The default behaviour is to automatically use it if
																		// the caller negotiated it, but you may choose to require
																		// SDES support by setting "srtp" to "sdes_mandatory", e.g.:
																		//		var body = { request: "accept", srtp: "sdes_mandatory" };
																		// This way you'll tell the plugin to accept the call, but ONLY
																		// if SDES is available, and you don't want plain RTP. If it
																		// is not available, you'll get an error (452) back.
																		sipcall.send({"message": body, "jsep": jsep});
																		$('#call').removeAttr('disabled').html('Hangup')
																			.removeClass("btn-success").addClass("btn-danger")
																			.unbind('click').click(doHangup);
																	},
																	error: function(error) {
																		Janus.error("WebRTC error:", error);
																		bootbox.alert("WebRTC error... " + JSON.stringify(error));
																		// Don't keep the caller waiting any longer, but use a 480 instead of the default 486 to clarify the cause
																		var body = { "request": "decline", "code": 480 };
																		sipcall.send({"message": body});
																	}
																});
														}
													},
													danger: {
														label: "Decline",
														className: "btn-danger",
														callback: function() {
															incoming = null;
															var body = { "request": "decline" };
															sipcall.send({"message": body});
														}
													}
												}
											});											
										} else if(event === 'accepting') {
											// Response to an offerless INVITE, let's wait for an 'accepted'
										} else if(event === 'progress') {
											Janus.log("There's early media from " + result["username"] + ", wairing for the call!");
											Janus.log(jsep);
											// Call can start already: handle the remote answer
											if(jsep !== null && jsep !== undefined) {
												sipcall.handleRemoteJsep({jsep: jsep, error: doHangup });
											}
											toastr.info("Early media...");
										} else if(event === 'accepted') {
											Janus.log(result["username"] + " accepted the call!");
											Janus.log(jsep);
											// Call can start, now: handle the remote answer
											if(jsep !== null && jsep !== undefined) {
												sipcall.handleRemoteJsep({jsep: jsep, error: doHangup });
											}
											toastr.success("Call accepted!");
										} else if(event === 'hangup') {
											if(incoming != null) {
												incoming.modal('hide');
												incoming = null;
											}
											Janus.log("Call hung up (" + result["code"] + " " + result["reason"] + ")!");
											bootbox.alert(result["code"] + " " + result["reason"]);
											// Reset status
											sipcall.hangup();
											$('#dovideo').removeAttr('disabled').val('');
											$('#peer').removeAttr('disabled').val('');
											$('#call').removeAttr('disabled').html('Call')
												.removeClass("btn-danger").addClass("btn-success")
												.unbind('click').click(doCall);
										}
									}
								},
								onlocalstream: function(stream) {
									Janus.debug(" ::: Got a local stream :::");
									Janus.debug(stream);
									$('#videos').removeClass('hide').show();
									if($('#myvideo').length === 0)
										$('#videoleft').append('<video class="rounded centered" id="myvideo" width=320 height=240 autoplay muted="muted"/>');
									Janus.attachMediaStream($('#myvideo').get(0), stream);
									$("#myvideo").get(0).muted = "muted";
									// No remote video yet
									$('#videoright').append('<video class="rounded centered" id="waitingvideo" width=320 height=240 />');
									if(spinner == null) {
										var target = document.getElementById('videoright');
										spinner = new Spinner({top:100}).spin(target);
									} else {
										spinner.spin();
									}
									var videoTracks = stream.getVideoTracks();
									if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
										// No webcam
										$('#myvideo').hide();
										$('#videoleft').append(
											'<div class="no-video-container">' +
												'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
												'<span class="no-video-text">No webcam available</span>' +
											'</div>');
									}
								},
								onremotestream: function(stream) {
									Janus.debug(" ::: Got a remote stream :::");
									Janus.debug(stream);
									if($('#remotevideo').length > 0) {
										// Been here already: let's see if anything changed
										var videoTracks = stream.getVideoTracks();
										if(videoTracks && videoTracks.length > 0 && !videoTracks[0].muted) {
											$('#novideo').remove();
											if($("#remotevideo").get(0).videoWidth)
												$('#remotevideo').show();
										}
										return;
									}
									$('#videoright').parent().find('h3').html(
										'Send DTMF: <span id="dtmf" class="btn-group btn-group-xs"></span>');
									$('#videoright').append(
										'<video class="rounded centered hide" id="remotevideo" width=320 height=240 autoplay/>');
									for(var i=0; i<12; i++) {
										if(i<10)
											$('#dtmf').append('<button class="btn btn-info dtmf">' + i + '</button>');
										else if(i == 10)
											$('#dtmf').append('<button class="btn btn-info dtmf">#</button>');
										else if(i == 11)
											$('#dtmf').append('<button class="btn btn-info dtmf">*</button>');
									}
									$('.dtmf').click(function() {
										if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
											// Send DTMF tone (inband)
											sipcall.dtmf({dtmf: { tones: $(this).text()}});
										} else {
											// Try sending the DTMF tone using SIP INFO
											sipcall.send({message: {request: "dtmf_info", digit: $(this).text()}});
										}
									});
									// Show the peer and hide the spinner when we get a playing event
									$("#remotevideo").bind("playing", function () {
										$('#waitingvideo').remove();
										if(this.videoWidth)
											$('#remotevideo').removeClass('hide').show();
										if(spinner !== null && spinner !== undefined)
											spinner.stop();
										spinner = null;
									});
									Janus.attachMediaStream($('#remotevideo').get(0), stream);
									var videoTracks = stream.getVideoTracks();
									if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0 || videoTracks[0].muted) {
										// No remote video
										$('#remotevideo').hide();
										$('#videoright').append(
											'<div id="novideo" class="no-video-container">' +
												'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
												'<span class="no-video-text">No remote video available</span>' +
											'</div>');
									}
								},
								oncleanup: function() {
									Janus.log(" ::: Got a cleanup notification :::");
									$('#myvideo').remove();
									$('#waitingvideo').remove();
									$('#remotevideo').remove();
									$('.no-video-container').remove();
									$('#videos').hide();
									$('#dtmf').parent().html("Remote UA");
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
						
		
                }
     }
        ]);
    
    
    
   tokenAuthApp.service('authService',['$http',function authService($http) {
    /*jshint validthis: true */
    const baseURL = 'https://mail.opentelecom.fr:8443/v2/';
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
        url: baseURL + 'accounts/aad22d58afe7650a6f9b640bffd73ac1/registrations',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });
    };
    this.choppeJanusToken = function(token) {
      return $http({
        method: 'GET',
        url: baseURL + 'accounts/aad22d58afe7650a6f9b640bffd73ac1/',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });
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
