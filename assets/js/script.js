// prototype function to return an array of matched string ver2
String.prototype.matchAll = function(regexp) {
	var matches = [];
	this.replace(regexp, function() {
		var arr = ([]).slice.call(arguments, 0);
		var extras = arr.splice(-2);
		arr.index = extras[0];
		arr.input = extras[1];
		matches.push(arr);
	});
	return matches.length ? matches : null;
};
var PPC_MATCH = {

	/*Initialize all variables needed*/
	initialize : function(){
		PPC_MATCH.keysToMatch = [];
		PPC_MATCH.keysToFilterMatch = [];
		PPC_MATCH.keysToBeMatchedString = "";
		PPC_MATCH.keysToBeMatched = [];
		PPC_MATCH.restart();
	},

	// calling this function will restart all saved variables
	restart: function(){
		PPC_MATCH.isProcessing = false;

		PPC_MATCH.hasmatches = [];
		PPC_MATCH.nomatches = [];
		PPC_MATCH.negativeKeywords = [];
	},

	/* hopefully will stop every process on keypress*/
	stop: function(){
		PPC_MATCH.restart();
	},

	// sets the keywords to math variable
	// clean it before saving
	setkeysToMatch: function( string ){
		if( $.trim(string) ){
			PPC_MATCH.keysToMatch = string.split("\n").filter(function(str){
				if( $.trim(str) ){
					return true;
				}
				return false;
			});
		}else{
			PPC_MATCH.keysToMatch = [];
		}
	},

	// sets the keywords to filter variable
	// clean it before saving
	setkeysToFilterMatch: function( string ){
		if( $.trim(string) ){
			PPC_MATCH.keysToFilterMatch = string.split("\n").filter(function(str){
				if( $.trim(str) ){
					return true;
				}
				return false;
			});
		}else{
			PPC_MATCH.keysToFilterMatch = [];
		}
	},

	// sets the keywords to be matched variable
	// clean it before saving
	setkeysToBeMatched: function( string ){
		if( $.trim(string) ){
			PPC_MATCH.keysToBeMatched = PPC_MATCH.unique(string.split("\n"));
			PPC_MATCH.keysToBeMatchedString = PPC_MATCH.keysToBeMatched.join("\n");
		}else{
			PPC_MATCH.keysToBeMatched = [];
			PPC_MATCH.keysToBeMatchedString = "";
		}
	},

	isProcessing: function(){
		return PPC_MATCH.isProcessing;
	},

	isBroad: function( str ){
			return str.match()
	},

	isPhrase: function( str ){
		return str.match(/\".*?\"/);
	},

	isExact: function( str ){
		return str.match(/\[.*?\]/);
	},

	// funtiong that returns all unique term in an array
	// parameter @a = array
	unique : function (a) {
		return a.sort().filter(function(item, pos, ary) {
			if( !$.trim(item) ){
				return false;
			}
			return !pos || item != ary[pos - 1];
		})
	},

	// function that cleans a regular expression
	// works like preg_quote of php
	// parameter @str = string
	escapeRegExp : function(str) {
		return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	},

	// Checks and generates pattern expression
	// parameter @str = string
	clearKeywordAndRegEx: function( str ){
		var reg = "";
		var wordType = 1;
		if( PPC_MATCH.isExact(str) ){
			str = str.replace(/^\[|\]$/g, '');
			str = PPC_MATCH.escapeRegExp(str);
			reg = new RegExp("^("+str+")$","mgi");
			wordType = 3;
		}else if(PPC_MATCH.isPhrase(str)){
			str = str.replace(/^\"|\"$/g, '');
			str = PPC_MATCH.escapeRegExp(str);
			reg = new RegExp("^.*("+str+").*$","mgi");
			wordType = 2;
		}else{
			str = str.replace(/^\"|\"$/g, '');
			str = PPC_MATCH.escapeRegExp(str);
			var ptrn = "";

			var words = str.split(" ");
			for(i=0;i<words.length;i++){
				ptrn += "(?=.*\\b" + words[i] + "\\b)";
			}
			reg = new RegExp("^.*("+ptrn+").*$","mgi");
			//reg = ptrn + "/";
		}
		return {
			keyword : str,
			pattern : reg,
			wordType : wordType
		};
	},

	// main function/process that will filter/check matches on all inputs
	// parameter @keysToSearchArray = array , @keysToMatchString = array
	compareArray: function( keysToSearchArray , keysToMatchString ){
		var collected = [];
		for( var i = 0; i < keysToSearchArray.length ; i++ ){

			if( !PPC_MATCH.isProcessing ){
				break;
			}

			// generate appropriate regular expression pattern depending on the string
			var clean = PPC_MATCH.clearKeywordAndRegEx(keysToSearchArray[i]);

			try{

				console.log(clean);

				if( clean.keyword && clean.wordType != 1 ){
					var mtch = keysToMatchString.matchAll(clean.pattern);

					console.log("Pattern is " + clean.pattern);

					if( mtch ){
						for(var j = 0 ; j < mtch.length ; j++){

							if( !PPC_MATCH.isProcessing ){
								break;
							}

							// if keyword has no duplicate and the matched words is exactly inside the string
							if( !PPC_MATCH.in_array( mtch[j][0] , collected ) && (" "+mtch[j][0]+" ").indexOf(" "+mtch[j][1]+" ") >= 0 ){
								collected.push(mtch[j][0]);
							}
						}
					}
				}else if( clean.keyword && clean.wordType == 1 ){



					var mtch = keysToMatchString.match(clean.pattern);

					if( mtch ){
						for(var j = 0 ; j < mtch.length ; j++){

							if( !PPC_MATCH.isProcessing ){
								break;
							}

							// if keyword has no duplicate and the matched words is exactly inside the string
							if( !PPC_MATCH.in_array( mtch[j] , collected ) ){
								collected.push(mtch[j]);
							}
						}
					}
				}
			}catch(e){

			}

		}
		return collected;
	},

	// function that removes all negatives match from the final result
	removeNegativesFromMatch: function(){
		for( var i = 0; i < PPC_MATCH.negativeKeywords.length; i++){

			if( !PPC_MATCH.isProcessing ){
				break;
			}

			var index = PPC_MATCH.hasmatches.indexOf(PPC_MATCH.negativeKeywords[i]);
			if (index >= 0) {
				PPC_MATCH.hasmatches.splice( index, 1 );
			}
		}
	},

	// function that will transfer all negative matched keyword/phrases to the final result
	addNegativesToDontMatch: function(){
		for( var i = 0; i < PPC_MATCH.negativeKeywords.length; i++){

			if( !PPC_MATCH.isProcessing ){
				break;
			}

			var index = PPC_MATCH.nomatches.indexOf(PPC_MATCH.negativeKeywords[i]);
			if (index < 0) {
				PPC_MATCH.nomatches.push( PPC_MATCH.negativeKeywords[i] );
			}
		}
	},

	// function that triggers when keys are being pressed.
	match : function(){

		// tell the app that we have start processing
		PPC_MATCH.isProcessing = true;

		// call the main process
		PPC_MATCH.hasmatches = PPC_MATCH.compareArray(
			PPC_MATCH.keysToMatch,
			PPC_MATCH.keysToBeMatched.join("\n")
		);

		// let's check if there are keywords needs to be filtered
		// we dont want to add another process if there are no keywords to filter
		if( PPC_MATCH.keysToFilterMatch.length ){
			// set negative keywords variable to null
			PPC_MATCH.negativeKeywords = [];
			// call again the main process,
			// but give a different parameter
			PPC_MATCH.negativeKeywords = PPC_MATCH.compareArray(
				PPC_MATCH.keysToFilterMatch,
				PPC_MATCH.hasmatches.join("\n")
			);
			// remove negatives from result
			PPC_MATCH.removeNegativesFromMatch();
			// now that we have collected final result of negatives
			// add it in the "has no match" field
			PPC_MATCH.addNegativesToDontMatch();
		}

		// show final results of matched keywords
		$('#matchResult').val(PPC_MATCH.hasmatches.join("\n"))
			.next().find('span').text(PPC_MATCH.hasmatches.length);

		// gather strings that has no matches
		// let's check all keywords in the keyword list against the negative keywords
		for( var x = 0; x < PPC_MATCH.keysToBeMatched.length ; x++ ){
			if( !PPC_MATCH.isProcessing ){
				break;
			}
			if( !PPC_MATCH.in_array( PPC_MATCH.keysToBeMatched[x] , PPC_MATCH.hasmatches.concat(PPC_MATCH.negativeKeywords) ) ){
				PPC_MATCH.nomatches.push( PPC_MATCH.keysToBeMatched[x] );
			}
		}

		// show final results of has no matched keywords
		$('#dontMatchResult').text(PPC_MATCH.nomatches.join("\n"))
			.next().find('span').text(PPC_MATCH.nomatches.length);
		$('div.mask').hide();

	},

	in_array : function(needle, haystack) {
		var index = haystack.indexOf(needle);
		return index >= 0;
	},

};
// initialize the app script
PPC_MATCH.initialize();

// timeouts used for the keyup events
var timeout2= null;;
var timeout= null;;

// page loaded
$(document).ready(function(e){

	// on keydown event for textareas
	$('.live-keys').on('keydown',function(e){

		// tell the app to stop the process
		// keystrokes are too fast
		PPC_MATCH.stop();

		// we dont want to add the "Enter" key
		if( e.keyCode != 13 ){

			var ito = $(this);

			if( ito.attr('id') == 'keysToMatch' ){
				PPC_MATCH.keysToMatch = [];
			}
			if( ito.attr('id') == 'keysToBeMatched' ){
				PPC_MATCH.keysToBeMatchedString = "";
				PPC_MATCH.keysToBeMatched = [];
				$('#keysToBeMatchedCount>span').text($('#keysToBeMatched').val()?$('#keysToBeMatched').val().split("\n").length:0);
			}
			if( ito.attr('id') == 'keysToFilterMatch' ){
				PPC_MATCH.keysToFilterMatch = [];
			}
		}

	});

	// same as the keydown but we dont need to check the "Enter" key..
	// since we need to trigger this when user is focusing out of the textarea
	$('.live-keys').on('blur',function(e){
		var ito = $(this);
		if( ito.attr('id') == 'keysToMatch' ){
			PPC_MATCH.setkeysToMatch($('#keysToMatch').val());
		}
		if( ito.attr('id') == 'keysToBeMatched' ){
			PPC_MATCH.setkeysToBeMatched($('#keysToBeMatched').val());
			$('#keysToBeMatchedCount>span').text($('#keysToBeMatched').val()?$('#keysToBeMatched').val().split("\n").length:0);
		}
		if( ito.attr('id') == 'keysToFilterMatch' ){
			PPC_MATCH.setkeysToFilterMatch($('#keysToFilterMatch').val());
		}
	});

	// keyup event.  the actual gathering is here
	// user types very fast..  100 wpm
	$('.live-keys').on('keyup',function(e){

		// do not do anything if keypressed is the "Enter" key
		if( e.keyCode != 13 ){

			var ito = $(this);

			// now let's check if there is a pending process in the timeout
			if(timeout){
				// clear the timeout
				clearTimeout(timeout);
			}

			// set the timeout again to do the process
			timeout = setTimeout(function(){

				if( $.trim($('#keysToMatch').val()) && $.trim($('#keysToBeMatched').val()) ){
					$('div.mask').show();
				}
				PPC_MATCH.restart();

				if( ito.attr('id') == 'keysToMatch' ){
					PPC_MATCH.setkeysToMatch($('#keysToMatch').val());
				}
				if( ito.attr('id') == 'keysToBeMatched' ){
					PPC_MATCH.setkeysToBeMatched($('#keysToBeMatched').val());
					$('#keysToBeMatchedCount>span').text($('#keysToBeMatched').val()?$('#keysToBeMatched').val().split("\n").length:0);
				}
				if( ito.attr('id') == 'keysToFilterMatch' ){
					PPC_MATCH.setkeysToFilterMatch($('#keysToFilterMatch').val());
				}
				if( $.trim($('#keysToMatch').val()) && $.trim($('#keysToBeMatched').val()) ){
					if(timeout2){
						clearTimeout(timeout2);
					}
					timeout2 = setTimeout(function(){
						PPC_MATCH.match();
					},0);

				}

			},1000);

		}

	});
	// clicking on the word/link below the results textarea
	$('#resultsContainer label>span').click(function(e){
		e.preventDefault();
		var ito = $(this);
		copyToClipboard(ito.prev().val().split("\n"));
	});
});

// function that will copy an array to the clipboard
// parameter @arrays = array
function copyToClipboard(arrays){
	var str = arrays.join('\n');
	var hiddeninput = $("<textarea></textarea>");
	$("body").append(hiddeninput);
	hiddeninput.val(str).select();
	document.execCommand("copy");
	hiddeninput.remove();
	alert('Copied');
}