var server = null;
server = "https://" + "192.168.69.1" + ":8089/janus";
var janus = null;
var vmailtest = null;
var opaqueId = "voicemailtest-"+Janus.randomString(12);

var started = false;
var spinner = null;

var myusername = null;
var myid = null;
var audioenabled = false;


$(document).ready(function() {
	// Initialize the library (all console debuggers enabled)
	Janus.init({debug: "all", callback: function() {
		// Use a button to start the demo
		$('#start').click(function() {
			if(started)
				return;
			started = true;
			$(this).attr('disabled', true).unbind('click');
			// Make sure the browser supports WebRTC
			if(!Janus.isWebrtcSupported()) {
				bootbox.alert("No WebRTC support... ");
				return;
			}
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
		});
	}});
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
